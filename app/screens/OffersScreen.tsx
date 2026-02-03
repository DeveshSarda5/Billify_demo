import { View, Text, StyleSheet, Pressable, FlatList, Alert } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';

type Props = NativeStackScreenProps<RootStackParamList, 'Offers'>;

const OFFERS = [
  {
    id: 'OFF10',
    title: '10% OFF',
    desc: 'On minimum purchase of ₹199',
  },
  {
    id: 'CASH50',
    title: '₹50 Cashback',
    desc: 'On UPI payments',
  },
  {
    id: 'BANK20',
    title: '20% Bank Offer',
    desc: 'Using select debit cards',
  },
];

export default function OffersScreen({ navigation }: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Offers & Deals</Text>

      <FlatList
        data={OFFERS}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View>
              <Text style={styles.offerTitle}>{item.title}</Text>
              <Text style={styles.offerDesc}>{item.desc}</Text>
            </View>

            <Pressable
              style={styles.applyBtn}
              onPress={() =>
                Alert.alert('Applied', `${item.title} applied successfully`)
              }
            >
              <Text style={styles.applyText}>Apply</Text>
            </Pressable>
          </View>
        )}
      />

      <Pressable style={styles.backBtn} onPress={() => navigation.goBack()}>
        <Text style={styles.backText}>Back to Dashboard</Text>
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
    marginBottom: 16,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  offerTitle: {
    fontWeight: '600',
    fontSize: 16,
  },
  offerDesc: {
    color: '#6b7280',
    marginTop: 4,
    fontSize: 12,
  },
  applyBtn: {
    backgroundColor: '#22c55e',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  applyText: {
    color: '#fff',
    fontWeight: '600',
  },
  backBtn: {
    marginTop: 'auto',
    alignItems: 'center',
    padding: 14,
  },
  backText: {
    color: '#2563eb',
    fontWeight: '600',
  },
});