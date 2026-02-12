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
import { ShoppingCart } from 'lucide-react-native';
import { useAuth } from '../context/AuthContext';

export default function SignupScreen({ navigation }: any) {
  const { signup, login } = useAuth();

  const [isLogin, setIsLogin] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // ================= SIGNUP =================
  const handleSignup = async () => {
    if (!name || !email || !phone || !password || !confirm) {
      setError('Please fill in all fields');
      return;
    }

    if (password !== confirm) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await signup({ name, email, phone, password });
      Alert.alert('Signup Successful 🎉', 'Welcome to Billify!');
    } catch (err: any) {
      setError(err.message || 'Signup failed.');
    } finally {
      setLoading(false);
    }
  };

  // ================= LOGIN =================
  const handleLogin = async () => {
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await login(email, password);
      Alert.alert('Login Successful', 'Welcome back 👋');
    } catch (err: any) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  // ================= NORMAL FORM =================
  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={{ paddingBottom: 24 }}>
        {/* Branding */}
        <View style={styles.header}>
          <View style={styles.logo}>
            <ShoppingCart size={32} color="#fff" />
          </View>
          <Text style={styles.appName}>Billify</Text>
          <Text style={styles.subtitle}>{isLogin ? 'Welcome Back' : 'Create Account'}</Text>
        </View>

        {/* Toggle Tabs */}
        <View style={styles.toggleContainer}>
          <Pressable
            style={[styles.tab, !isLogin && styles.activeTab]}
            onPress={() => {
              setIsLogin(false);
              setError('');
            }}
          >
            <Text style={[styles.tabText, !isLogin && styles.activeTabText]}>Sign Up</Text>
          </Pressable>
          <Pressable
            style={[styles.tab, isLogin && styles.activeTab]}
            onPress={() => {
              setIsLogin(true);
              setError('');
            }}
          >
            <Text style={[styles.tabText, isLogin && styles.activeTabText]}>Login</Text>
          </Pressable>
        </View>

        {/* Forms */}
        {!isLogin ? (
          // Sign Up Form
          <View>
            <TextInput
              placeholder="Full Name"
              style={styles.input}
              value={name}
              onChangeText={(t) => {
                setName(t);
                setError('');
              }}
            />
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
              placeholder="Phone"
              style={styles.input}
              keyboardType="phone-pad"
              value={phone}
              onChangeText={(t) => {
                setPhone(t);
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
            <TextInput
              placeholder="Confirm Password"
              style={styles.input}
              secureTextEntry
              value={confirm}
              onChangeText={(t) => {
                setConfirm(t);
                setError('');
              }}
            />

            {error ? <Text style={styles.error}>{error}</Text> : null}

            <Pressable
              style={[styles.button, loading && styles.buttonDisabled]}
              onPress={handleSignup}
              disabled={loading}
            >
              <Text style={styles.buttonText}>{loading ? 'Signing Up...' : 'Sign Up'}</Text>
            </Pressable>
          </View>
        ) : (
          // Login Form
          <View>
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
              <Text style={styles.buttonText}>{loading ? 'Logging In...' : 'Login'}</Text>
            </Pressable>
          </View>
        )}
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
  toggleContainer: {
    flexDirection: 'row',
    backgroundColor: '#e5e7eb',
    borderRadius: 12,
    padding: 4,
    marginBottom: 24,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 10,
  },
  activeTab: {
    backgroundColor: '#4caf50',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6b7280',
  },
  activeTabText: {
    color: '#fff',
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
    marginBottom: 12,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
});
