/**
 * HAVERSINE FORMULA UTILITY
 * Calculate distance between two geographic points
 * Returns distance in meters
 * 
 * Formula:
 * a = sin²(Δlat/2) + cos(lat1) ⋅ cos(lat2) ⋅ sin²(Δlon/2)
 * c = 2 ⋅ atan2(√a, √(1−a))
 * d = R ⋅ c
 */

function calculateDistance(lat1, lon1, lat2, lon2) {
  // Earth's radius in KILOMETERS (will convert to meters at the end)
  const R = 6371;
  
  // Convert degrees to radians
  const toRad = Math.PI / 180;
  
  // Calculate differences in radians
  const dLat = (lat2 - lat1) * toRad;
  const dLon = (lon2 - lon1) * toRad;
  
  // Convert input coordinates to radians
  const lat1Rad = lat1 * toRad;
  const lat2Rad = lat2 * toRad;
  
  // Haversine formula
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1Rad) * Math.cos(lat2Rad) * 
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  
  // Distance in kilometers
  const distanceKm = R * c;
  
  // Convert to meters and round
  const distanceMeters = distanceKm * 1000;
  
  return Math.round(distanceMeters);
}

module.exports = { calculateDistance };

