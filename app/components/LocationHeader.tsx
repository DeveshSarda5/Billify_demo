/**
 * LocationHeader - Displays detected store location in header with rating
 * Shows location name, rating, detecting status, or error message
 */

import { View, Text, StyleSheet, StyleProp, TextStyle } from 'react-native';
import { useLocation } from '../context/LocationContext';

export default function LocationHeader() {
  const { currentStore, locationStatus } = useLocation();

  let displayText = '';
  let displayStyle: StyleProp<TextStyle> = styles.locationText;

  if (locationStatus === 'detecting') {
    displayText = '🔍 Detecting location…';
    displayStyle = [styles.locationText, styles.detecting];
  } else if (locationStatus === 'denied' || locationStatus === 'error') {
    displayText = '📍 Location unavailable';
    displayStyle = [styles.locationText, styles.unavailable];
  } else if (currentStore) {
    displayText = `📍 ${currentStore.name}`;
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
});
