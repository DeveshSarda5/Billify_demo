/**
 * Location utility functions for distance calculation and store detection.
 * Uses Haversine formula to calculate distance between two GPS coordinates.
 */

import { STORE_LOCATIONS, StoreLocation } from '../constants/storeLocations';

/**
 * Calculate distance between two GPS coordinates using Haversine formula.
 * @param lat1 - Current latitude
 * @param lon1 - Current longitude
 * @param lat2 - Target latitude
 * @param lon2 - Target longitude
 * @returns Distance in meters
 */
export const calculateDistance = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number => {
  const R = 6371000; // Earth's radius in meters
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) *
    Math.cos(toRadians(lat2)) *
    Math.sin(dLon / 2) *
    Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

/**
 * Convert degrees to radians
 */
const toRadians = (degrees: number): number => {
  return (degrees * Math.PI) / 180;
};

export type DetectedStore = {
  id: string;
  name: string;
};

/**
 * Detect which predefined store location the user is inside based on GPS coordinates.
 * @param latitude - User's current latitude
 * @param longitude - User's current longitude
 * @returns Detected store location or null if not in any store's radius
 */
export const detectStoreByLocation = (
  latitude: number,
  longitude: number
): DetectedStore | null => {
  let closestStore: DetectedStore | null = null;
  let minDistance = Infinity;

  for (const store of STORE_LOCATIONS) {
    const distance = calculateDistance(
      latitude,
      longitude,
      store.latitude,
      store.longitude
    );

    if (distance <= store.radius && distance < minDistance) {
      minDistance = distance;
      closestStore = {
        id: store.id,
        name: store.name,
      };
    }
  }

  return closestStore;
};

/**
 * Get all available store locations (for manual selection)
 */
export const getAllStores = (): StoreLocation[] => {
  return STORE_LOCATIONS;
};

/**
 * Get a specific store by ID
 */
export const getStoreById = (id: string): StoreLocation | undefined => {
  return STORE_LOCATIONS.find((store) => store.id === id);
};

/**
 * ============ WATERMARK UTILITIES ============
 */

export const RANDOM_WATERMARKS = [
  'VERIFIED',
  'ORIGINAL',
  'CERTIFIED',
  'AUTHENTIC',
  'CONFIRMED',
  'APPROVED',
  'OFFICIAL',
  'GENUINE',
  'VALID',
  'RECEIPT',
];

/**
 * Get a random watermark text
 */
export const getRandomWatermark = (): string => {
  return RANDOM_WATERMARKS[Math.floor(Math.random() * RANDOM_WATERMARKS.length)];
};

/**
 * Generate watermark HTML for PDFs
 */
export const generateWatermarkHTML = (text: string): string => {
  return `
    <div style="
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%) rotate(-45deg);
      font-size: 120px;
      font-weight: bold;
      opacity: 0.08;
      color: #000;
      z-index: 0;
      width: 200%;
      height: 200%;
      pointer-events: none;
      display: flex;
      align-items: center;
      justify-content: center;
    ">
      ${text}
    </div>
  `;
};
