/**
 * LocationContext - Global state for managing detected store location
 * Handles automatic location detection, app state changes, and manual overrides
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useContext, useEffect, useRef, useState } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import * as Location from 'expo-location';
import { DetectedStore, getStoreById, mapStoreToDetectedStore, UserCoordinates } from '../utils/locationUtils';
import { useAuth } from './AuthContext';

type LocationStatus = 'idle' | 'detecting' | 'ready' | 'denied' | 'error';

type SetCurrentStoreOptions = {
  manualOverride?: boolean;
  persist?: boolean;
};

const SELECTED_STORE_KEY = 'selected_store_id';
const STORE_OVERRIDE_KEY = 'selected_store_manual_override';

type LocationContextType = {
  currentStore: DetectedStore | null;
  setCurrentStore: (store: DetectedStore | null, options?: SetCurrentStoreOptions) => Promise<void>;
  locationStatus: LocationStatus;
  userLocation: UserCoordinates | null;
  isManuallyOverridden: boolean;
  hasSelectedStore: boolean;
  isHydratingSelection: boolean;
  requestLocationAccess: () => Promise<boolean>;
  refreshLocation: () => Promise<boolean>;
  clearSelectedStore: () => Promise<void>;
};

const LocationContext = createContext<LocationContextType>(null as any);

export function LocationProvider({ children }: { children: React.ReactNode }) {
  const { isLoggedIn, loading } = useAuth();
  const [currentStore, setCurrentStoreState] = useState<DetectedStore | null>(null);
  const [locationStatus, setLocationStatus] = useState<LocationStatus>('idle');
  const [userLocation, setUserLocation] = useState<UserCoordinates | null>(null);
  const [isManuallyOverridden, setIsManuallyOverridden] = useState(false);
  const [hasSelectedStore, setHasSelectedStore] = useState(false);
  const [isHydratingSelection, setIsHydratingSelection] = useState(true);

  const appState = useRef(AppState.currentState);
  const refreshInProgress = useRef(false);

  const persistSelectedStore = async (store: DetectedStore | null, manualOverride: boolean) => {
    if (!store) {
      await AsyncStorage.multiRemove([SELECTED_STORE_KEY, STORE_OVERRIDE_KEY]);
      return;
    }

    await AsyncStorage.multiSet([
      [SELECTED_STORE_KEY, store.id],
      [STORE_OVERRIDE_KEY, manualOverride ? 'true' : 'false'],
    ]);
  };

  const resetLocationState = () => {
    setCurrentStoreState(null);
    setHasSelectedStore(false);
    setIsManuallyOverridden(false);
    setUserLocation(null);
    setLocationStatus('idle');
  };

  const fetchUserLocation = async (requestPermission: boolean) => {
    if (refreshInProgress.current) {
      return null;
    }

    refreshInProgress.current = true;

    try {
      setLocationStatus('detecting');

      const permission = requestPermission
        ? await Location.requestForegroundPermissionsAsync()
        : await Location.getForegroundPermissionsAsync();

      if (permission.status !== 'granted') {
        setLocationStatus('denied');
        return null;
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      const coords = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      };

      setUserLocation(coords);
      setLocationStatus('ready');
      return coords;
    } catch (error) {
      console.error('Location detection error:', error);
      setLocationStatus('error');
      return null;
    } finally {
      refreshInProgress.current = false;
    }
  };

  useEffect(() => {
    const hydrateSelection = async () => {
      try {
        const [[, storedStoreId], [, storedOverride]] = await AsyncStorage.multiGet([
          SELECTED_STORE_KEY,
          STORE_OVERRIDE_KEY,
        ]);

        if (storedStoreId) {
          const store = getStoreById(storedStoreId);

          if (store) {
            setCurrentStoreState(mapStoreToDetectedStore(store));
            setHasSelectedStore(true);
            setIsManuallyOverridden(storedOverride === 'true');
          } else {
            await AsyncStorage.multiRemove([SELECTED_STORE_KEY, STORE_OVERRIDE_KEY]);
          }
        }
      } catch (error) {
        console.error('Failed to restore selected store:', error);
      } finally {
        setIsHydratingSelection(false);
      }
    };

    void hydrateSelection();
  }, []);

  useEffect(() => {
    if (loading || isHydratingSelection) {
      return;
    }

    if (!isLoggedIn) {
      resetLocationState();
      void AsyncStorage.multiRemove([SELECTED_STORE_KEY, STORE_OVERRIDE_KEY]);
    }
  }, [isHydratingSelection, isLoggedIn, loading]);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', handleAppStateChange);

    return () => {
      subscription.remove();
    };
  }, [locationStatus, userLocation]);

  const handleAppStateChange = async (nextAppState: AppStateStatus) => {
    const previousAppState = appState.current;
    appState.current = nextAppState;

    if (
      previousAppState.match(/inactive|background/) &&
      nextAppState === 'active' &&
      userLocation &&
      locationStatus !== 'denied'
    ) {
      await fetchUserLocation(false);
    }
  };

  const handleSetCurrentStore = async (store: DetectedStore | null, options: SetCurrentStoreOptions = {}) => {
    if (!store) {
      resetLocationState();
      await persistSelectedStore(null, false);
      return;
    }

    const manualOverride = options.manualOverride ?? true;
    const matchingStore = getStoreById(store.id);
    const normalizedStore = matchingStore
      ? mapStoreToDetectedStore(matchingStore, store.distanceMeters ?? null)
      : store;

    setCurrentStoreState(normalizedStore);
    setHasSelectedStore(true);
    setIsManuallyOverridden(manualOverride);

    if (options.persist !== false) {
      await persistSelectedStore(normalizedStore, manualOverride);
    }
  };

  const requestLocationAccess = async () => {
    const coords = await fetchUserLocation(true);
    return coords !== null;
  };

  const refreshLocation = async () => {
    const shouldRequestPermission = !userLocation || locationStatus === 'idle' || locationStatus === 'denied' || locationStatus === 'error';
    const coords = await fetchUserLocation(shouldRequestPermission);
    return coords !== null;
  };

  const clearSelectedStore = async () => {
    await handleSetCurrentStore(null);
  };

  return (
    <LocationContext.Provider
      value={{
        currentStore,
        setCurrentStore: handleSetCurrentStore,
        locationStatus,
        userLocation,
        isManuallyOverridden,
        hasSelectedStore,
        isHydratingSelection,
        requestLocationAccess,
        refreshLocation,
        clearSelectedStore,
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
