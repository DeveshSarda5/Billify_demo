import { useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import { ShoppingCart } from 'lucide-react-native';
import AppButton from '../components/ui/AppButton';
import AppCard from '../components/ui/AppCard';
import AppInput from '../components/ui/AppInput';
import Screen from '../components/ui/Screen';
import { useAuth } from '../context/AuthContext';
import { useAppTheme } from '../context/ThemeContext';
import { radius } from '../theme';

export default function LoginScreen({ navigation }: any) {
  const { login } = useAuth();
  const { colors } = useAppTheme();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }

    setError('');
    setLoading(true);

    try {
      await login(email.trim().toLowerCase(), password);
      Alert.alert('Login Successful', 'Welcome back to Billify');
    } catch (err: any) {
      setError(err.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen scrollable contentStyle={styles.screenContent}>
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
      </AppCard>

      <Text style={[styles.switchText, { color: colors.textMuted }]}> 
        Don't have an account?{' '}
        <Text style={[styles.link, { color: colors.primary }]} onPress={() => navigation.navigate('Signup')}>
          Sign Up
        </Text>
      </Text>
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
  switchText: {
    textAlign: 'center',
    fontSize: 14,
    marginBottom: 16,
  },
  link: {
    fontWeight: '700',
  },
});