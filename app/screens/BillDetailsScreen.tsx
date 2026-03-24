import { View, Text, StyleSheet, Pressable, ScrollView, Alert } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { ArrowLeft } from 'lucide-react-native';
import { useState } from 'react';
import { getRandomWatermark } from '../utils/locationUtils';
import { useAuth } from '../context/AuthContext';
import { openRazorpayWebCheckout } from '../services/razorpayPayment';
import { billsAPI } from '../services/api';

type Props = NativeStackScreenProps<RootStackParamList, 'BillDetails'>;

interface Bill {
  _id: string;
  totalAmount: number;
  createdAt: string;
  paymentStatus: string;
  items: Array<{
    name: string;
    price: number;
    quantity: number;
  }>;
  subtotal?: number;
  tax?: number;
  exitPass?: string | null;
}

type ItemSortType = 'price' | 'quantity';
type SortOrder = 'asc' | 'desc';

export default function BillDetailsScreen({ route, navigation }: Props) {
  const { bill } = route.params as { bill: Bill };
  const [currentBill, setCurrentBill] = useState<Bill>(bill);
  const [itemSortType, setItemSortType] = useState<ItemSortType>('price');
  const [itemSortOrder, setItemSortOrder] = useState<SortOrder>('desc');
  const [watermark] = useState(getRandomWatermark());
  const { user } = useAuth();
  const [paying, setPaying] = useState(false);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getSortedItems = () => {
    const sorted = [...(currentBill.items || [])].sort((a, b) => {
      let compareValue = 0;
      
      if (itemSortType === 'price') {
        compareValue = a.price - b.price;
      } else {
        compareValue = a.quantity - b.quantity;
      }
      
      return itemSortOrder === 'asc' ? compareValue : -compareValue;
    });
    
    return sorted;
  };

  const onPayNow = async () => {
    if (paying || currentBill.paymentStatus === 'paid') return;
    setPaying(true);
    try {
      const payment = await openRazorpayWebCheckout(navigation, currentBill.totalAmount, {
        email: user?.email,
        phone: user?.phone,
        name: user?.name,
      });

      console.log('[BillDetails] Payment success payment_id:', payment.razorpay_payment_id);
      Alert.alert('Payment Successful', `Payment ID: ${payment.razorpay_payment_id}`);

      const response = await billsAPI.markBillPaid(currentBill._id);
      if (response?.bill) {
        setCurrentBill(response.bill as any);
      } else {
        setCurrentBill({ ...currentBill, paymentStatus: 'paid' });
      }
    } catch (error: any) {
      if (error?.code === 0) {
        Alert.alert('Cancelled', 'Payment was cancelled');
      } else {
        Alert.alert('Payment Failed', error?.description || error?.message || 'Payment failed');
      }
      console.log('[BillDetails] Payment failed:', error);
    } finally {
      setPaying(false);
    }
  };

  const toggleItemSort = (newSortType: ItemSortType) => {
    if (itemSortType === newSortType) {
      setItemSortOrder(itemSortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setItemSortType(newSortType);
      setItemSortOrder('desc');
    }
  };

  return (
    <ScrollView style={styles.container}>
      {/* Watermark Overlay */}
      <View style={styles.watermarkContainer}>
        <Text style={styles.watermarkText}>{watermark}</Text>
      </View>

      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()}>
          <ArrowLeft size={24} color="#1f2937" />
        </Pressable>
        <Text style={styles.headerTitle}>Bill Details</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Bill Summary */}
      <View style={styles.card}>
        <Text style={styles.label}>Bill ID</Text>
        <Text style={styles.value}>{currentBill._id.substring(0, 12)}...</Text>

        <Text style={[styles.label, { marginTop: 16 }]}>Date</Text>
        <Text style={styles.value}>{formatDate(currentBill.createdAt)}</Text>

        <Text style={[styles.label, { marginTop: 16 }]}>Status</Text>
        <Text style={[styles.value, { color: currentBill.paymentStatus === 'paid' ? '#22c55e' : '#f97316' }]}>
          {currentBill.paymentStatus === 'paid' ? '✓ Paid' : '⏳ Pending'}
        </Text>
      </View>

      {currentBill.paymentStatus !== 'paid' && (
        <View style={styles.section}>
          <Pressable
            style={[styles.payNowBtn, paying && { opacity: 0.6 }]}
            disabled={paying}
            onPress={onPayNow}
          >
            <Text style={styles.payNowText}>{paying ? 'Processing...' : `Pay Now ₹${currentBill.totalAmount.toFixed(2)}`}</Text>
          </Pressable>
        </View>
      )}

      {/* Items */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Items</Text>
          <View style={styles.sortButtonsContainer}>
            <Pressable
              style={[styles.sortItemBtn, itemSortType === 'price' && styles.activeSortItemBtn]}
              onPress={() => toggleItemSort('price')}
            >
              <Text style={[styles.sortItemBtnText, itemSortType === 'price' && styles.activeSortItemBtnText]}>
                Price {itemSortType === 'price' && (itemSortOrder === 'asc' ? '↑' : '↓')}
              </Text>
            </Pressable>
            <Pressable
              style={[styles.sortItemBtn, itemSortType === 'quantity' && styles.activeSortItemBtn]}
              onPress={() => toggleItemSort('quantity')}
            >
              <Text style={[styles.sortItemBtnText, itemSortType === 'quantity' && styles.activeSortItemBtnText]}>
                Qty {itemSortType === 'quantity' && (itemSortOrder === 'asc' ? '↑' : '↓')}
              </Text>
            </Pressable>
          </View>
        </View>
        <View style={styles.itemsCard}>
          <View style={styles.itemHeader}>
            <Text style={[styles.itemText, styles.itemName]}>Item</Text>
            <Text style={[styles.itemText, styles.itemQty]}>Qty</Text>
            <Text style={[styles.itemText, styles.itemPrice]}>Price</Text>
          </View>
          {getSortedItems().map((item, idx) => (
            <View key={idx} style={styles.itemRow}>
              <Text style={[styles.itemValue, styles.itemName]} numberOfLines={1}>{item.name}</Text>
              <Text style={[styles.itemValue, styles.itemQty]}>{item.quantity}</Text>
              <Text style={[styles.itemValue, styles.itemPrice]}>₹{(item.price * item.quantity).toFixed(2)}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Totals */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Totals</Text>
        <View style={styles.totalsCard}>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Subtotal:</Text>
            <Text style={styles.totalValue}>₹{(currentBill.subtotal || currentBill.totalAmount).toFixed(2)}</Text>
          </View>
          {currentBill.tax !== undefined && currentBill.tax > 0 && (
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Tax (GST):</Text>
              <Text style={styles.totalValue}>₹{currentBill.tax.toFixed(2)}</Text>
            </View>
          )}
          <View style={[styles.totalRow, styles.grandTotalRow]}>
            <Text style={styles.grandTotalLabel}>Total Amount:</Text>
            <Text style={styles.grandTotalValue}>₹{currentBill.totalAmount.toFixed(2)}</Text>
          </View>
        </View>
      </View>

      {/* Exit Pass (if paid) */}
      {currentBill.paymentStatus === 'paid' && currentBill.exitPass && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Exit Pass</Text>
          <View style={[styles.card, styles.exitPassCard]}>
            <Text style={styles.success}>✅ Payment Successful</Text>
            <Text style={styles.passIdLabel}>Pass ID</Text>
            <Text style={styles.passId}>{currentBill.exitPass}</Text>
            <Text style={styles.passNote}>Show this at the exit gate</Text>
          </View>
        </View>
      )}

      <View style={styles.footer} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  watermarkContainer: {
    position: 'absolute',
    top: '30%',
    left: '50%',
    zIndex: 0,
    opacity: 0.08,
  },
  watermarkText: {
    fontSize: 100,
    fontWeight: 'bold',
    color: '#000',
    transform: [{ rotate: '-45deg' }],
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
  },
  section: {
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
  },
  sortButtonsContainer: {
    flexDirection: 'row',
    gap: 6,
  },
  sortItemBtn: {
    backgroundColor: '#e5e7eb',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 6,
  },
  activeSortItemBtn: {
    backgroundColor: '#4caf50',
  },
  sortItemBtnText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#6b7280',
  },
  activeSortItemBtnText: {
    color: '#fff',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    margin: 16,
    marginBottom: 0,
  },
  itemsCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
  },
  totalsCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
  },
  payNowBtn: {
    backgroundColor: '#22c55e',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  payNowText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  exitPassCard: {
    alignItems: 'center',
    margin: 0,
  },
  label: {
    color: '#6b7280',
    fontSize: 14,
    marginBottom: 4,
  },
  value: {
    fontWeight: '600',
    fontSize: 16,
    color: '#1f2937',
  },
  itemHeader: {
    flexDirection: 'row',
    marginBottom: 12,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  itemRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  itemText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6b7280',
  },
  itemValue: {
    fontSize: 13,
    color: '#1f2937',
  },
  itemName: {
    flex: 1,
  },
  itemQty: {
    width: 50,
    textAlign: 'center',
  },
  itemPrice: {
    width: 80,
    textAlign: 'right',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  grandTotalRow: {
    borderBottomWidth: 0,
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  totalLabel: {
    color: '#6b7280',
    fontSize: 14,
  },
  totalValue: {
    fontWeight: '600',
    color: '#1f2937',
  },
  grandTotalLabel: {
    color: '#1f2937',
    fontSize: 16,
    fontWeight: '700',
  },
  grandTotalValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#4caf50',
  },
  success: {
    fontSize: 16,
    fontWeight: '600',
    color: '#22c55e',
    marginBottom: 12,
  },
  passIdLabel: {
    color: '#6b7280',
    fontSize: 12,
    marginTop: 8,
  },
  passId: {
    fontSize: 28,
    fontWeight: 'bold',
    marginTop: 4,
    color: '#1f2937',
  },
  passNote: {
    color: '#6b7280',
    fontSize: 12,
    marginTop: 12,
    textAlign: 'center',
  },
  footer: {
    height: 20,
  },
});