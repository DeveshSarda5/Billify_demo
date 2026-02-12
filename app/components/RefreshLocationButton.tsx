import { Pressable, StyleSheet, ActivityIndicator } from 'react-native';
import { RefreshCw } from 'lucide-react-native';
import { useLocation } from '../context/LocationContext';
import { useState } from 'react';

export default function RefreshLocationButton() {
  const { refreshLocation, locationStatus } = useLocation();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refreshLocation();
    } catch (error) {
      console.error('Error refreshing location:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <Pressable style={styles.button} onPress={handleRefresh} disabled={isRefreshing}>
      {isRefreshing || locationStatus === 'detecting' ? (
        <ActivityIndicator size="small" color="#4caf50" />
      ) : (
        <RefreshCw size={20} color="#4caf50" />
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    padding: 8,
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
