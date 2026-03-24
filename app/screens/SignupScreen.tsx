import { useState, useEffect } from 'react';
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
import { authAPI } from '../services/api';

export default function SignupScreen({ navigation }: any) {
  const { signup, login, setPhoneVerified } = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [phoneVerified, setPhoneVerifiedLocal] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);
  const [verifyingOtp, setVerifyingOtp] = useState(false);
  
  // Resend OTP timer
  const [canResendOtp, setCanResendOtp] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);

  // Handle resend timer countdown
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer((prev) => {
          if (prev <= 1) {
            setCanResendOtp(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [resendTimer]);

  // Handle phone input - numeric only, max 10 digits
  const handlePhoneChange = (text: string) => {
    const numericOnly = text.replace(/[^0-9]/g, '').slice(0, 10);
    setPhone(numericOnly);
    setError('');
  };

  // Handle OTP input - numeric only, max 6 digits
  const handleOtpChange = (text: string) => {
    const numericOnly = text.replace(/[^0-9]/g, '').slice(0, 6);
    setOtp(numericOnly);
    setError('');
  };

  // Generate and send OTP
  const handleGenerateOtp = async () => {
    if (phone.length !== 10) {
      setError('Please enter a valid 10-digit phone number');
      return;
    }

    try {
      setOtpLoading(true);
      setError('');
      
      await authAPI.sendOTP(phone);
      
      setOtpSent(true);
      setCanResendOtp(false);
      setResendTimer(30);
      Alert.alert('OTP Sent', `An OTP has been sent to ${phone}`);
    } catch (err: any) {
      setError(err.message || 'Failed to send OTP. Please try again.');
    } finally {
      setOtpLoading(false);
    }
  };

  // Verify OTP
  const handleVerifyOtp = async () => {
    if (otp.length !== 6) {
      setError('Please enter a valid 6-digit OTP');
      return;
    }

    try {
      setVerifyingOtp(true);
      setError('');
      
      await authAPI.verifyOTP(phone, otp);
      
      setPhoneVerifiedLocal(true);
      setPhoneVerified(true);
      setOtpSent(false);
      Alert.alert('Success', 'Phone verified successfully!');
    } catch (err: any) {
      setError(err.message || 'Invalid OTP. Please try again.');
    } finally {
      setVerifyingOtp(false);
    }
  };

  // Handle signup
  const handleSignup = async () => {
    if (!phoneVerified) {
      setError('Please verify your phone number first');
      return;
    }

    if (!name || !email || !password || !confirm) {
      setError('Please fill all fields');
      return;
    }

    if (password !== confirm) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    try {
      setLoading(true);
      setError('');

      await signup({ name, email, password, phone });
      await login(email, password);

      Alert.alert('Success', 'Account created successfully!');
      navigation.reset({
        index: 0,
        routes: [{ name: 'Dashboard' }],
      });
    } catch (err: any) {
      setError(err.message || 'Signup failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={{ paddingBottom: 24 }}>
        <View style={styles.header}>
          <View style={styles.logo}>
            <ShoppingCart size={32} color="#fff" />
          </View>
          <Text style={styles.appName}>Billify</Text>
          <Text style={styles.subtitle}>Create Account</Text>
        </View>

        {/* PHONE VERIFICATION SECTION */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>1. Verify Phone Number</Text>
          
          {!phoneVerified ? (
            <>
              <TextInput
                placeholder="10-digit Phone Number"
                style={[styles.input, otpSent && styles.inputDisabled]}
                keyboardType="numeric"
                maxLength={10}
                value={phone}
                onChangeText={handlePhoneChange}
                editable={!otpSent}
              />
              
              {!otpSent ? (
                <Pressable
                  style={[
                    styles.button,
                    (otpLoading || phone.length !== 10) && styles.buttonDisabled,
                  ]}
                  onPress={handleGenerateOtp}
                  disabled={otpLoading || phone.length !== 10}
                >
                  {otpLoading ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text style={styles.buttonText}>Send OTP</Text>
                  )}
                </Pressable>
              ) : (
                <>
                  <TextInput
                    placeholder="6-digit OTP"
                    style={styles.input}
                    keyboardType="numeric"
                    maxLength={6}
                    value={otp}
                    onChangeText={handleOtpChange}
                  />

                  <Pressable
                    style={[
                      styles.button,
                      (verifyingOtp || otp.length !== 6) && styles.buttonDisabled,
                    ]}
                    onPress={handleVerifyOtp}
                    disabled={verifyingOtp || otp.length !== 6}
                  >
                    {verifyingOtp ? (
                      <ActivityIndicator color="#fff" />
                    ) : (
                      <Text style={styles.buttonText}>Verify OTP</Text>
                    )}
                  </Pressable>

                  {!canResendOtp ? (
                    <Text style={styles.resendText}>
                      Resend OTP in {resendTimer}s
                    </Text>
                  ) : (
                    <Pressable onPress={handleGenerateOtp}>
                      <Text style={styles.resendLink}>Resend OTP</Text>
                    </Pressable>
                  )}
                </>
              )}
            </>
          ) : (
            <View style={styles.verifiedBadge}>
              <Text style={styles.verifiedText}>✓ Phone Verified ({phone})</Text>
            </View>
          )}
        </View>

        {/* ACCOUNT DETAILS SECTION */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>2. Account Details</Text>
          
          <TextInput
            placeholder="Full Name"
            style={styles.input}
            value={name}
            onChangeText={(text) => {
              setName(text);
              setError('');
            }}
          />

          <TextInput
            placeholder="Email"
            style={styles.input}
            autoCapitalize="none"
            keyboardType="email-address"
            value={email}
            onChangeText={(text) => {
              setEmail(text);
              setError('');
            }}
          />

          <TextInput
            placeholder="Password"
            style={styles.input}
            secureTextEntry
            value={password}
            onChangeText={(text) => {
              setPassword(text);
              setError('');
            }}
          />

          <TextInput
            placeholder="Confirm Password"
            style={styles.input}
            secureTextEntry
            value={confirm}
            onChangeText={(text) => {
              setConfirm(text);
              setError('');
            }}
          />
        </View>

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <Pressable
          style={[
            styles.button,
            (!phoneVerified || loading) && styles.buttonDisabled,
          ]}
          onPress={handleSignup}
          disabled={!phoneVerified || loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Sign Up</Text>
          )}
        </Pressable>

        <Pressable onPress={() => navigation.navigate('Login')}>
          <Text style={styles.switchText}>
            Already have an account? <Text style={styles.link}>Login</Text>
          </Text>
        </Pressable>
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
    marginBottom: 24,
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
  section: {
    marginBottom: 20,
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#4caf50',
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 12,
  },
  input: {
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 12,
    fontSize: 14,
    color: '#1f2937',
  },
  inputDisabled: {
    opacity: 0.6,
    backgroundColor: '#e5e7eb',
  },
  button: {
    backgroundColor: '#4caf50',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 12,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  verifiedBadge: {
    backgroundColor: '#ecfdf5',
    borderLeftColor: '#10b981',
    borderLeftWidth: 4,
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  verifiedText: {
    color: '#059669',
    fontWeight: '500',
    fontSize: 14,
  },
  resendText: {
    textAlign: 'center',
    color: '#6b7280',
    fontSize: 12,
    marginTop: 8,
  },
  resendLink: {
    textAlign: 'center',
    color: '#4caf50',
    fontSize: 12,
    fontWeight: '600',
    marginTop: 8,
  },
  error: {
    backgroundColor: '#fee2e2',
    color: '#b91c1c',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
    fontSize: 13,
  },
  switchText: {
    textAlign: 'center',
    color: '#6b7280',
    fontSize: 13,
    marginTop: 8,
  },
  link: {
    color: '#4caf50',
    fontWeight: '600',
  },
});
