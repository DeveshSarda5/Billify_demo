import { useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import { LogIn, ShoppingCart } from 'lucide-react-native';
import AppButton from '../components/ui/AppButton';
import AppCard from '../components/ui/AppCard';
import AppInput from '../components/ui/AppInput';
import Screen from '../components/ui/Screen';
import ThemeToggleButton from '../components/ui/ThemeToggleButton';
import { useAuth } from '../context/AuthContext';
import { useAppTheme } from '../context/ThemeContext';
import { radius } from '../theme';

export default function LoginScreen({ navigation }: any) {
  const { login, guestLogin } = useAuth();
  const { colors, isDark } = useAppTheme();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [guestLoading, setGuestLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }

    setError('');
    setLoading(true);

    try {
      await login(email, password);
      Alert.alert('Login Successful', 'Welcome back to Billify');
    } catch (err: any) {
      setError(err.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGuestLogin = async () => {
    try {
      setGuestLoading(true);
      setError('');
      await guestLogin();
      Alert.alert('Guest Mode', 'You are logged in as a guest');
    } catch (err: any) {
      setError(err.message || 'Failed to login as guest');
    } finally {
      setGuestLoading(false);
    }
  };

  return (
    <Screen scrollable contentStyle={styles.screenContent}>
      <View style={styles.topBar}>
        <ThemeToggleButton />
      </View>

      <View style={styles.header}>
        <View style={[styles.logo, { backgroundColor: colors.primary }]}>
          <ShoppingCart size={30} color="#fff" />
        </View>
        <Text style={[styles.appName, { color: colors.text }]}>Billify</Text>
        <Text style={[styles.subtitle, { color: colors.textMuted }]}>Welcome back</Text>
      </View>

      <AppCard style={[styles.formCard, { backgroundColor: colors.card }]}> 
        <AppInput
          placeholder="Email"
          autoCapitalize="none"
          keyboardType="email-address"
          value={email}
          onChangeText={(value) => {
            setEmail(value);
            setError('');
          }}
          style={styles.input}
        />

        <AppInput
          placeholder="Password"
          secureTextEntry
          value={password}
          onChangeText={(value) => {
            setPassword(value);
            setError('');
          }}
          style={styles.input}
        />

        {error ? <Text style={[styles.error, { backgroundColor: colors.warningBg, color: colors.warningText }]}>{error}</Text> : null}

        <AppButton onPress={handleLogin} loading={loading}>Login</AppButton>

        <View style={styles.divider}>
          <View style={[styles.dividerLine, { backgroundColor: colors.divider }]} />
          <Text style={[styles.dividerText, { color: colors.textSoft }]}>OR</Text>
          <View style={[styles.dividerLine, { backgroundColor: colors.divider }]} />
        </View>

        <AppButton onPress={handleGuestLogin} loading={guestLoading} variant="secondary">
          Continue as Guest
        </AppButton>

        {!guestLoading ? (
          <View style={styles.guestHintRow}>
            <LogIn size={16} color={colors.primary} />
            <Text style={[styles.guestHint, { color: colors.textMuted }]}>Browse items, scan products, and preview checkout without creating an account.</Text>
          </View>
        ) : null}
      </AppCard>

      <Text style={[styles.switchText, { color: colors.textMuted }]}> 
        Don't have an account?{' '}
        <Text style={[styles.link, { color: colors.primary }]} onPress={() => navigation.navigate('Signup')}>
          Sign Up
        </Text>
      </Text>

      <View style={[styles.infoBox, { backgroundColor: colors.cardAlt, borderLeftColor: colors.primaryAlt }]}> 
        <Text style={[styles.infoTitle, { color: colors.primaryAlt }]}>Guest Mode</Text>
        <Text style={[styles.infoText, { color: colors.textMuted }]}>Browse the store, manage your cart, and review bills before deciding to sign up.</Text>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  screenContent: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: 10,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  logo: {
    width: 72,
    height: 72,
    borderRadius: radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  appName: {
    fontSize: 32,
    fontWeight: '700',
  },
  subtitle: {
    fontSize: 14,
    marginTop: 8,
    textAlign: 'center',
  },
  formCard: {
    marginBottom: 16,
  },
  input: {
    marginBottom: 12,
  },
  error: {
    padding: 12,
    borderRadius: 12,
    marginBottom: 12,
    fontSize: 13,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
  },
  dividerText: {
    marginHorizontal: 12,
    fontSize: 12,
    fontWeight: '700',
  },
  guestHintRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 12,
  },
  guestHint: {
    flex: 1,
    fontSize: 13,
    lineHeight: 18,
  },
  switchText: {
    textAlign: 'center',
    fontSize: 14,
    marginBottom: 16,
  },
  link: {
    fontWeight: '700',
  },
  infoBox: {
    borderLeftWidth: 4,
    padding: 14,
    borderRadius: radius.md,
  },
  infoTitle: {
    fontWeight: '700',
    fontSize: 13,
    marginBottom: 4,
  },
  infoText: {
    fontSize: 12,
    lineHeight: 18,
  },
});