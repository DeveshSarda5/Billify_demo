import { useEffect, useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { ShoppingCart } from 'lucide-react-native';
import AppButton from '../components/ui/AppButton';
import AppCard from '../components/ui/AppCard';
import AppInput from '../components/ui/AppInput';
import Screen from '../components/ui/Screen';
import { useAuth } from '../context/AuthContext';
import { useAppTheme } from '../context/ThemeContext';
import { authAPI } from '../services/api';
import { radius } from '../theme';

export default function SignupScreen({ navigation }: any) {
  const { signup, login, setPhoneVerified } = useAuth();
  const { colors, isDark } = useAppTheme();

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
  const [canResendOtp, setCanResendOtp] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | undefined;

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

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [resendTimer]);

  const handlePhoneChange = (text: string) => {
    setPhone(text.replace(/[^0-9]/g, '').slice(0, 10));
    setError('');
  };

  const handleOtpChange = (text: string) => {
    setOtp(text.replace(/[^0-9]/g, '').slice(0, 6));
    setError('');
  };

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
    <Screen scrollable>
      <View style={styles.header}>
        <View style={[styles.logo, { backgroundColor: colors.primary }]}>
          <ShoppingCart size={32} color="#fff" />
        </View>
        <Text style={[styles.appName, { color: colors.text }]}>Billify</Text>
        <Text style={[styles.subtitle, { color: colors.textMuted }]}>Create account</Text>
      </View>

      <AppCard style={styles.sectionCard}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>1. Verify Phone Number</Text>

        {!phoneVerified ? (
          <>
            <AppInput
              placeholder="10-digit Phone Number"
              keyboardType="numeric"
              maxLength={10}
              value={phone}
              onChangeText={handlePhoneChange}
              editable={!otpSent}
              style={[styles.input, otpSent && styles.inputDisabled]}
            />

            {!otpSent ? (
              <AppButton onPress={handleGenerateOtp} loading={otpLoading} disabled={phone.length !== 10}>
                Send OTP
              </AppButton>
            ) : (
              <>
                <AppInput
                  placeholder="6-digit OTP"
                  keyboardType="numeric"
                  maxLength={6}
                  value={otp}
                  onChangeText={handleOtpChange}
                  style={styles.input}
                />
                <AppButton onPress={handleVerifyOtp} loading={verifyingOtp} disabled={otp.length !== 6}>
                  Verify OTP
                </AppButton>

                {!canResendOtp ? (
                  <Text style={[styles.resendText, { color: colors.textMuted }]}>Resend OTP in {resendTimer}s</Text>
                ) : (
                  <Pressable onPress={handleGenerateOtp}>
                    <Text style={[styles.resendLink, { color: colors.primary }]}>Resend OTP</Text>
                  </Pressable>
                )}
              </>
            )}
          </>
        ) : (
          <View style={[styles.verifiedBadge, { backgroundColor: colors.cardAlt, borderLeftColor: colors.primaryAlt }]}>
            <Text style={[styles.verifiedText, { color: colors.primary }]}>Phone Verified ({phone})</Text>
          </View>
        )}
      </AppCard>

      <AppCard style={styles.sectionCard}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>2. Account Details</Text>
        <AppInput placeholder="Full Name" value={name} onChangeText={(text) => { setName(text); setError(''); }} style={styles.input} />
        <AppInput placeholder="Email" autoCapitalize="none" keyboardType="email-address" value={email} onChangeText={(text) => { setEmail(text); setError(''); }} style={styles.input} />
        <AppInput placeholder="Password" secureTextEntry value={password} onChangeText={(text) => { setPassword(text); setError(''); }} style={styles.input} />
        <AppInput placeholder="Confirm Password" secureTextEntry value={confirm} onChangeText={(text) => { setConfirm(text); setError(''); }} style={styles.input} />
      </AppCard>

      {error ? <Text style={[styles.error, { backgroundColor: colors.warningBg, color: colors.warningText }]}>{error}</Text> : null}

      <AppButton onPress={handleSignup} loading={loading} disabled={!phoneVerified}>
        Create Account
      </AppButton>

      <Text style={[styles.footerText, { color: colors.textMuted }]}> 
        Already have an account?{' '}
        <Text style={[styles.link, { color: colors.primary }]} onPress={() => navigation.navigate('Login')}>
          Login
        </Text>
      </Text>
    </Screen>
  );
}

const styles = StyleSheet.create({
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
  sectionCard: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 14,
  },
  input: {
    marginBottom: 12,
  },
  inputDisabled: {
    opacity: 0.6,
  },
  resendText: {
    marginTop: 10,
    textAlign: 'center',
  },
  resendLink: {
    marginTop: 10,
    textAlign: 'center',
    fontWeight: '600',
  },
  verifiedBadge: {
    padding: 12,
    borderRadius: radius.md,
    borderLeftWidth: 4,
  },
  verifiedText: {
    fontWeight: '700',
    textAlign: 'center',
  },
  error: {
    padding: 12,
    borderRadius: 12,
    marginBottom: 12,
    fontSize: 13,
  },
  footerText: {
    textAlign: 'center',
    marginTop: 6,
    fontSize: 14,
  },
  link: {
    fontWeight: '700',
  },
});
