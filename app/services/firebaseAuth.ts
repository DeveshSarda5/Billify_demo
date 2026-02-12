/**
 * Firebase Authentication Service
 * Handles phone authentication and OTP verification
 */

import {
  signInWithPhoneNumber,
  PhoneAuthProvider,
  signInWithCredential,
} from 'firebase/auth';
import { auth } from '../config/firebaseConfig';

// Store confirmation result globally
export let confirmationResult: any = null;

/**
 * Send OTP to phone number
 * @param phoneNumber - Phone number in format: +91XXXXXXXXXX
 */
export const sendOTP = async (phoneNumber: string): Promise<boolean> => {
  try {
    // Validate and format phone number
    if (!phoneNumber.startsWith('+')) {
      // Assume India if not prefixed
      if (phoneNumber.startsWith('0')) {
        // Remove leading 0
        return await sendOTP('+91' + phoneNumber.substring(1));
      }
      return await sendOTP('+91' + phoneNumber);
    }

    // For web/emulator: Mock confirmation for testing
    // In production, use actual Firebase reCAPTCHA
    if (typeof window !== 'undefined') {
      // Mock mode for testing
      console.log(`[MOCK] OTP would be sent to ${phoneNumber}`);
      confirmationResult = {
        confirm: async (otp: string) => {
          if (otp === '123456') {
            // Mock verification
            return { user: { uid: 'mock-' + Date.now() } };
          }
          throw new Error('Invalid OTP');
        },
      };
      return true;
    }

    // For native apps: Use Firebase sign-in with phone number
    const result = await signInWithPhoneNumber(auth, phoneNumber);
    confirmationResult = result;
    return true;
  } catch (error: any) {
    console.error('Send OTP error:', error);
    throw new Error(error.message || 'Failed to send OTP');
  }
};

/**
 * Verify OTP code
 * @param code - 6-digit OTP code
 */
export const verifyOTP = async (code: string): Promise<boolean> => {
  try {
    if (!confirmationResult) {
      throw new Error('No active verification session');
    }

    const result = await confirmationResult.confirm(code);
    return !!result.user;
  } catch (error: any) {
    console.error('Verify OTP error:', error);
    throw new Error(error.message || 'Invalid OTP');
  }
};

/**
 * Get current user phone number
 */
export const getCurrentUserPhone = (): string | null => {
  const user = auth.currentUser;
  return user?.phoneNumber || null;
};

/**
 * Sign out current user
 */
export const signOutUser = async (): Promise<void> => {
  try {
    await auth.signOut();
    confirmationResult = null;
  } catch (error: any) {
    console.error('Sign out error:', error);
    throw new Error(error.message || 'Failed to sign out');
  }
};

/**
 * Check if user is authenticated via Firebase
 */
export const isFirebaseAuthenticated = (): boolean => {
  return !!auth.currentUser;
};
