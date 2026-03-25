import { View, Text, StyleSheet, Pressable } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { ChevronRight, CreditCard, Smartphone } from 'lucide-react-native';
import AppCard from '../components/ui/AppCard';
import AppHeader from '../components/ui/AppHeader';
import Screen from '../components/ui/Screen';
import { useAppTheme } from '../context/ThemeContext';

type Props = NativeStackScreenProps<RootStackParamList, 'PaymentMethods'>;

export default function PaymentMethodsScreen({ navigation }: Props) {
  const { colors } = useAppTheme();

  return (
    <Screen>
      <AppHeader
        title="Payment Methods"
        subtitle="Manage your saved UPI handles and cards in one place."
        onBack={() => navigation.goBack()}
      />

      <Pressable
        onPress={() => navigation.navigate('ManageUPI')}
      >
        <AppCard style={styles.methodCard}>
          <View style={styles.row}>
            <View style={[styles.iconWrap, { backgroundColor: colors.chip }]}>
              <Smartphone size={24} color={colors.primary} />
            </View>
            <View style={styles.copy}>
              <Text style={[styles.methodText, { color: colors.text }]}>Manage UPI IDs</Text>
              <Text style={[styles.methodSubtitle, { color: colors.textMuted }]}>Add or remove your preferred UPI accounts for faster checkout.</Text>
            </View>
          </View>
          <ChevronRight size={20} color={colors.textSoft} />
        </AppCard>
      </Pressable>

      <Pressable
        onPress={() => navigation.navigate('ManageCards')}
      >
        <AppCard style={styles.methodCard}>
          <View style={styles.row}>
            <View style={[styles.iconWrap, { backgroundColor: colors.chip }]}>
              <CreditCard size={24} color={colors.primary} />
            </View>
            <View style={styles.copy}>
              <Text style={[styles.methodText, { color: colors.text }]}>Manage Debit / Credit Cards</Text>
              <Text style={[styles.methodSubtitle, { color: colors.textMuted }]}>Keep saved cards organized with a cleaner, more consistent wallet view.</Text>
            </View>
          </View>
          <ChevronRight size={20} color={colors.textSoft} />
        </AppCard>
      </Pressable>

    </Screen>
  );
}

const styles = StyleSheet.create({
  methodCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 12,
  },
  iconWrap: {
    width: 48,
    height: 48,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  copy: {
    flex: 1,
  },
  methodText: {
    fontSize: 16,
    fontWeight: '700',
  },
  methodSubtitle: {
    marginTop: 4,
    fontSize: 13,
    lineHeight: 18,
  },
});