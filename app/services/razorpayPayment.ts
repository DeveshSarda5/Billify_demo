import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import * as Linking from 'expo-linking';
import { paymentAPI } from './api';
import { apiLogger, getApiBaseUrl } from '../config/apiConfig';
import type { RootStackParamList } from '../navigation/AppNavigator';

type Prefill = {
  name?: string;
  email?: string;
  phone?: string;
};

export type PaymentSuccess = {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
};

type AppNavigation = NativeStackNavigationProp<RootStackParamList>;

type PendingCheckout = {
  requestId: string;
  amountRupees: number;
  resolve: (value: PaymentSuccess) => void;
  reject: (reason?: unknown) => void;
};

export const RAZORPAY_TEST_CARD_MESSAGE =
  'Use Razorpay test mode with card 4111 1111 1111 1111, any future expiry, CVV 123, OTP 1234.';

let pendingCheckout: PendingCheckout | null = null;
let paymentLinkSubscription: { remove: () => void } | null = null;

function getErrorText(error: unknown) {
  if (!error) {
    return '';
  }

  if (typeof error === 'string') {
    return error;
  }

  if (typeof error === 'object') {
    const maybeError = error as { description?: string; message?: string; reason?: string };
    return maybeError.description || maybeError.message || maybeError.reason || '';
  }

  return '';
}

export function getReadableRazorpayError(error: unknown) {
  const message = getErrorText(error);
  const normalized = message.toLowerCase();

  if (normalized.includes('no appropriate payment method found')) {
    return 'Razorpay could not find a valid test-mode payment method. Confirm you are using an rzp_test_* key, a valid order_id, and the test card 4111 1111 1111 1111.';
  }

  if (
    normalized.includes('international card') ||
    normalized.includes('invalid card') ||
    normalized.includes('card details') ||
    normalized.includes('saved card') ||
    normalized.includes('card is not supported') ||
    normalized.includes('cards are not allowed')
  ) {
    return RAZORPAY_TEST_CARD_MESSAGE;
  }

  return message || 'Payment failed';
}

function nextRequestId() {
  return `rzp_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}

function rejectExistingCheckout() {
  if (!pendingCheckout) {
    return;
  }

  pendingCheckout.reject(new Error('A new payment was started before the previous one completed.'));
  paymentLinkSubscription?.remove();
  paymentLinkSubscription = null;
  pendingCheckout = null;
}

function encodeQueryValue(value: string) {
  return encodeURIComponent(value);
}

function buildHostedCheckoutUrl(params: {
  requestId: string;
  keyId: string;
  orderId: string;
  amount: number;
  currency: string;
  callbackUrl: string;
  prefill: Prefill;
}) {
  const baseUrl = `${getApiBaseUrl()}/payments/checkout`;
  const query = [
    `requestId=${encodeQueryValue(params.requestId)}`,
    `keyId=${encodeQueryValue(params.keyId)}`,
    `orderId=${encodeQueryValue(params.orderId)}`,
    `amount=${encodeQueryValue(String(params.amount))}`,
    `currency=${encodeQueryValue(params.currency)}`,
    `callbackUrl=${encodeQueryValue(params.callbackUrl)}`,
    `name=${encodeQueryValue(params.prefill.name || '')}`,
    `email=${encodeQueryValue(params.prefill.email || '')}`,
    `phone=${encodeQueryValue(params.prefill.phone || '')}`,
  ].join('&');

  return `${baseUrl}?${query}`;
}

function clearPendingCheckout() {
  paymentLinkSubscription?.remove();
  paymentLinkSubscription = null;
  pendingCheckout = null;
}

async function handlePaymentCallback(url: string) {
  if (!pendingCheckout) {
    return;
  }

  const parsed = Linking.parse(url);
  const queryParams = parsed.queryParams || {};
  const requestId = typeof queryParams.requestId === 'string' ? queryParams.requestId : '';

  if (requestId !== pendingCheckout.requestId) {
    return;
  }

  const status = typeof queryParams.status === 'string' ? queryParams.status : '';

  if (status === 'success') {
    await completeRazorpayWebCheckout(requestId, {
      razorpay_order_id: String(queryParams.razorpay_order_id || ''),
      razorpay_payment_id: String(queryParams.razorpay_payment_id || ''),
      razorpay_signature: String(queryParams.razorpay_signature || ''),
    });
    return;
  }

  cancelRazorpayWebCheckout(requestId, {
    code: status === 'cancelled' ? 0 : undefined,
    description: getReadableRazorpayError(queryParams.description || queryParams.message || 'Payment failed'),
  });
}

export async function openRazorpayWebCheckout(
  navigation: AppNavigation,
  amountRupees: number,
  prefill: Prefill = {},
): Promise<PaymentSuccess> {
  const envKey = (process.env.EXPO_PUBLIC_RAZORPAY_KEY_ID || '').trim();

  const apiBaseUrl = getApiBaseUrl();

  if (!apiBaseUrl.startsWith('https://')) {
    apiLogger.warn('Razorpay checkout works best with an HTTPS backend URL. Update EXPO_PUBLIC_API_BASE_URL to your active ngrok https URL.', {
      API_BASE_URL: apiBaseUrl,
    });
  }

  apiLogger.info('Creating Razorpay order...', { amountRupees, baseUrl: apiBaseUrl });
  const orderData = await paymentAPI.createOrder(amountRupees);
  const key = (orderData.key || envKey || '').trim();
  if (!key) {
    throw new Error('Missing Razorpay test key. Backend must return key and EXPO_PUBLIC_RAZORPAY_KEY_ID should also be set.');
  }
  const orderId = orderData.order_id || orderData.id;

  if (!orderId) {
    throw new Error('Backend did not return a Razorpay order id');
  }

  apiLogger.info('Razorpay order created', {
    key,
    orderId,
    orderResponse: orderData,
    amountPaise: orderData.amount,
    currency: orderData.currency,
  });

  rejectExistingCheckout();

  const requestId = nextRequestId();
  const callbackUrl = Linking.createURL('payment-callback');
  const checkoutUrl = buildHostedCheckoutUrl({
    requestId,
    keyId: key,
    orderId,
    amount: orderData.amount,
    currency: orderData.currency || 'INR',
    callbackUrl,
    prefill,
  });

  void navigation;

  return new Promise<PaymentSuccess>((resolve, reject) => {
    pendingCheckout = {
      requestId,
      amountRupees,
      resolve,
      reject,
    };

    paymentLinkSubscription?.remove();
    paymentLinkSubscription = Linking.addEventListener('url', ({ url }) => {
      handlePaymentCallback(url).catch((error) => {
        apiLogger.error('Payment callback handling failed', error);
        if (pendingCheckout?.requestId === requestId) {
          cancelRazorpayWebCheckout(requestId, { description: getReadableRazorpayError(error) });
        }
      });
    });

    apiLogger.info('Opening hosted Razorpay checkout URL', { checkoutUrl, key, orderId });

    Linking.openURL(checkoutUrl).catch((error) => {
      apiLogger.error('Failed to open hosted Razorpay checkout', error);
      cancelRazorpayWebCheckout(requestId, {
        description: 'Could not open payment browser. Check your backend URL and try again.',
      });
    });
  });
}

export async function completeRazorpayWebCheckout(requestId: string, data: PaymentSuccess) {
  if (!pendingCheckout || pendingCheckout.requestId !== requestId) {
    throw new Error('No matching Razorpay checkout is active');
  }

  const activeCheckout = pendingCheckout;

  try {
    apiLogger.info('Razorpay payment success', {
      paymentId: data.razorpay_payment_id,
      orderId: data.razorpay_order_id,
    });

    apiLogger.info('Verifying payment signature...');
    await paymentAPI.verifyPayment({
      razorpay_order_id: data.razorpay_order_id,
      razorpay_payment_id: data.razorpay_payment_id,
      razorpay_signature: data.razorpay_signature,
      amount: activeCheckout.amountRupees,
    });

    activeCheckout.resolve(data);
  } catch (error) {
    activeCheckout.reject(error);
    throw error;
  } finally {
    clearPendingCheckout();
  }
}

export function cancelRazorpayWebCheckout(requestId: string, error?: unknown) {
  if (!pendingCheckout || pendingCheckout.requestId !== requestId) {
    return;
  }

  pendingCheckout.reject(error || new Error('Payment was cancelled'));
  clearPendingCheckout();
}

export async function handlePayment(
  navigation: AppNavigation,
  amountRupees: number,
  prefill: Prefill = {},
): Promise<PaymentSuccess> {
  return openRazorpayWebCheckout(navigation, amountRupees, prefill);
}
