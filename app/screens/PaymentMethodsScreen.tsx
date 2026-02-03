import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useState } from 'react';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';

type Props = NativeStackScreenProps<RootStackParamList, 'PaymentMethods'>;

const METHODS = [
  { id: 'upi', label: 'UPI' },
  { id: 'cod', label: 'Cash on Delivery' },
  { id: 'card', label: 'Debit / Credit Card' },
];

export default function PaymentMethodsScreen({ navigation }: Props) {
  const [selected, setSelected] = useState('upi');

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Payment Methods</Text>

      {METHODS.map((method) => (
        <Pressable
          key={method.id}
          style={[
            styles.methodCard,
            selected === method.id && styles.selected,
          ]}
          onPress={() => setSelected(method.id)}
        >
          <Text style={styles.methodText}>{method.label}</Text>
        </Pressable>
      ))}

      <Pressable
        style={styles.saveBtn}
        onPress={() => navigation.goBack()}
      >
        <Text style={styles.saveText}>Save Preference</Text>
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
    padding: 16,
    borderRadius: 14,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selected: {
    borderColor: '#22c55e',
  },
  methodText: {
    fontSize: 16,
    fontWeight: '500',
  },
  saveBtn: {
    marginTop: 'auto',
    backgroundColor: '#4caf50',
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
  },
  saveText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});