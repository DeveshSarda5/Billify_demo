/**
 * LocationHeader - Displays detected store location in header with rating
 * Shows location name, rating, detecting status, or error message
 */

import { View, Text, StyleSheet, StyleProp, TextStyle, ActivityIndicator } from 'react-native';
import { useEffect, useState } from 'react';
import { useLocation } from '../context/LocationContext';
import { getStoreRating } from '../services/ratingService';

export default function LocationHeader() {
  const { currentStore, locationStatus } = useLocation();
  const [rating, setRating] = useState<number>(0);
  const [loadingRating, setLoadingRating] = useState(false);

  useEffect(() => {
    if (currentStore?.id) {
      loadRating();
    }
  }, [currentStore?.id]);

  const loadRating = async () => {
    if (!currentStore?.id) return;
    setLoadingRating(true);
    try {
      const storeRating = await getStoreRating(currentStore.id);
      setRating(storeRating);
    } catch (error) {
      console.error('Error loading rating:', error);
    } finally {
      setLoadingRating(false);
    }
  };

  let displayText = '';
  let displayStyle: StyleProp<TextStyle> = styles.locationText;

  if (locationStatus === 'detecting') {
    displayText = '🔍 Detecting location…';
    displayStyle = [styles.locationText, styles.detecting];
  } else if (locationStatus === 'denied' || locationStatus === 'error') {
    displayText = '📍 Location unavailable';
    displayStyle = [styles.locationText, styles.unavailable];
  } else if (currentStore) {
    const ratingDisplay = rating > 0 ? ` ⭐ ${rating}` : '';
    displayText = `📍 ${currentStore.name}${ratingDisplay}`;
    displayStyle = styles.locationText;
  } else {
    displayText = '📍 No store detected';
    displayStyle = [styles.locationText, styles.unavailable];
  }

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={displayStyle} numberOfLines={1}>
          {displayText}
        </Text>
        {loadingRating && currentStore && (
          <ActivityIndicator size="small" color="#4caf50" style={styles.loader} />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingLeft: 16,
    paddingTop: 8,
    paddingBottom: 4,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationText: {
    fontSize: 13,
    color: '#666',
    fontWeight: '500',
    flex: 1,
  },
  detecting: {
    color: '#FF9800',
  },
  unavailable: {
    color: '#999',
    fontStyle: 'italic',
  },
  loader: {
    marginLeft: 6,
  },
});
