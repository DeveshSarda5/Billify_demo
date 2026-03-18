import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { ArrowLeft } from 'lucide-react-native';

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

export default function BillDetailsScreen({ route, navigation }: Props) {
  const { bill } = route.params as { bill: Bill };

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

  return (
    <ScrollView style={styles.container}>
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
        <Text style={styles.value}>{bill._id.substring(0, 12)}...</Text>

        <Text style={[styles.label, { marginTop: 16 }]}>Date</Text>
        <Text style={styles.value}>{formatDate(bill.createdAt)}</Text>

        <Text style={[styles.label, { marginTop: 16 }]}>Status</Text>
        <Text style={[styles.value, { color: bill.paymentStatus === 'paid' ? '#22c55e' : '#f97316' }]}>
          {bill.paymentStatus === 'paid' ? '✓ Paid' : '⏳ Pending'}
        </Text>
      </View>

      {/* Items */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Items</Text>
        <View style={styles.itemsCard}>
          <View style={styles.itemHeader}>
            <Text style={[styles.itemText, styles.itemName]}>Item</Text>
            <Text style={[styles.itemText, styles.itemQty]}>Qty</Text>
            <Text style={[styles.itemText, styles.itemPrice]}>Price</Text>
          </View>
          {bill.items && bill.items.map((item, idx) => (
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
            <Text style={styles.totalValue}>₹{(bill.subtotal || bill.totalAmount).toFixed(2)}</Text>
          </View>
          {bill.tax !== undefined && bill.tax > 0 && (
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Tax (GST):</Text>
              <Text style={styles.totalValue}>₹{bill.tax.toFixed(2)}</Text>
            </View>
          )}
          <View style={[styles.totalRow, styles.grandTotalRow]}>
            <Text style={styles.grandTotalLabel}>Total Amount:</Text>
            <Text style={styles.grandTotalValue}>₹{bill.totalAmount.toFixed(2)}</Text>
          </View>
        </View>
      </View>

      {/* Exit Pass (if paid) */}
      {bill.paymentStatus === 'paid' && bill.exitPass && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Exit Pass</Text>
          <View style={[styles.card, styles.exitPassCard]}>
            <Text style={styles.success}>✅ Payment Successful</Text>
            <Text style={styles.passIdLabel}>Pass ID</Text>
            <Text style={styles.passId}>{bill.exitPass}</Text>
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
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
    color: '#1f2937',
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