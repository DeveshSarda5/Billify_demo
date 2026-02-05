import { View, Text, StyleSheet, Pressable, FlatList, ActivityIndicator, Alert } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { useEffect, useState } from 'react';
import { billsAPI } from '../services/api';
import { Trash2 } from 'lucide-react-native';

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
            <View style={styles.billCard}>
              <Pressable
                style={styles.billInfo}
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

              <Pressable onPress={() => handleDelete(item._id)} style={styles.deleteBtn}>
                <Trash2 size={20} color="#ef4444" />
              </Pressable>
            </View>
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
    flexDirection: 'row',
    alignItems: 'center',
    paddingRight: 16, // Space for trash icon
  },
  billInfo: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  deleteBtn: {
    padding: 8,
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