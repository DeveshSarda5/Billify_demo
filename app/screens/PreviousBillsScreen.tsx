import { View, Text, StyleSheet, Pressable, FlatList, ActivityIndicator } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { useEffect, useState } from 'react';
import { billsAPI } from '../services/api';

type Props = NativeStackScreenProps<RootStackParamList, 'PreviousBills'>;

interface Bill {
  _id: string;
  totalAmount: number;
  createdAt: string;
  paymentStatus: string;
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
            <Pressable
              style={styles.billCard}
              onPress={() =>
                navigation.navigate('BillDetails', { billId: item._id })
              }
            >
              <View>
                <Text style={styles.billId}>Bill #{item._id.slice(-6).toUpperCase()}</Text>
                <Text style={styles.date}>{formatDate(item.createdAt)}</Text>
              </View>

              <Text style={styles.amount}>₹{item.totalAmount}</Text>
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
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  billId: {
    fontWeight: '600',
    fontSize: 16,
  },
  date: {
    color: '#6b7280',
    marginTop: 4,
  },
  amount: {
    fontWeight: '600',
    fontSize: 16,
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