import { View, Text, StyleSheet, Pressable } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { ChevronRight, CreditCard, Smartphone } from 'lucide-react-native';

type Props = NativeStackScreenProps<RootStackParamList, 'PaymentMethods'>;

export default function PaymentMethodsScreen({ navigation }: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Payment Methods</Text>

      <Pressable
        style={styles.methodCard}
        onPress={() => navigation.navigate('ManageUPI')}
      >
        <View style={styles.row}>
          <Smartphone size={24} color="#4caf50" style={{ marginRight: 12 }} />
          <Text style={styles.methodText}>Manage UPI IDs</Text>
        </View>
        <ChevronRight size={20} color="#9ca3af" />
      </Pressable>

      <Pressable
        style={styles.methodCard}
        onPress={() => navigation.navigate('ManageCards')}
      >
        <View style={styles.row}>
          <CreditCard size={24} color="#2196f3" style={{ marginRight: 12 }} />
          <Text style={styles.methodText}>Manage Debit / Credit Cards</Text>
        </View>
        <ChevronRight size={20} color="#9ca3af" />
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
  methodCard: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 14,
    marginBottom: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 2,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  methodText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1f2937',
  },
});