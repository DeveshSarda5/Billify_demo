import { View, Text, StyleSheet, Pressable, FlatList, ActivityIndicator, Alert } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { useEffect, useState } from 'react';
import { billsAPI } from '../services/api';
import { Trash2 } from 'lucide-react-native';
import LocationHeader from '../components/LocationHeader';

type Props = NativeStackScreenProps<RootStackParamList, 'PreviousBills'>;

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
}

export default function PreviousBillsScreen({ navigation }: Props) {
  const [bills, setBills] = useState<Bill[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadBills();
  }, []);

  const loadBills = async () => {
    try {
      setLoading(true);
      const data = await billsAPI.getMyBills();
      setBills(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load bills');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (id: string) => {
    Alert.alert(
      'Delete Bill',
      'This bill will be deleted. Do you want to proceed?',
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Yes',
          style: 'destructive',
          onPress: async () => {
            try {
              await billsAPI.deleteBill(id);
              setBills(prev => prev.filter(b => b._id !== id));
            } catch (err: any) {
              Alert.alert('Error', 'Failed to delete bill');
            }
          }
        }
      ]
    );
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color="#4caf50" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.container, styles.centered]}>
        <Text style={styles.errorText}>{error}</Text>
        <Pressable style={styles.retryBtn} onPress={loadBills}>
          <Text style={styles.retryText}>Retry</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <LocationHeader />
      <Text style={styles.title}>Previous Bills</Text>

      {bills.length === 0 ? (
        <View style={styles.centered}>
          <Text style={styles.emptyText}>No bills yet</Text>
        </View>
      ) : (
        <FlatList
          data={bills}
          keyExtractor={(item) => item._id}
          renderItem={({ item }) => (
            <Pressable onPress={() => navigation.navigate('BillDetails', { bill: item })}>
              <View style={styles.billCard}>
                {/* Header with Bill ID and Date */}
                <View style={styles.billHeader}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.billId}>Bill #{item._id.slice(-6).toUpperCase()}</Text>
                    <Text style={styles.date}>{formatDate(item.createdAt)}</Text>
                    <Text style={[styles.status, { color: item.paymentStatus === 'paid' ? '#22c55e' : '#f97316' }]}>
                      {item.paymentStatus === 'paid' ? '✓ Paid' : '⏳ Pending'}
                    </Text>
                  </View>
                  <Pressable onPress={() => handleDelete(item._id)} style={styles.deleteBtn}>
                    <Trash2 size={20} color="#ef4444" />
                  </Pressable>
                </View>

                {/* Items Breakdown */}
                <View style={styles.itemsContainer}>
                  <View style={styles.itemHeader}>
                    <Text style={[styles.itemText, styles.itemName]}>Item</Text>
                    <Text style={[styles.itemText, styles.itemQty]}>Qty</Text>
                    <Text style={[styles.itemText, styles.itemPrice]}>Price</Text>
                  </View>
                  {item.items && item.items.map((lineItem, idx) => (
                    <View key={idx} style={styles.itemRow}>
                      <Text style={[styles.itemValue, styles.itemName]} numberOfLines={1}>{lineItem.name}</Text>
                      <Text style={[styles.itemValue, styles.itemQty]}>{lineItem.quantity}</Text>
                      <Text style={[styles.itemValue, styles.itemPrice]}>₹{(lineItem.price * lineItem.quantity).toFixed(2)}</Text>
                    </View>
                  ))}
                </View>

                {/* Totals */}
                <View style={styles.totalsContainer}>
                  <View style={styles.totalRow}>
                    <Text style={styles.totalLabel}>Subtotal:</Text>
                    <Text style={styles.totalValue}>₹{(item.subtotal || item.totalAmount).toFixed(2)}</Text>
                  </View>
                  {item.tax !== undefined && item.tax > 0 && (
                    <View style={styles.totalRow}>
                      <Text style={styles.totalLabel}>Tax (GST):</Text>
                      <Text style={styles.totalValue}>₹{item.tax.toFixed(2)}</Text>
                    </View>
                  )}
                  <View style={[styles.totalRow, styles.grandTotalRow]}>
                    <Text style={styles.grandTotalLabel}>Total Amount:</Text>
                    <Text style={styles.grandTotalValue}>₹{item.totalAmount.toFixed(2)}</Text>
                  </View>
                </View>

                {/* Exit Pass Button (if paid) */}
                {item.paymentStatus === 'paid' && item.exitPass && (
                  <Pressable
                    style={styles.exitPassBtn}
                    onPress={() => navigation.navigate('BillDetails', { bill: item })}
                  >
                    <Text style={styles.exitPassBtnText}>📋 View Exit Pass</Text>
                  </Pressable>
                )}
              </View>
            </Pressable>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f9fafb',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  billCard: {
    backgroundColor: '#fff',
    borderRadius: 14,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#4caf50',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  billHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  billId: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#1f2937',
  },
  date: {
    color: '#6b7280',
    fontSize: 12,
    marginTop: 4,
  },
  status: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 4,
  },
  deleteBtn: {
    padding: 8,
  },
  itemsContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  itemHeader: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  itemRow: {
    flexDirection: 'row',
    marginBottom: 6,
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
  totalsContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  grandTotalRow: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    marginBottom: 0,
  },
  totalLabel: {
    fontSize: 13,
    color: '#6b7280',
  },
  totalValue: {
    fontSize: 13,
    fontWeight: '500',
    color: '#1f2937',
  },
  grandTotalLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  grandTotalValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#4caf50',
  },
  exitPassBtn: {
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  exitPassBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    color: '#ef4444',
    fontSize: 16,
    marginBottom: 16,
  },
  retryBtn: {
    backgroundColor: '#4caf50',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
  },
  retryText: {
    color: '#fff',
    fontWeight: '600',
  },
  emptyText: {
    color: '#6b7280',
    fontSize: 16,
  },
});