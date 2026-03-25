import { ActivityIndicator, Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { useEffect, useMemo, useRef, useState } from 'react';
import { WebView } from 'react-native-webview';
import type { WebViewMessageEvent, WebViewNavigation } from 'react-native-webview/lib/WebViewTypes';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ArrowLeft } from 'lucide-react-native';
import type { RootStackParamList } from '../navigation/AppNavigator';
import {
  cancelRazorpayWebCheckout,
  completeRazorpayWebCheckout,
  getReadableRazorpayError,
  type PaymentSuccess,
} from '../services/razorpayPayment';
import { apiLogger } from '../config/apiConfig';

type Props = NativeStackScreenProps<RootStackParamList, 'RazorpayCheckout'>;

type CheckoutMessage =
  | { type: 'opened' }
  | { type: 'success'; payload: PaymentSuccess }
  | { type: 'failed'; payload?: { code?: string; description?: string; reason?: string } }
  | { type: 'dismiss'; payload?: { description?: string } };

function buildCheckoutHtml(params: Props['route']['params']) {
  const options = {
    key: params.keyId,
    amount: params.amount,
    currency: params.currency,
    name: 'Billify',
    description: 'Test Payment',
    order_id: params.orderId,
    prefill: {
      name: params.prefill?.name || '',
      email: params.prefill?.email || '',
      contact: params.prefill?.phone || '',
    },
    theme: { color: '#3399cc' },
  };

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0" />
        <style>
          body {
            margin: 0;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            background: #f3f4f6;
            color: #111827;
            display: flex;
            align-items: center;
            justify-content: center;
            min-height: 100vh;
          }
          .card {
            width: calc(100% - 32px);
            max-width: 420px;
            background: #ffffff;
            border-radius: 20px;
            padding: 24px;
            box-sizing: border-box;
            box-shadow: 0 18px 60px rgba(15, 23, 42, 0.12);
          }
          h1 {
            margin: 0 0 8px;
            font-size: 24px;
          }
          p {
            margin: 0;
            color: #4b5563;
            line-height: 1.5;
          }
        </style>
      </head>
      <body>
        <div class="card">
          <h1>Opening Razorpay</h1>
          <p>Wait while Billify launches secure checkout.</p>
          <p style="margin-top:12px; font-size:13px; color:#92400e; background:#fffbeb; padding:12px; border-radius:12px;">
            Test card: 4111 1111 1111 1111. Use any future expiry, CVV 123, OTP 1234.
          </p>
        </div>
        <script src="https://checkout.razorpay.com/v1/checkout.js"></script>
        <script>
          const sendMessage = (type, payload) => {
            if (!window.ReactNativeWebView) {
              return;
            }

            window.ReactNativeWebView.postMessage(JSON.stringify({ type, payload }));
          };

          const options = ${JSON.stringify(options)};
          console.log('Billify Razorpay WebView checkout init', {
            key: options.key,
            order_id: options.order_id,
            amount: options.amount,
            currency: options.currency,
          });
          options.handler = function (response) {
            sendMessage('success', response);
          };
          options.modal = {
            ondismiss: function () {
              sendMessage('dismiss', { description: 'Payment was cancelled' });
            },
          };

          const razorpay = new Razorpay(options);
          razorpay.on('payment.failed', function (response) {
            sendMessage('failed', response.error || { description: 'Payment failed' });
          });

          window.onload = function () {
            sendMessage('opened');
            setTimeout(function () {
              razorpay.open();
            }, 250);
          };
        </script>
      </body>
    </html>
  `;
}

export default function RazorpayCheckoutScreen({ route, navigation }: Props) {
  const { requestId } = route.params;
  const [loading, setLoading] = useState(true);
  const [finishing, setFinishing] = useState(false);
  const handledRef = useRef(false);
  const html = useMemo(() => buildCheckoutHtml(route.params), [route.params]);

  useEffect(() => {
    return () => {
      if (!handledRef.current) {
        cancelRazorpayWebCheckout(requestId, { code: 0, description: 'Payment was cancelled' });
      }
    };
  }, [requestId]);

  const closeWithCancel = () => {
    if (!handledRef.current) {
      handledRef.current = true;
      cancelRazorpayWebCheckout(requestId, { code: 0, description: 'Payment was cancelled' });
    }
    navigation.goBack();
  };

  const handleMessage = async (event: WebViewMessageEvent) => {
    let message: CheckoutMessage;

    try {
      message = JSON.parse(event.nativeEvent.data);
    } catch (error) {
      apiLogger.error('Failed to parse Razorpay WebView message', error);
      return;
    }

    if (message.type === 'opened') {
      setLoading(false);
      return;
    }

    if (handledRef.current) {
      return;
    }

    if (message.type === 'success') {
      handledRef.current = true;
      setFinishing(true);

      try {
        await completeRazorpayWebCheckout(requestId, message.payload);
        navigation.goBack();
      } catch (error: any) {
        Alert.alert('Verification Failed', error?.message || 'Could not verify payment');
        navigation.goBack();
      } finally {
        setFinishing(false);
      }
      return;
    }

    if (message.type === 'failed') {
      handledRef.current = true;
      cancelRazorpayWebCheckout(requestId, {
        code: message.payload?.code,
        description: getReadableRazorpayError(message.payload),
      });
      navigation.goBack();
      return;
    }

    if (message.type === 'dismiss') {
      handledRef.current = true;
      cancelRazorpayWebCheckout(requestId, {
        code: 0,
        description: message.payload?.description || 'Payment was cancelled',
      });
      navigation.goBack();
    }
  };

  const handleNavigationChange = (state: WebViewNavigation) => {
    if (state.loading) {
      return;
    }
    setLoading(false);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={closeWithCancel} style={styles.iconButton}>
          <ArrowLeft size={22} color="#111827" />
        </Pressable>
        <Text style={styles.title}>Secure Payment</Text>
        <View style={styles.spacer} />
      </View>

      <WebView
        originWhitelist={["*"]}
        source={{ html }}
        onMessage={handleMessage}
        onLoadEnd={() => setLoading(false)}
        onNavigationStateChange={handleNavigationChange}
        javaScriptEnabled
        domStorageEnabled
        startInLoadingState
        thirdPartyCookiesEnabled
        sharedCookiesEnabled
        cacheEnabled={false}
        incognito
      />

      {(loading || finishing) && (
        <View style={styles.overlay}>
          <ActivityIndicator size="large" color="#22c55e" />
          <Text style={styles.overlayText}>
            {finishing ? 'Verifying payment...' : 'Preparing checkout...'}
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f3f4f6',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f3f4f6',
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  spacer: {
    width: 40,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.82)',
    gap: 12,
  },
  overlayText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
});