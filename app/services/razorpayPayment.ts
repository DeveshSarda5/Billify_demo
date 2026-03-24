import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { paymentAPI } from './api';
import { apiLogger } from '../config/apiConfig';
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

let pendingCheckout: PendingCheckout | null = null;

function nextRequestId() {
  return `rzp_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}

function rejectExistingCheckout() {
  if (!pendingCheckout) {
    return;
  }

  pendingCheckout.reject(new Error('A new payment was started before the previous one completed.'));
  pendingCheckout = null;
}

export async function openRazorpayWebCheckout(
  navigation: AppNavigation,
  amountRupees: number,
  prefill: Prefill = {},
): Promise<PaymentSuccess> {
  const key = (process.env.EXPO_PUBLIC_RAZORPAY_KEY_ID || '').trim();
  if (!key) {
    throw new Error('Missing EXPO_PUBLIC_RAZORPAY_KEY_ID');
  }

  apiLogger.info('💳 Creating Razorpay order...', { amountRupees });
  const orderData = await paymentAPI.createOrder(amountRupees);
  const orderId = orderData.order_id || orderData.id;

  if (!orderId) {
    throw new Error('Backend did not return a Razorpay order id');
  }

  apiLogger.info('💳 Razorpay order created', {
    orderId,
    amountPaise: orderData.amount,
    currency: orderData.currency,
  });

  rejectExistingCheckout();

  const requestId = nextRequestId();

  return new Promise<PaymentSuccess>((resolve, reject) => {
    pendingCheckout = {
      requestId,
      amountRupees,
      resolve,
      reject,
    };

    navigation.navigate('RazorpayCheckout', {
      requestId,
      keyId: key,
      orderId,
      amount: orderData.amount,
      amountRupees,
      currency: orderData.currency || 'INR',
      prefill,
    });
  });
}

export async function completeRazorpayWebCheckout(requestId: string, data: PaymentSuccess) {
  if (!pendingCheckout || pendingCheckout.requestId !== requestId) {
    throw new Error('No matching Razorpay checkout is active');
  }

  try {
    apiLogger.info('✅ Razorpay payment success', {
      paymentId: data.razorpay_payment_id,
      orderId: data.razorpay_order_id,
    });

    apiLogger.info('🔐 Verifying payment signature...');
    await paymentAPI.verifyPayment({
      razorpay_order_id: data.razorpay_order_id,
      razorpay_payment_id: data.razorpay_payment_id,
      razorpay_signature: data.razorpay_signature,
      amount: pendingCheckout.amountRupees,
    });

    pendingCheckout.resolve(data);
  } catch (error) {
    pendingCheckout.reject(error);
    throw error;
  } finally {
    pendingCheckout = null;
  }
}

export function cancelRazorpayWebCheckout(requestId: string, error?: unknown) {
  if (!pendingCheckout || pendingCheckout.requestId !== requestId) {
    return;
  }

  pendingCheckout.reject(error || new Error('Payment was cancelled'));
  pendingCheckout = null;
}

export async function handlePayment(
  navigation: AppNavigation,
  amountRupees: number,
  prefill: Prefill = {},
): Promise<PaymentSuccess> {
  return openRazorpayWebCheckout(navigation, amountRupees, prefill);
}
