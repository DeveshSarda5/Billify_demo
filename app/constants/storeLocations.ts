/**
 * Predefined demo store locations with coordinates and radius.
 * Used for geofencing and location detection.
 */

export type StoreLocation = {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  radius: number; // in meters
};

// Demo locations - Using campus coordinates as examples
export const STORE_LOCATIONS: StoreLocation[] = [
  {
    id: 'phase1-hostel',
    name: 'Phase 1 Hostel',
    latitude:  28.812391625369568,
    longitude: 77.1313407653025,
    radius: 500, // 500 meters
  },
  {
    id: 'admin-building',
    name: 'Admin Building (Main Department Building)',
    latitude: 28.811691275897275,
    longitude: 77.13295545515787,
    radius: 400, // 400 meters
  },
  {
    id: 'yamuna-hostel',
    name: 'Yamuna Hostel',
    latitude: 28.816123409508837,
    longitude: 77.13266298126727,
    radius: 450, // 450 meters
  },
];
