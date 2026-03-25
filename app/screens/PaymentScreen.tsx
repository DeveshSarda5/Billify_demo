import { View, Text, StyleSheet, Pressable, Modal, Alert, ActivityIndicator } from 'react-native';
import { useState } from 'react';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { useCart } from '../context/CartContext';
import { billsAPI } from '../services/api';
import { getReadableRazorpayError, openRazorpayWebCheckout } from '../services/razorpayPayment';
import { useAuth } from '../context/AuthContext';
import LocationHeader from '../components/LocationHeader';

type Props = NativeStackScreenProps<RootStackParamList, 'Payment'>;

const PAYMENT_OPTIONS = [
  { id: 'razorpay', label: 'Online Payment (Razorpay Test Mode)' },
  { id: 'cod', label: 'Cash at Counter' },
];

export default function PaymentScreen({ route, navigation }: Props) {
  const total = route.params?.total ?? 0;
  const { items, clearCart } = useCart();
  const { user } = useAuth();

  const [showModal, setShowModal] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);

  const processBillCreation = async (paymentId?: string) => {
    try {
      const billItems = items.map((item) => ({
        productId: item.barcode,
        name: item.name,
        price: item.price,
        quantity: item.qty ?? 1,
      }));

      const response = await billsAPI.createBill({ items: billItems });
      const billId = response._id || response.id;

      clearCart();
      Alert.alert('Success', 'Bill generated successfully!');
      navigation.navigate('ExitPass', { billId });
    } catch (err: any) {
      Alert.alert('Error', 'Payment successful but bill generation failed. Contact support.');
    }
  };

  const handlePayment = async () => {
    if (!selectedMethod || processing) return;
    setProcessing(true);

    try {
      if (selectedMethod === 'razorpay') {
        const data = await openRazorpayWebCheckout(navigation, total, {
          email: user?.email,
          phone: user?.phone,
          name: user?.name,
        });

        Alert.alert('Payment Successful', `Payment ID: ${data.razorpay_payment_id}`);
        console.log('[Payment] Success payment_id:', data.razorpay_payment_id);

        await processBillCreation(data.razorpay_payment_id);
      } else {
        await processBillCreation();
      }
    } catch (error: any) {
      if (error.code === 0) {
        Alert.alert('Cancelled', 'Payment was cancelled');
      } else {
        Alert.alert('Payment Failed', getReadableRazorpayError(error));
        console.log('[Payment] Failed:', error);
      }
    } finally {
      setProcessing(false);
    }
  };

  return (
    <View style={styles.container}>
      <LocationHeader />
      <Text style={styles.title}>Payment</Text>

      {/* Amount Card */}
      <View style={styles.amountCard}>
        <Text style={styles.amountLabel}>Amount to Pay</Text>
        <Text style={styles.amount}>₹{total}</Text>
        <Text style={styles.testHint}>
          Test card: 4111 1111 1111 1111. Use any future expiry, CVV 123, OTP 1234. Make sure EXPO_PUBLIC_API_BASE_URL points to your active HTTPS ngrok /api URL.
        </Text>
      </View>

      {/* Payment Method */}
      <Pressable style={styles.methodCard} onPress={() => setShowModal(true)}>
        <Text style={styles.methodTitle}>Payment Method</Text>
        <Text style={styles.methodValue}>
          {selectedMethod
            ? PAYMENT_OPTIONS.find(o => o.id === selectedMethod)?.label
            : 'Select Payment Method'}
        </Text>
      </Pressable>

      {/* Pay Button */}
      <Pressable
        style={[
          styles.payBtn,
          (!selectedMethod || processing) && { opacity: 0.5 },
        ]}
        disabled={!selectedMethod || processing}
        onPress={handlePayment}
      >
        {processing ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.payText}>
            {selectedMethod === 'cod' ? 'Generate Bill' : `Pay ₹${total}`}
          </Text>
        )}
      </Pressable>

      {/* ---------- METHOD MODAL ---------- */}
      <Modal visible={showModal} animationType="slide" transparent>
        <View style={styles.modalBackdrop}>
          <View style={styles.modal}>
            <Text style={styles.modalTitle}>Choose Payment Method</Text>

            {PAYMENT_OPTIONS.map((opt) => (
              <Pressable
                key={opt.id}
                style={styles.upiOption}
                onPress={() => {
                  setSelectedMethod(opt.id);
                  setShowModal(false);
                }}
              >
                <Text style={styles.upiText}>{opt.label}</Text>
              </Pressable>
            ))}

            <Pressable
              style={styles.cancelBtn}
              onPress={() => setShowModal(false)}
            >
              <Text style={styles.cancelText}>Cancel</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

    </View>
  );
}

/* ---------- Styles ---------- */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f9fafb',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  amountCard: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 16,
    marginBottom: 20,
  },
  amountLabel: {
    color: '#6b7280',
  },
  amount: {
    fontSize: 28,
    fontWeight: 'bold',
    marginTop: 6,
  },
  testHint: {
    marginTop: 12,
    fontSize: 12,
    lineHeight: 18,
    color: '#92400e',
    backgroundColor: '#fffbeb',
    borderRadius: 10,
    padding: 10,
  },
  methodCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 16,
    marginBottom: 30,
  },
  methodTitle: {
    fontWeight: '600',
  },
  methodValue: {
    color: '#6b7280',
    marginTop: 4,
  },
  payBtn: {
    backgroundColor: '#22c55e',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  payText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },

  /* Modal */
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  modal: {
    backgroundColor: '#fff',
    padding: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 14,
  },
  upiOption: {
    paddingVertical: 14,
  },
  upiText: {
    fontSize: 16,
  },
  cancelBtn: {
    marginTop: 10,
    alignItems: 'center',
  },
  cancelText: {
    color: '#ef4444',
    fontWeight: '600',
  },
});
