import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';

/**
 * DEPRECATED: OTPVerificationScreen
 * OTP verification has been removed from the app.
 * All authentication is now handled via email/password through the backend API.
 */
export default function OTPVerificationScreen() {
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);

  const handleVerify = async () => {
    Alert.alert(
      'Feature Removed',
      'OTP verification is no longer available. All authentication is done via email/password.'
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>OTP Verification (Deprecated)</Text>
      </View>

      <View style={styles.body}>
        <Text style={styles.subtitle}>
          This feature is no longer available.
        </Text>

        <TextInput
          style={styles.otpInput}
          placeholder="Enter 6-digit OTP"
          placeholderTextColor="#9ca3af"
          keyboardType="number-pad"
          maxLength={6}
          value={otp}
          onChangeText={setOtp}
          editable={false}
        />

        <Pressable
          style={[styles.verifyBtn]}
          onPress={handleVerify}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.verifyBtnText}>This feature is unavailable</Text>
          )}
        </Pressable>

        <Text style={styles.resendText}>
          Please use email/password login in the Login screen.
        </Text>
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
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
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
    color: '#999',
  },
  verifyBtn: {
    backgroundColor: '#ccc',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 20,
  },
  verifyBtnText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#999',
  },
  resendText: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
});
