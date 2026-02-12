/**
 * OTPVerificationScreen - Verify OTP sent to phone number
 * Used during Firebase phone authentication
 */

import { View, Text, StyleSheet, Pressable, TextInput, Alert, ActivityIndicator } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { useState } from 'react';

type Props = NativeStackScreenProps<RootStackParamList, 'OTPVerification'>;

export default function OTPVerificationScreen({ route, navigation }: Props) {
  const { phoneNumber } = route.params;
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleVerifyOTP = async () => {
    if (!otp || otp.length < 6) {
      setError('Please enter a valid 6-digit OTP');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // In production, this would call the Firebase verification service
      // For now, we'll use a mock verification
      if (otp === '123456') {
        // Mock OTP verification successful
        Alert.alert('Success', 'Phone number verified successfully!');
        
        // Navigate back to signup with verified flag
        navigation.navigate('Signup', { phoneVerified: true, phoneNumber });
      } else {
        throw new Error('Invalid OTP. Please try again.');
      }
    } catch (err: any) {
      console.error('OTP verification error:', err);
      setError(err.message || 'Invalid OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    Alert.alert('Resend OTP', 'OTP will be sent again to ' + phoneNumber);
    // In production, implement actual resend logic
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()}>
          <Text style={styles.backBtn}>← Back</Text>
        </Pressable>
        <Text style={styles.title}>Verify OTP</Text>
        <View style={{ width: 60 }} />
      </View>

      {/* Body */}
      <View style={styles.body}>
        <Text style={styles.subtitle}>
          We've sent a 6-digit OTP to
        </Text>
        <Text style={styles.phoneNumber}>{phoneNumber}</Text>

        {/* OTP Input */}
        <TextInput
          style={styles.otpInput}
          placeholder="Enter 6-digit OTP"
          placeholderTextColor="#9ca3af"
          keyboardType="number-pad"
          maxLength={6}
          value={otp}
          onChangeText={(text) => {
            setOtp(text);
            setError('');
          }}
          editable={!loading}
        />

        {/* Error Message */}
        {error && <Text style={styles.errorText}>{error}</Text>}

        {/* Verify Button */}
        <Pressable
          style={[styles.verifyBtn, loading && styles.disabledBtn]}
          onPress={handleVerifyOTP}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.verifyBtnText}>Verify OTP</Text>
          )}
        </Pressable>

        {/* Resend OTP */}
        <Pressable onPress={handleResendOTP} disabled={loading}>
          <Text style={styles.resendText}>
            Didn't receive OTP? <Text style={styles.resendLink}>Resend</Text>
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  backBtn: {
    fontSize: 16,
    color: '#4caf50',
    fontWeight: '600',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
  },
  body: {
    paddingHorizontal: 16,
    paddingTop: 32,
  },
  subtitle: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 8,
  },
  phoneNumber: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    textAlign: 'center',
    marginBottom: 24,
  },
  otpInput: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    padding: 14,
    fontSize: 18,
    fontWeight: '600',
    letterSpacing: 8,
    textAlign: 'center',
    marginBottom: 16,
    color: '#1f2937',
  },
  errorText: {
    fontSize: 13,
    color: '#ef4444',
    marginBottom: 16,
    textAlign: 'center',
  },
  verifyBtn: {
    backgroundColor: '#4caf50',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 20,
  },
  disabledBtn: {
    opacity: 0.6,
  },
  verifyBtnText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  resendText: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
  },
  resendLink: {
    color: '#4caf50',
    fontWeight: '600',
  },
});
