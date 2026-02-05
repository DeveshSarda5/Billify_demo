import { View, Text, StyleSheet, Pressable, Modal, Alert } from 'react-native';
import { useState } from 'react';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { useCart } from '../context/CartContext';
import { billsAPI } from '../services/api';

type Props = NativeStackScreenProps<RootStackParamList, 'Payment'>;

const UPI_OPTIONS = [
  { id: 'gpay', label: 'Google Pay' },
  { id: 'phonepe', label: 'PhonePe' },
  { id: 'paytm', label: 'Paytm' },
  { id: 'upi', label: 'Enter UPI ID' },
];

export default function PaymentScreen({ route, navigation }: Props) {
  const total = route.params?.total ?? 0;
  const { items, clearCart } = useCart();

  const [showModal, setShowModal] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);

  const handlePayment = async () => {
    if (!selectedMethod || processing) return;

    setProcessing(true);

    try {
      // ✅ SAFELY BUILD BILL ITEMS (NO UNDEFINED VALUES)
      const billItems = items.map((item) => ({
        productId: item.barcode,          // barcode used as productId (DEV)
        name: item.name,
        price: item.price,
        quantity: item.qty ?? 1,          // 🔥 quantity is the field name on backend
      }));

      // ✅ CREATE BILL IN BACKEND
      await billsAPI.createBill({ items: billItems });

      // ✅ SUCCESS
      clearCart();
      Alert.alert('Payment Successful', 'Your bill has been generated.');
      navigation.navigate('ExitPass');
    } catch (err: any) {
      Alert.alert(
        'Payment Failed',
        err.message || 'Something went wrong. Please try again.'
      );
    } finally {
      setProcessing(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Payment</Text>

      {/* Amount Card */}
      <View style={styles.amountCard}>
        <Text style={styles.amountLabel}>Amount to Pay</Text>
        <Text style={styles.amount}>₹{total}</Text>
      </View>

      {/* Payment Method */}
      <Pressable style={styles.methodCard} onPress={() => setShowModal(true)}>
        <Text style={styles.methodTitle}>Payment Method</Text>
        <Text style={styles.methodValue}>
          {selectedMethod ?? 'Select UPI method'}
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
        <Text style={styles.payText}>
          {processing ? 'Processing...' : `Pay ₹${total}`}
        </Text>
      </Pressable>

      {/* ---------- UPI MODAL ---------- */}
      <Modal visible={showModal} animationType="slide" transparent>
        <View style={styles.modalBackdrop}>
          <View style={styles.modal}>
            <Text style={styles.modalTitle}>Choose UPI</Text>

            {UPI_OPTIONS.map((opt) => (
              <Pressable
                key={opt.id}
                style={styles.upiOption}
                onPress={() => {
                  setSelectedMethod(opt.label);
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
