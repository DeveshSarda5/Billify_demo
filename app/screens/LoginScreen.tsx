import { useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { LogIn, ShoppingCart } from 'lucide-react-native';
import AppButton from '../components/ui/AppButton';
import AppCard from '../components/ui/AppCard';
import AppInput from '../components/ui/AppInput';
import Screen from '../components/ui/Screen';
import ThemeToggleButton from '../components/ui/ThemeToggleButton';
import { useAuth } from '../context/AuthContext';
import { useAppTheme } from '../context/ThemeContext';

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
        <View style={styles.topSpacer} />
        <ThemeToggleButton />
      </View>

      <LinearGradient
        colors={isDark ? ['#052e16', '#166534'] : ['#dcfce7', '#f0fdf4']}
        style={[styles.hero, { borderColor: colors.border }]}
      >
        <View style={[styles.logo, { backgroundColor: colors.primary }]}>
          <ShoppingCart size={32} color="#fff" />
        </View>
        <Text style={[styles.appName, { color: colors.text }]}>Billify</Text>
        <Text style={[styles.subtitle, { color: colors.textMuted }]}>Modern self-checkout with faster login, clearer spacing, and a polished theme-aware UI.</Text>
      </LinearGradient>

      <AppCard>
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
            <Text style={[styles.guestHint, { color: colors.textMuted }]}>Browse products, scan items, and preview checkout without registering.</Text>
          </View>
        ) : null}
      </AppCard>

      <Text style={[styles.switchText, { color: colors.textMuted }]}> 
        Don't have an account?{' '}
        <Text style={[styles.link, { color: colors.primary }]} onPress={() => navigation.navigate('Signup')}>
          Sign Up
        </Text>
      </Text>

      <AppCard style={{ backgroundColor: colors.cardAlt }}>
        <Text style={[styles.infoTitle, { color: colors.text }]}>Guest Mode</Text>
        <Text style={[styles.infoText, { color: colors.textMuted }]}>Browse the store, manage your cart, and review your bills before you decide to create an account.</Text>
      </AppCard>
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
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  topSpacer: {
    width: 44,
  },
  hero: {
    borderRadius: 24,
    borderWidth: 1,
    padding: 24,
    alignItems: 'center',
    marginBottom: 16,
  },
  logo: {
    width: 72,
    height: 72,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  appName: {
    fontSize: 32,
    fontWeight: '800',
  },
  subtitle: {
    fontSize: 14,
    marginTop: 8,
    textAlign: 'center',
    lineHeight: 20,
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
  infoTitle: {
    fontWeight: '700',
    fontSize: 15,
    marginBottom: 6,
  },
  infoText: {
    fontSize: 13,
    lineHeight: 18,
  },
});