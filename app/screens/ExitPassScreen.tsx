import { View, Text, StyleSheet, Pressable, Alert, ActivityIndicator } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import * as Location from 'expo-location';
import { useState, useEffect } from 'react';
import { paymentAPI } from '../services/api';

type Props = NativeStackScreenProps<RootStackParamList, 'ExitPass'>;

export default function ExitPassScreen({ navigation, route }: Props) {
  const passId = Math.floor(100000 + Math.random() * 900000);
  const billId = route.params?.billId;

  const [verifying, setVerifying] = useState(false);
  const [verified, setVerified] = useState(false);
  const [verificationError, setVerificationError] = useState('');
  const [verificationData, setVerificationData] = useState<any>(null);

  // Start verification on mount
  useEffect(() => {
    if (billId) {
      verifyBillLocation();
    }
  }, [billId]);

  const verifyBillLocation = async () => {
    setVerifying(true);
    setVerificationError('');

    try {
      // Request location permission
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setVerificationError('Location permission denied');
        setVerifying(false);
        return;
      }

      // Get current position with HIGH accuracy
      const position = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      const { latitude, longitude } = position.coords;

      // Call backend verification
      if (billId) {
        const response = await paymentAPI.verifyBill({
          billId,
          userLatitude: latitude,
          userLongitude: longitude,
        });

        if (response.success) {
          setVerified(true);
          setVerificationData(response);
          Alert.alert('Verified', `You're verified at ${response.nearestStoreName}`);
        }
      } else {
        setVerificationError('No bill ID provided');
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Verification failed';
      setVerificationError(errorMessage);
      Alert.alert('Verification Failed', errorMessage);
    } finally {
      setVerifying(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Exit Pass</Text>

      <View style={styles.card}>
        <Text style={styles.success}>Payment Successful</Text>

        <Text style={styles.label}>Pass ID</Text>
        <Text style={styles.passId}>{passId}</Text>

        {/* Verification Status Section */}
        <View style={styles.verificationSection}>
          {verifying ? (
            <>
              <ActivityIndicator size="large" color="#4caf50" style={{ marginVertical: 20 }} />
              <Text style={styles.verifyingText}>Verifying location...</Text>
            </>
          ) : verified ? (
            <>
              <View style={styles.verifiedBadge}>
                <Text style={styles.verifiedText}>VERIFIED</Text>
              </View>
              <Text style={styles.verifiedAt}>
                Verified at {verificationData?.nearestStoreName}
              </Text>
              <Text style={styles.distance}>
                Distance: {verificationData?.distanceInMeters}m
              </Text>
            </>
          ) : verificationError ? (
            <>
              <Text style={styles.errorText}>{verificationError}</Text>
              <Pressable style={styles.retryBtn} onPress={verifyBillLocation}>
                <Text style={styles.retryText}>Retry Verification</Text>
              </Pressable>
            </>
          ) : null}
        </View>

        <Text style={styles.meta}>
          Show this screen at the exit gate
        </Text>
      </View>

      <Pressable
        style={styles.doneBtn}
        onPress={() => navigation.popToTop()}
      >
        <Text style={styles.doneText}>Back to Dashboard</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f9fafb',
    justifyContent: 'center',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 18,
    alignItems: 'center',
    marginBottom: 20,
  },
  success: {
    fontSize: 18,
    fontWeight: '600',
    color: '#22c55e',
    marginBottom: 16,
  },
  label: {
    color: '#6b7280',
    marginTop: 10,
  },
  passId: {
    fontSize: 28,
    fontWeight: 'bold',
    marginTop: 6,
  },
  verificationSection: {
    marginVertical: 12,
    marginTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    paddingTop: 12,
  },
  verifyingText: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    marginTop: 10,
  },
  verifiedBadge: {
    backgroundColor: '#22c55e',
    paddingVertical: 12,
    paddingHorizontal: 28,
    borderRadius: 12,
    marginVertical: 12,
  },
  verifiedText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    letterSpacing: 2,
  },
  verifiedAt: {
    fontSize: 14,
    color: '#059669',
    fontWeight: '600',
    marginTop: 10,
    textAlign: 'center',
  },
  distance: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 6,
    textAlign: 'center',
  },
  errorText: {
    fontSize: 14,
    color: '#dc2626',
    textAlign: 'center',
    marginVertical: 12,
  },
  retryBtn: {
    backgroundColor: '#3b82f6',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginTop: 12,
    alignSelf: 'center',
  },
  retryText: {
    color: '#fff',
    fontWeight: '600',
  },
  meta: {
    color: '#6b7280',
    marginTop: 16,
    textAlign: 'center',
  },
  doneBtn: {
    backgroundColor: '#4caf50',
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
  },
  doneText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
});