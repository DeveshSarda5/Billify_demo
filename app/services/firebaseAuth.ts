/**
 * Authentication Service
 * All authentication now handled via backend API
 */

/**
 * Sign out current user
 */
export const signOutUser = async (): Promise<void> => {
  // Logout is handled via AuthContext
  // This function is kept for compatibility
};

/**
 * Check if user is authenticated
 */
export const isFirebaseAuthenticated = (): boolean => {
  // Authentication state is managed in AuthContext
  // This is maintained for backward compatibility
  return false;
};

/**
 * Get current user
 */
export const getCurrentUser = () => {
  // User data is stored in AsyncStorage and AuthContext
  return null;
};
