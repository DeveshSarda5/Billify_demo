/**
 * LocationContext - Global state for managing detected store location
 * Handles automatic location detection, app state changes, and manual overrides
 */

import { createContext, useContext, useEffect, useRef, useState } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import * as Location from 'expo-location';
import { detectStoreByLocation, DetectedStore } from '../utils/locationUtils';
import { useAuth } from './AuthContext';

type LocationContextType = {
  currentStore: DetectedStore | null;
  setCurrentStore: (store: DetectedStore | null) => void;
  locationStatus: 'detecting' | 'detected' | 'denied' | 'error';
  userLocation: { latitude: number; longitude: number } | null;
  isManuallyOverridden: boolean;
  refreshLocation: () => Promise<void>;
};

const LocationContext = createContext<LocationContextType>(null as any);

export function LocationProvider({ children }: { children: React.ReactNode }) {
  const { isLoggedIn } = useAuth();
  const [currentStore, setCurrentStore] = useState<DetectedStore | null>(null);
  const [locationStatus, setLocationStatus] = useState<'detecting' | 'detected' | 'denied' | 'error'>('detecting');
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [isManuallyOverridden, setIsManuallyOverridden] = useState(false);
  
  const appState = useRef(AppState.currentState);
  const refreshInProgress = useRef(false);

  /**
   * Core location detection function
   */
  const detectLocation = async () => {
    // Prevent multiple simultaneous requests
    if (refreshInProgress.current) return;
    
    // Skip if manually overridden
    if (isManuallyOverridden) return;

    refreshInProgress.current = true;

    try {
      setLocationStatus('detecting');

      // Request location permission
      const { status } = await Location.requestForegroundPermissionsAsync();

      if (status !== 'granted') {
        setLocationStatus('denied');
        console.warn('Location permission denied');
        refreshInProgress.current = false;
        return;
      }

      // Get current location
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      const { latitude, longitude } = location.coords;
      setUserLocation({ latitude, longitude });

      // Detect which store user is in
      const detectedStore = detectStoreByLocation(latitude, longitude);
      setCurrentStore(detectedStore);
      setLocationStatus('detected');
    } catch (error) {
      console.error('Location detection error:', error);
      setLocationStatus('error');
    } finally {
      refreshInProgress.current = false;
    }
  };

  /**
   * Public refresh method for manual location refresh
   */
  const refreshLocation = async () => {
    await detectLocation();
  };

  /**
   * Initialize location detection on app launch
   */
  useEffect(() => {
    detectLocation();
  }, []);

  /**
   * Listen to app state changes (foreground/background)
   */
  useEffect(() => {
    const subscription = AppState.addEventListener('change', handleAppStateChange);

    return () => {
      subscription.remove();
    };
  }, [isManuallyOverridden]);

  /**
   * Refresh location after login/logout
   */
  useEffect(() => {
    if (isLoggedIn) {
      // Refresh on login
      detectLocation();
    } else {
      // Reset on logout
      setCurrentStore(null);
      setUserLocation(null);
      setIsManuallyOverridden(false);
    }
  }, [isLoggedIn]);

  /**
   * Handle app state changes
   */
  const handleAppStateChange = async (nextAppState: AppStateStatus) => {
    const previousAppState = appState.current;
    appState.current = nextAppState;

    // When app comes back to foreground, refresh location
    if (
      previousAppState.match(/inactive|background/) &&
      nextAppState === 'active'
    ) {
      console.log('App came to foreground - refreshing location');
      await detectLocation();
    }
  };

  /**
   * Override current store manually (with tracking)
   */
  const handleSetCurrentStore = (store: DetectedStore | null) => {
    setCurrentStore(store);
    setIsManuallyOverridden(store !== null);
  };

  return (
    <LocationContext.Provider
      value={{
        currentStore,
        setCurrentStore: handleSetCurrentStore,
        locationStatus,
        userLocation,
        isManuallyOverridden,
        refreshLocation,
      }}
    >
      {children}
    </LocationContext.Provider>
  );
}

/**
 * Hook to use location context
 */
export function useLocation() {
  const context = useContext(LocationContext);
  if (!context) {
    throw new Error('useLocation must be used within a LocationProvider');
  }
  return context;
}
