import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Trash2 } from 'lucide-react-native';
import AppButton from '../components/ui/AppButton';
import AppCard from '../components/ui/AppCard';
import AppHeader from '../components/ui/AppHeader';
import Screen from '../components/ui/Screen';
import LocationHeader from '../components/LocationHeader';
import { useAppTheme } from '../context/ThemeContext';
import { RootStackParamList } from '../navigation/AppNavigator';
import { billsAPI, BillResponse } from '../services/api';

type Props = NativeStackScreenProps<RootStackParamList, 'PreviousBills'>;

interface Bill extends BillResponse {
  _id: string;
}

type SortType = 'date' | 'price';
type SortOrder = 'asc' | 'desc';

export default function PreviousBillsScreen({ navigation }: Props) {
  const { colors } = useAppTheme();
  const [bills, setBills] = useState<Bill[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [sortType, setSortType] = useState<SortType>('date');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');

  useEffect(() => {
    loadBills();
  }, []);

  const loadBills = async () => {
    try {
      setLoading(true);
      const data = await billsAPI.getMyBills();
      const billsWithId = data.map((bill: any) => ({
        ...bill,
        _id: bill._id || bill.id,
      }));
      setBills(billsWithId);
      setError('');
    } catch (err: any) {
      setError(err.message || 'Failed to load bills');
    } finally {
      setLoading(false);
    }
  };

  const getSortedBills = () => {
    return [...bills].sort((a, b) => {
      const compareValue = sortType === 'price'
        ? a.totalAmount - b.totalAmount
        : new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();

      return sortOrder === 'asc' ? compareValue : -compareValue;
    });
  };

  const toggleSort = (newSortType: SortType) => {
    if (sortType === newSortType) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortType(newSortType);
      setSortOrder('desc');
    }
  };

  const handleDelete = (id: string) => {
    Alert.alert('Delete Bill', 'This bill will be deleted. Do you want to proceed?', [
      { text: 'No', style: 'cancel' },
      {
        text: 'Yes',
        style: 'destructive',
        onPress: async () => {
          try {
            await billsAPI.deleteBill(id);
            setBills((prev) => prev.filter((bill) => bill._id !== id));
          } catch {
            Alert.alert('Error', 'Failed to delete bill');
          }
        },
      },
    ]);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  if (loading) {
    return (
      <Screen>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </Screen>
    );
  }

  if (error) {
    return (
      <Screen>
        <View style={styles.centered}>
          <Text style={[styles.errorText, { color: colors.danger }]}>{error}</Text>
          <AppButton onPress={loadBills}>Retry</AppButton>
        </View>
      </Screen>
    );
  }

  return (
    <Screen padded={false}>
      <View style={styles.headerWrap}>
        <AppHeader title="Previous Bills" subtitle="Review, sort, and reopen past purchases." onBack={() => navigation.goBack()} />
      </View>

      <LocationHeader />

      <View style={styles.content}>
        <View style={styles.sortControls}>
          <Pressable style={[styles.sortBtn, { backgroundColor: sortType === 'date' ? colors.primary : colors.cardAlt }]} onPress={() => toggleSort('date')}>
            <Text style={[styles.sortBtnText, { color: sortType === 'date' ? '#fff' : colors.textMuted }]}>Date {sortType === 'date' && (sortOrder === 'asc' ? '↑' : '↓')}</Text>
          </Pressable>
          <Pressable style={[styles.sortBtn, { backgroundColor: sortType === 'price' ? colors.primary : colors.cardAlt }]} onPress={() => toggleSort('price')}>
            <Text style={[styles.sortBtnText, { color: sortType === 'price' ? '#fff' : colors.textMuted }]}>₹ Price {sortType === 'price' && (sortOrder === 'asc' ? '↑' : '↓')}</Text>
          </Pressable>
        </View>

        {bills.length === 0 ? (
          <View style={styles.centered}>
            <Text style={[styles.emptyText, { color: colors.textMuted }]}>No bills yet</Text>
          </View>
        ) : (
          <FlatList
            data={getSortedBills()}
            keyExtractor={(item) => item._id}
            contentContainerStyle={styles.listContent}
            renderItem={({ item }) => (
              <Pressable onPress={() => navigation.navigate('BillDetails', { bill: item })}>
                <AppCard>
                  <View style={[styles.billHeader, { borderBottomColor: colors.border }]}> 
                    <View style={styles.flexItem}>
                      <Text style={[styles.billId, { color: colors.text }]}>Bill #{item._id.slice(-6).toUpperCase()}</Text>
                      <Text style={[styles.date, { color: colors.textMuted }]}>{formatDate(item.createdAt)}</Text>
                      <Text style={[styles.status, { color: item.paymentStatus === 'paid' ? colors.success : colors.warning }]}>
                        {item.paymentStatus === 'paid' ? 'Paid' : 'Pending'}
                      </Text>
                    </View>
                    <Pressable onPress={() => handleDelete(item._id)} style={styles.deleteBtn}>
                      <Trash2 size={20} color={colors.danger} />
                    </Pressable>
                  </View>

                  <View style={[styles.itemsContainer, { borderBottomColor: colors.border }]}> 
                    <View style={styles.itemHeader}>
                      <Text style={[styles.itemText, styles.itemName, { color: colors.textMuted }]}>Item</Text>
                      <Text style={[styles.itemText, styles.itemQty, { color: colors.textMuted }]}>Qty</Text>
                      <Text style={[styles.itemText, styles.itemPrice, { color: colors.textMuted }]}>Price</Text>
                    </View>
                    {item.items?.map((lineItem, idx) => (
                      <View key={idx} style={styles.itemRow}>
                        <Text style={[styles.itemValue, styles.itemName, { color: colors.text }]} numberOfLines={1}>{lineItem.name}</Text>
                        <Text style={[styles.itemValue, styles.itemQty, { color: colors.text }]}>{lineItem.quantity}</Text>
                        <Text style={[styles.itemValue, styles.itemPrice, { color: colors.text }]}>₹{(lineItem.price * lineItem.quantity).toFixed(2)}</Text>
                      </View>
                    ))}
                  </View>

                  <View style={styles.totalsContainer}>
                    <View style={styles.totalRow}>
                      <Text style={[styles.totalLabel, { color: colors.textMuted }]}>Subtotal:</Text>
                      <Text style={[styles.totalValue, { color: colors.text }]}>₹{(item.subtotal || item.totalAmount).toFixed(2)}</Text>
                    </View>
                    {item.tax !== undefined && item.tax > 0 ? (
                      <View style={styles.totalRow}>
                        <Text style={[styles.totalLabel, { color: colors.textMuted }]}>Tax (GST):</Text>
                        <Text style={[styles.totalValue, { color: colors.text }]}>₹{item.tax.toFixed(2)}</Text>
                      </View>
                    ) : null}
                    <View style={[styles.totalRow, styles.grandTotalRow]}>
                      <Text style={[styles.grandTotalLabel, { color: colors.text }]}>Total Amount:</Text>
                      <Text style={[styles.grandTotalValue, { color: colors.primary }]}>₹{item.totalAmount.toFixed(2)}</Text>
                    </View>
                  </View>

                  {item.paymentStatus === 'paid' && item.exitPass ? (
                    <View style={[styles.exitPassBtn, { backgroundColor: colors.chip }]}> 
                      <Text style={[styles.exitPassBtnText, { color: colors.primary }]}>View Exit Pass in details</Text>
                    </View>
                  ) : null}
                </AppCard>
              </Pressable>
            )}
          />
        )}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  headerWrap: {
    paddingHorizontal: 16,
    paddingTop: 10,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  sortControls: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  sortBtn: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  sortBtnText: {
    fontSize: 12,
    fontWeight: '600',
  },
  billHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    borderBottomWidth: 1,
    paddingBottom: 12,
  },
  flexItem: {
    flex: 1,
  },
  billId: {
    fontWeight: '700',
    fontSize: 16,
  },
  date: {
    fontSize: 12,
    marginTop: 4,
  },
  status: {
    fontSize: 12,
    fontWeight: '700',
    marginTop: 4,
  },
  deleteBtn: {
    padding: 8,
  },
  itemsContainer: {
    paddingVertical: 12,
    borderBottomWidth: 1,
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
  },
  itemValue: {
    fontSize: 13,
  },
  itemName: {
    flex: 1,
  },
  itemQty: {
    width: 45,
    textAlign: 'center',
  },
  itemPrice: {
    width: 80,
    textAlign: 'right',
  },
  totalsContainer: {
    paddingTop: 12,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  totalLabel: {
    fontSize: 13,
  },
  totalValue: {
    fontSize: 13,
    fontWeight: '600',
  },
  grandTotalRow: {
    marginTop: 8,
  },
  grandTotalLabel: {
    fontSize: 15,
    fontWeight: '700',
  },
  grandTotalValue: {
    fontSize: 16,
    fontWeight: '800',
  },
  exitPassBtn: {
    marginTop: 12,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 12,
  },
  exitPassBtnText: {
    fontWeight: '700',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
  },
  errorText: {
    marginBottom: 12,
    fontSize: 14,
  },
  listContent: {
    paddingBottom: 120,
  },
});
