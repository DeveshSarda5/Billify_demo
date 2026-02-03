import { View, Text, StyleSheet, Pressable } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';

type Props = NativeStackScreenProps<RootStackParamList, 'ExitPass'>;

export default function ExitPassScreen({ navigation }: Props) {
  const passId = Math.floor(100000 + Math.random() * 900000);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Exit Pass</Text>

      <View style={styles.card}>
        <Text style={styles.success}>✅ Payment Successful</Text>

        <Text style={styles.label}>Pass ID</Text>
        <Text style={styles.passId}>{passId}</Text>

        <Text style={styles.meta}>
          Show this screen at the exit gate
        </Text>
      </View>

      <Pressable
        style={styles.doneBtn}
        onPress={() => navigation.popToTop()}
      >
        <Text style={styles.doneText}>Back to Dashboard</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f9fafb',
    justifyContent: 'center',
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 30,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    marginBottom: 40,
  },
  success: {
    fontSize: 18,
    fontWeight: '600',
    color: '#22c55e',
    marginBottom: 16,
  },
  label: {
    color: '#6b7280',
    marginTop: 10,
  },
  passId: {
    fontSize: 28,
    fontWeight: 'bold',
    marginTop: 6,
  },
  meta: {
    color: '#6b7280',
    marginTop: 16,
    textAlign: 'center',
  },
  doneBtn: {
    backgroundColor: '#4caf50',
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
  },
  doneText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});