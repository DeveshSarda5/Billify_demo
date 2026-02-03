import { View, Text, StyleSheet, Pressable } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';

type Props = NativeStackScreenProps<RootStackParamList, 'BillDetails'>;

export default function BillDetailsScreen({ route, navigation }: Props) {
  const { billId } = route.params;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Bill Details</Text>

      <View style={styles.card}>
        <Text style={styles.label}>Bill ID</Text>
        <Text style={styles.value}>{billId}</Text>

        <Text style={styles.label}>Items</Text>
        <Text style={styles.value}>3 items</Text>

        <Text style={styles.label}>Total Paid</Text>
        <Text style={styles.total}>₹249</Text>
      </View>

      <Pressable
        style={styles.exitBtn}
        onPress={() => navigation.navigate('ExitPass')}
      >
        <Text style={styles.exitText}>View Exit Pass</Text>
      </Pressable>
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
    marginBottom: 20,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 30,
  },
  label: {
    color: '#6b7280',
    marginTop: 12,
  },
  value: {
    fontWeight: '600',
    marginTop: 4,
  },
  total: {
    fontSize: 22,
    fontWeight: 'bold',
    marginTop: 6,
  },
  exitBtn: {
    backgroundColor: '#4caf50',
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
  },
  exitText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});