import { View, Text, StyleSheet, Pressable, FlatList } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';

type Props = NativeStackScreenProps<RootStackParamList, 'PreviousBills'>;

const MOCK_BILLS = [
  { id: 'BILL001', date: '20 Sep 2025', total: 249 },
  { id: 'BILL002', date: '18 Sep 2025', total: 129 },
  { id: 'BILL003', date: '15 Sep 2025', total: 399 },
];

export default function PreviousBillsScreen({ navigation }: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Previous Bills</Text>

      <FlatList
        data={MOCK_BILLS}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <Pressable
            style={styles.billCard}
            onPress={() =>
              navigation.navigate('BillDetails', { billId: item.id })
            }
          >
            <View>
              <Text style={styles.billId}>{item.id}</Text>
              <Text style={styles.date}>{item.date}</Text>
            </View>

            <Text style={styles.amount}>₹{item.total}</Text>
          </Pressable>
        )}
      />
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
});