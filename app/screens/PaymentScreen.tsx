import { ActivityIndicator, Alert, Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { useState } from 'react';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import AppButton from '../components/ui/AppButton';
import AppCard from '../components/ui/AppCard';
import AppHeader from '../components/ui/AppHeader';
import Screen from '../components/ui/Screen';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useAppTheme } from '../context/ThemeContext';
import { RootStackParamList } from '../navigation/AppNavigator';
import { billsAPI } from '../services/api';
import { getReadableRazorpayError, openRazorpayWebCheckout } from '../services/razorpayPayment';

type Props = NativeStackScreenProps<RootStackParamList, 'Payment'>;

const PAYMENT_OPTIONS = [
  { id: 'razorpay', label: 'Online Payment (Razorpay Test Mode)' },
  { id: 'cod', label: 'Cash at Counter' },
];

export default function PaymentScreen({ route, navigation }: Props) {
  const total = route.params?.total ?? 0;
  const { items, clearCart } = useCart();
  const { user } = useAuth();
  const { colors } = useAppTheme();

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
      navigation.navigate('ExitPass', {
        billId,
        amountPaid: total,
        issuedAt: new Date().toISOString(),
      });
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
    <Screen padded={false}>
      <View style={styles.inner}>
        <AppHeader
          title="Payment"
          subtitle="Review the total and choose how you want to complete this purchase."
          onBack={() => navigation.goBack()}
        />
      </View>
      <View style={styles.content}>
        <AppCard>
          <Text style={[styles.amountLabel, { color: colors.textMuted }]}>Amount to Pay</Text>
          <Text style={[styles.amount, { color: colors.text }]}>₹{total}</Text>
          <Text style={[styles.testHint, { color: colors.warningText, backgroundColor: colors.warningBg }]}>
            Test card: 4111 1111 1111 1111. Use any future expiry, CVV 123, OTP 1234. Make sure EXPO_PUBLIC_API_BASE_URL points to your active HTTPS ngrok /api URL.
          </Text>
        </AppCard>

        <Pressable onPress={() => setShowModal(true)}>
          <AppCard>
            <Text style={[styles.methodTitle, { color: colors.text }]}>Payment Method</Text>
            <Text style={[styles.methodValue, { color: selectedMethod ? colors.textMuted : colors.textSoft }]}>
              {selectedMethod
                ? PAYMENT_OPTIONS.find((option) => option.id === selectedMethod)?.label
                : 'Select Payment Method'}
            </Text>
          </AppCard>
        </Pressable>

        <AppButton onPress={handlePayment} disabled={!selectedMethod || processing} loading={processing}>
          {selectedMethod === 'cod' ? 'Generate Bill' : `Pay ₹${total}`}
        </AppButton>
      </View>

      <Modal visible={showModal} animationType="slide" transparent>
        <View style={[styles.modalBackdrop, { backgroundColor: colors.overlay }]}> 
          <View style={[styles.modal, { backgroundColor: colors.card, borderColor: colors.border }]}> 
            <Text style={[styles.modalTitle, { color: colors.text }]}>Choose Payment Method</Text>

            {PAYMENT_OPTIONS.map((opt) => {
              const active = selectedMethod === opt.id;
              return (
                <Pressable
                  key={opt.id}
                  style={[styles.option, { borderColor: colors.border, backgroundColor: active ? colors.chip : colors.cardAlt }]}
                  onPress={() => {
                    setSelectedMethod(opt.id);
                    setShowModal(false);
                  }}
                >
                  <Text style={[styles.optionText, { color: colors.text }]}>{opt.label}</Text>
                </Pressable>
              );
            })}

            <AppButton variant="secondary" onPress={() => setShowModal(false)}>
              Cancel
            </AppButton>
          </View>
        </View>
      </Modal>
    </Screen>
  );
}

/* ---------- Styles ---------- */
const styles = StyleSheet.create({
  inner: {
    paddingHorizontal: 16,
    paddingTop: 10,
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 100,
  },
  amountLabel: {
    fontSize: 14,
  },
  amount: {
    fontSize: 28,
    fontWeight: '800',
    marginTop: 6,
  },
  testHint: {
    marginTop: 12,
    fontSize: 12,
    lineHeight: 18,
    borderRadius: 10,
    padding: 10,
  },
  methodTitle: {
    fontWeight: '700',
    fontSize: 15,
  },
  methodValue: {
    marginTop: 4,
    fontSize: 13,
  },
  modalBackdrop: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modal: {
    padding: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderWidth: 1,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 14,
  },
  option: {
    paddingVertical: 14,
    paddingHorizontal: 14,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 10,
  },
  optionText: {
    fontSize: 16,
  },
});
