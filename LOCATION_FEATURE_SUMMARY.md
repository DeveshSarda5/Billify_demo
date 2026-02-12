/**
 * BILLIFY LOCATION FEATURE - IMPLEMENTATION SUMMARY
 * 
 * This document summarizes the location detection feature added to the Billify app.
 * 
 * ============================================================================
 * FEATURE OVERVIEW
 * ============================================================================
 * 
 * The app now automatically detects the user's device location on launch and displays
 * it in the header across all screens. This simulates real-world location-based behaviors
 * used in apps like Swiggy, Zomato, and BigBasket.
 * 
 * ============================================================================
 * FILES CREATED
 * ============================================================================
 * 
 * 1. app/constants/storeLocations.ts
 *    - Defines three demo store locations with GPS coordinates
 *    - Each location has: id, name, latitude, longitude, radius
 *    - Locations:
 *      * Phase 1 Hostel
 *      * Admin Building (Main Department Building)
 *      * Yamuna Hostel
 * 
 * 2. app/utils/locationUtils.ts
 *    - Haversine formula for distance calculation
 *    - detectStoreByLocation(): Detects if user is within any store's radius
 *    - Helper functions: calculateDistance(), getAllStores(), getStoreById()
 * 
 * 3. app/context/LocationContext.tsx
 *    - Global location state management using React Context
 *    - Handles automated location detection on app startup
 *    - Provides useLocation() hook for accessing location state
 *    - Manages location permission requests
 * 
 * 4. app/components/LocationHeader.tsx
 *    - Displays detected location in header
 *    - Shows status: "Detecting location…", "Location unavailable", or store name
 *    - Fully reactive - updates instantly when location changes
 * 
 * 5. app/components/LocationSelector.tsx
 *    - Modal component for manual location selection
 *    - Accessible from Profile screen (Settings > Select Location)
 *    - Lists all three demo locations
 *    - Shows current selection with highlighted state
 * 
 * ============================================================================
 * FILES MODIFIED (NON-BREAKING CHANGES)
 * ============================================================================
 * 
 * 1. App.tsx
 *    - Added LocationProvider wrapper around the app
 *    - Maintains existing AuthProvider and CartProvider
 * 
 * 2. app/screens/DashboardScreen.tsx
 *    - Added LocationHeader component import
 *    - Inserted LocationHeader after main header
 * 
 * 3. app/screens/ScanScreen.tsx
 *    - Added LocationHeader component import
 *    - Inserted LocationHeader after main header
 * 
 * 4. app/screens/CartScreen.tsx
 *    - Added LocationHeader component import
 *    - Inserted LocationHeader at top of main container
 * 
 * 5. app/screens/PaymentScreen.tsx
 *    - Added LocationHeader component import
 *    - Inserted LocationHeader at top of container
 * 
 * 6. app/screens/ProfileScreen.tsx
 *    - Added LocationSelector and useLocation imports
 *    - Added "Select Location" option in Settings section
 *    - Added state management for LocationSelector modal
 *    - Added LocationHeader component import
 *    - Added LocationHeader display
 * 
 * ============================================================================
 * HOW IT WORKS
 * ============================================================================
 * 
 * 1. APP INITIALIZATION
 *    - When app starts, LocationProvider requests location permission
 *    - Gets user's current GPS coordinates using expo-location
 *    - Runs once on app launch
 * 
 * 2. LOCATION DETECTION
 *    - Uses Haversine formula to calculate distance to each demo location
 *    - Checks if user is within any location's defined radius
 *    - If match found, stores location in global context
 *    - If no match, locationStatus is set to "detected" but currentStore is null
 * 
 * 3. GLOBAL STATE
 *    - LocationContext stores:
 *      * currentStore (id, name)
 *      * locationStatus (detecting, detected, denied, error)
 *      * userLocation (latitude, longitude)
 *      * isManuallyOverridden (tracks if user manually selected)
 * 
 * 4. HEADER DISPLAY
 *    - LocationHeader component reads from context
 *    - Shows different messages based on location status:
 *      * "🔍 Detecting location…" while permission/location being fetched
 *      * "📍 Phase 1 Hostel" (store name) if inside a store
 *      * "📍 No store detected" if outside all stores
 *      * "📍 Location unavailable" if permission denied or error
 * 
 * 5. MANUAL OVERRIDE
 *    - From Profile > Settings > Select Location
 *    - User can manually select any of the 3 demo locations
 *    - Modal shows current selection and coordinates
 *    - Useful for demo reliability
 * 
 * ============================================================================
 * NON-BREAKING INTEGRATION
 * ============================================================================
 * 
 * ✓ No existing screens were removed or renamed
 * ✓ No existing business logic was modified
 * ✓ No existing navigation structure was changed
 * ✓ LocationHeader only READS from context, doesn't modify it
 * ✓ All new functionality is optional and doesn't affect existing features
 * ✓ Location permission is gracefully handled if denied
 * ✓ App works normally if location detection fails
 * 
 * ============================================================================
 * DEPENDENCIES
 * ============================================================================
 * 
 * Uses existing expo-location package (already in package.json):
 * - expo-location: ~19.0.8
 * 
 * No new dependencies were added.
 * 
 * ============================================================================
 * TESTING THE FEATURE
 * ============================================================================
 * 
 * 1. Grant location permission when prompted
 * 2. See location header showing "🔍 Detecting location…"
 * 3. After detection:
 *    - If near demo location: Shows store name
 *    - If far away: Shows "📍 No store detected"
 * 4. To manually test: Go to Profile > Select Location to override
 * 5. Location appears on all screens: Dashboard, Scan, Cart, Payment, Profile
 * 
 * ============================================================================
 * CODE ORGANIZATION (STRICT ADHERENCE)
 * ============================================================================
 * 
 * ✓ Coordinates in: app/constants/storeLocations.ts
 * ✓ Detection logic in: app/utils/locationUtils.ts
 * ✓ Global state in: app/context/LocationContext.tsx
 * ✓ Header component in: app/components/LocationHeader.tsx
 * ✓ Selector modal in: app/components/LocationSelector.tsx
 * 
 * Clear separation of concerns following React best practices.
 * 
 * ============================================================================
 */
