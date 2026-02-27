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
    latitude: 28.812391625369568,
    longitude: 77.1313407653025,
    radius: 100, // Reduced from 500 to 100 meters
  },
  {
    id: 'admin-building',
    name: 'Admin Building (Main Department Building)',
    latitude: 28.811691275897275,
    longitude: 77.13295545515787,
    radius: 100, // Reduced from 400 to 100 meters
  },
  {
    id: 'yamuna-hostel',
    name: 'Yamuna Hostel',
    latitude: 28.816123409508837,
    longitude: 77.13266298126727,
    radius: 100, // Reduced from 450 to 100 meters
  },
   {
    id: 'mona-greens-2',
    name: 'Mona Greens 2',
    latitude: 30.637448723650834,
    longitude: 76.83373461161844,
    radius: 500, // 500 meters
  },
  {
    id: 'metro-town',
    name: 'Metro Town',
    latitude: 30.654888165167495,
    longitude: 76.85606058278287,
    radius: 500,
  },
  {
    id: 'bandra-kurla-complex',
    name: 'Bandra Kurla Complex',
    latitude: 19.068921101847486,
    longitude: 72.87025742233867,
    radius: 500,
  },
];
