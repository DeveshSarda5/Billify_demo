import { View, Text, StyleSheet, Pressable } from 'react-native';
import { RefreshCw, MapPin } from 'lucide-react-native';
import { useLocation } from '../context/LocationContext';

export default function LocationHeader() {
  const { currentStore, locationStatus, refreshLocation } = useLocation();

  const isDetecting = locationStatus === 'detecting';

  let displayText = '';
  let statusColor = '#666';

  if (locationStatus === 'detecting') {
    displayText = 'Detecting location…';
    statusColor = '#FF9800';
  } else if (locationStatus === 'denied' || locationStatus === 'error') {
    displayText = 'Location unavailable';
    statusColor = '#ef4444';
  } else if (currentStore) {
    displayText = currentStore.name;
    statusColor = '#4caf50';
  } else {
    displayText = 'No store detected';
    statusColor = '#999';
  }

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <MapPin size={16} color={statusColor} style={styles.icon} />
        <Text
          style={[styles.locationText, { color: statusColor }]}
          numberOfLines={1}
        >
          {displayText}
        </Text>
        <Pressable
          onPress={() => refreshLocation()}
          disabled={isDetecting}
          style={({ pressed }) => [
            styles.refreshBtn,
            pressed && styles.pressed,
            isDetecting && styles.disabled,
          ]}
        >
          <RefreshCw
            size={14}
            color="#666"
            style={isDetecting ? styles.spinning : null}
          />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#f9fafb',
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    marginRight: 6,
  },
  locationText: {
    fontSize: 13,
    fontWeight: '600',
    flex: 1,
  },
  refreshBtn: {
    padding: 6,
    borderRadius: 8,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  pressed: {
    backgroundColor: '#f3f4f6',
    opacity: 0.7,
  },
  disabled: {
    opacity: 0.5,
  },
  spinning: {
    // Note: React Native doesn't support CSS animations like this directly without Animated API
    // but we'll leave it simple for now as a visual hint.
    opacity: 0.5,
  },
});
