import { useState, useRef } from 'react';
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
import { FirebaseRecaptchaVerifierModal } from 'expo-firebase-recaptcha';
import { useAuth } from '../context/AuthContext';
import { auth, firebaseConfig } from '../config/firebase';
import {
  signInWithPhoneNumber,
  PhoneAuthProvider,
  signInWithCredential,
} from 'firebase/auth';

export default function SignupScreen({ navigation }: any) {
  const { signup, login } = useAuth();
  const recaptchaVerifier = useRef<any>(null);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [otp, setOtp] = useState('');

  const [verificationId, setVerificationId] = useState<string | null>(null);
  const [phoneVerified, setPhoneVerified] = useState(false);
  const [otpSent, setOtpSent] = useState(false);

  const [loading, setLoading] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);
  const [error, setError] = useState('');

  // ================= PHONE OTP =================
  const handleSendOTP = async () => {
    if (!phone) {
      setError('Please enter your phone number');
      return;
    }

    try {
      setOtpLoading(true);
      setError('');

      const formattedPhone = phone.startsWith('+')
        ? phone
        : `+91${phone}`;

      const confirmation = await signInWithPhoneNumber(
        auth,
        formattedPhone,
        recaptchaVerifier.current
      );

      setVerificationId(confirmation.verificationId);
      setOtpSent(true);
    } catch (err: any) {
      setError(err.message || 'Failed to send OTP');
    } finally {
      setOtpLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (!otp || !verificationId) {
      setError('Enter valid OTP');
      return;
    }

    try {
      setOtpLoading(true);
      setError('');

      const credential = PhoneAuthProvider.credential(
        verificationId,
        otp
      );

      await signInWithCredential(auth, credential);

      setPhoneVerified(true);
      setOtp('');
    } catch (err: any) {
      setError('Invalid OTP');
    } finally {
      setOtpLoading(false);
    }
  };

  // ================= SIGNUP =================
  const handleSignup = async () => {
    if (!phoneVerified) {
      setError('Please verify your phone first');
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

    try {
      setLoading(true);
      setError('');

      await signup({ name, email, phone, password });
      await login(email, password);

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
      <FirebaseRecaptchaVerifierModal
        ref={recaptchaVerifier}
        firebaseConfig={firebaseConfig}
      />

      <ScrollView contentContainerStyle={{ paddingBottom: 24 }}>
        <View style={styles.header}>
          <View style={styles.logo}>
            <ShoppingCart size={32} color="#fff" />
          </View>
          <Text style={styles.appName}>Billify</Text>
          <Text style={styles.subtitle}>Create Account</Text>
        </View>

        <TextInput
          placeholder="Full Name"
          style={styles.input}
          value={name}
          onChangeText={setName}
        />

        <TextInput
          placeholder="Email"
          style={styles.input}
          autoCapitalize="none"
          value={email}
          onChangeText={setEmail}
        />

        {/* Phone Section */}
        <View style={{ flexDirection: 'row', gap: 8 }}>
          <TextInput
            placeholder="Phone"
            style={[styles.input, { flex: 1 }]}
            keyboardType="phone-pad"
            value={phone}
            onChangeText={setPhone}
            editable={!phoneVerified}
          />

          {!phoneVerified && (
            <Pressable
              style={styles.otpButton}
              onPress={handleSendOTP}
              disabled={otpLoading}
            >
              <Text style={styles.buttonText}>
                {otpLoading ? '...' : 'Send OTP'}
              </Text>
            </Pressable>
          )}
        </View>

        {otpSent && !phoneVerified && (
          <>
            <TextInput
              placeholder="Enter OTP"
              style={styles.input}
              keyboardType="number-pad"
              value={otp}
              onChangeText={setOtp}
            />

            <Pressable
              style={styles.button}
              onPress={handleVerifyOTP}
              disabled={otpLoading}
            >
              <Text style={styles.buttonText}>
                {otpLoading ? 'Verifying...' : 'Verify OTP'}
              </Text>
            </Pressable>
          </>
        )}

        {phoneVerified && (
          <Text style={{ color: 'green', marginBottom: 12 }}>
            ✓ Phone Verified
          </Text>
        )}

        <TextInput
          placeholder="Password"
          style={styles.input}
          secureTextEntry
          value={password}
          onChangeText={setPassword}
          editable={phoneVerified}
        />

        <TextInput
          placeholder="Confirm Password"
          style={styles.input}
          secureTextEntry
          value={confirm}
          onChangeText={setConfirm}
          editable={phoneVerified}
        />

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <Pressable
          style={[
            styles.button,
            (loading || !phoneVerified) && styles.buttonDisabled,
          ]}
          onPress={handleSignup}
          disabled={loading || !phoneVerified}
        >
          <Text style={styles.buttonText}>
            {loading ? 'Signing Up...' : 'Sign Up'}
          </Text>
        </Pressable>

        {/* Optional Back to Login */}
        <Pressable onPress={() => navigation.navigate('Login')}>
          <Text style={{ textAlign: 'center', color: '#4caf50' }}>
            Already have an account? Login
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
  phoneSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  otpButton: {
    backgroundColor: '#4caf50',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 48,
  },
  otpButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 13,
  },
  otpSection: {
    marginBottom: 12,
  },
  successMessage: {
    backgroundColor: '#dcfce7',
    borderColor: '#22c55e',
    borderWidth: 1,
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
    alignItems: 'center',
  },
  successText: {
    color: '#16a34a',
    fontWeight: '600',
    fontSize: 14,
  },
  phoneMessage: {
    color: '#4caf50',
    fontSize: 13,
    fontWeight: '500',
    marginBottom: 12,
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
