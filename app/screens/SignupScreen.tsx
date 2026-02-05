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
import { User, Mail, Phone, Lock, Eye, EyeOff } from 'lucide-react-native';
import { useAuth } from '../context/AuthContext';

export default function SignupScreen({ navigation }: any) {
  const { signup } = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSignup = async () => {
    if (!name || !email || !phone || !password || !confirm) {
      setError('Please fill in all fields');
      return;
    }
    if (password !== confirm) {
      setError('Passwords do not match');
      return;
    }
    if (password.length < 4) {
      setError('Password must be at least 4 characters');
      return;
    }

    setError('');
    setLoading(true);

    try {
      await signup({ name, email, phone, password });

      Alert.alert(
        'Signup Successful 🎉',
        'Your Billify account has been created'
      );
    } catch (err: any) {
      setError(err.message || 'Signup failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Create Account</Text>

      <View style={styles.inputWrapper}>
        <User size={20} color="#9ca3af" />
        <TextInput
          placeholder="Full Name"
          style={styles.input}
          value={name}
          onChangeText={(t) => {
            setName(t);
            setError('');
          }}
        />
      </View>

      <View style={styles.inputWrapper}>
        <Mail size={20} color="#9ca3af" />
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
      </View>

      <View style={styles.inputWrapper}>
        <Phone size={20} color="#9ca3af" />
        <TextInput
          placeholder="Phone Number"
          style={styles.input}
          keyboardType="phone-pad"
          value={phone}
          onChangeText={(t) => {
            setPhone(t);
            setError('');
          }}
        />
      </View>

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
          {showPassword ? <EyeOff size={20} color="#6b7280" /> : <Eye size={20} color="#6b7280" />}
        </Pressable>
      </View>

      <View style={styles.inputWrapper}>
        <Lock size={20} color="#9ca3af" />
        <TextInput
          placeholder="Confirm Password"
          style={styles.input}
          secureTextEntry={!showPassword}
          value={confirm}
          onChangeText={(t) => {
            setConfirm(t);
            setError('');
          }}
        />
      </View>

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <Pressable
        style={[styles.button, loading && { opacity: 0.7 }]}
        onPress={handleSignup}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Sign Up</Text>
        )}
      </Pressable>

      <Text style={styles.switchText} onPress={() => navigation.goBack()}>
        Already have an account? <Text style={styles.link}>Login</Text>
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
    marginBottom: 12,
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
