/**
 * Firebase Authentication Service
 * Handles email/password authentication using backend API
 */

import { auth } from '../config/firebase';

/**
 * Sign out current user
 */
export const signOutUser = async (): Promise<void> => {
  try {
    await auth.signOut();
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

/**
 * Get current user
 */
export const getCurrentUser = () => {
  return auth.currentUser;
};
