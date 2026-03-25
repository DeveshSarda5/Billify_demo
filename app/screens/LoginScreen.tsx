import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  Alert,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { ShoppingCart, LogIn } from 'lucide-react-native';
import { useAuth } from '../context/AuthContext';

export default function LoginScreen({ navigation }: any) {
  const { login, guestLogin } = useAuth();

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
    <View style={styles.container}>
      <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }}>
        {/* Branding */}
        <View style={styles.header}>
          <View style={styles.logo}>
            <ShoppingCart size={32} color="#fff" />
          </View>
          <Text style={styles.appName}>Billify</Text>
          <Text style={styles.subtitle}>Welcome Back</Text>
        </View>

        {/* Form */}
        <View style={styles.form}>
          <TextInput
            placeholder="Email"
            style={styles.input}
            autoCapitalize="none"
            value={email}
            onChangeText={(t) => {
              setEmail(t);
              setError('');
            }}
          />

          <TextInput
            placeholder="Password"
            style={styles.input}
            secureTextEntry
            value={password}
            onChangeText={(t) => {
              setPassword(t);
              setError('');
            }}
          />

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <Pressable
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Login</Text>
            )}
          </Pressable>

          {/* Divider */}
          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>OR</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* Guest Login Button */}
          <Pressable
            style={[styles.guestButton, guestLoading && styles.guestButtonDisabled]}
            onPress={handleGuestLogin}
            disabled={guestLoading}
          >
            {guestLoading ? (
              <ActivityIndicator color="#4caf50" />
            ) : (
              <>
                <LogIn size={18} color="#4caf50" />
                <Text style={styles.guestButtonText}>Continue as Guest</Text>
              </>
            )}
          </Pressable>
        </View>

        {/* Switch */}
        <Text style={styles.switchText}>
          Don't have an account?{' '}
          <Text
            style={styles.link}
            onPress={() => navigation.navigate('Signup')}
          >
            Sign Up
          </Text>
        </Text>

        {/* Guest Mode Info */}
        <View style={styles.infoBox}>
          <Text style={styles.infoTitle}>Guest Mode</Text>
          <Text style={styles.infoText}>
            Browse and scan items, manage cart, and view bills without creating an account.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
    paddingHorizontal: 24,
    paddingTop: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  logo: {
    backgroundColor: '#4caf50',
    width: 72,
    height: 72,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  appName: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  subtitle: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 8,
  },
  form: {
    marginBottom: 24,
  },
  input: {
    backgroundColor: '#fff',
    paddingHorizontal: 14,
    paddingVertical: 14,
    borderRadius: 12,
    marginBottom: 12,
    fontSize: 14,
    color: '#1f2937',
  },
  error: {
    backgroundColor: '#fee2e2',
    color: '#b91c1c',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
    fontSize: 13,
  },
  button: {
    backgroundColor: '#4caf50',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#d1d5db',
  },
  dividerText: {
    marginHorizontal: 12,
    color: '#9ca3af',
    fontSize: 12,
    fontWeight: '500',
  },
  guestButton: {
    backgroundColor: '#f0fdf4',
    borderWidth: 2,
    borderColor: '#4caf50',
    paddingVertical: 12,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  guestButtonDisabled: {
    opacity: 0.6,
  },
  guestButtonText: {
    color: '#4caf50',
    fontWeight: '600',
    fontSize: 14,
  },
  switchText: {
    textAlign: 'center',
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 16,
  },
  link: {
    color: '#4caf50',
    fontWeight: '600',
  },
  infoBox: {
    backgroundColor: '#ecfdf5',
    borderLeftWidth: 4,
    borderLeftColor: '#10b981',
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  infoTitle: {
    color: '#059669',
    fontWeight: '600',
    fontSize: 13,
    marginBottom: 4,
  },
  infoText: {
    color: '#047857',
    fontSize: 12,
    lineHeight: 18,
  },
});