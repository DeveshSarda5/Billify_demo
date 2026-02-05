import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { ShoppingCart, Mail, Lock, Eye, EyeOff } from 'lucide-react-native';
import { useAuth } from '../context/AuthContext';

export default function LoginScreen({ navigation }: any) {
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }
    if (password.length < 4) {
      setError('Password must be at least 4 characters');
      return;
    }

    setError('');
    setLoading(true);

    try {
      await login(email, password);

      Alert.alert(
        'Login Successful',
        'Welcome back to Billify 👋'
      );
    } catch (err: any) {
      setError(err.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Branding */}
      <View style={styles.header}>
        <View style={styles.logo}>
          <ShoppingCart size={36} color="#fff" />
        </View>
        <Text style={styles.appName}>Billify</Text>
        <Text style={styles.subtitle}>Welcome back!</Text>
      </View>

      {/* Form */}
      <View style={styles.form}>
        {/* Email */}
        <View style={styles.inputWrapper}>
          <Mail size={20} color="#9ca3af" />
          <TextInput
            placeholder="Email or Phone"
            style={styles.input}
            autoCapitalize="none"
            value={email}
            onChangeText={(t) => {
              setEmail(t);
              setError('');
            }}
          />
        </View>

        {/* Password */}
        <View style={styles.inputWrapper}>
          <Lock size={20} color="#9ca3af" />
          <TextInput
            placeholder="Password"
            style={styles.input}
            secureTextEntry={!showPassword}
            value={password}
            onChangeText={(t) => {
              setPassword(t);
              setError('');
            }}
          />
          <Pressable onPress={() => setShowPassword(!showPassword)}>
            {showPassword ? (
              <EyeOff size={20} color="#6b7280" />
            ) : (
              <Eye size={20} color="#6b7280" />
            )}
          </Pressable>
        </View>

        {/* Error */}
        {error ? <Text style={styles.error}>{error}</Text> : null}

        {/* Login Button */}
        <Pressable
          style={[styles.button, loading && { opacity: 0.7 }]}
          onPress={handleLogin}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Login</Text>
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    backgroundColor: '#f9fafb',
    justifyContent: 'center',
  },
  header: { alignItems: 'center', marginBottom: 30 },
  logo: {
    backgroundColor: '#4caf50',
    width: 80,
    height: 80,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  appName: { fontSize: 32, fontWeight: 'bold' },
  subtitle: { color: '#6b7280' },
  title: { fontSize: 28, fontWeight: 'bold', marginBottom: 20 },
  form: { gap: 14 },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 10,
  },
  input: { flex: 1 },
  error: {
    backgroundColor: '#fee2e2',
    color: '#b91c1c',
    padding: 10,
    borderRadius: 12,
    marginTop: 8,
  },
  button: {
    backgroundColor: '#4caf50',
    paddingVertical: 16,
    borderRadius: 16,
    marginTop: 12,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    textAlign: 'center',
    fontSize: 16,
  },
  switchText: {
    textAlign: 'center',
    marginTop: 20,
    color: '#6b7280',
  },
  link: { color: '#4caf50', fontWeight: '600' },
});