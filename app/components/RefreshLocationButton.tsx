import { Pressable, StyleSheet, ActivityIndicator } from 'react-native';
import { RefreshCw } from 'lucide-react-native';
import { useLocation } from '../context/LocationContext';
import { useState } from 'react';
import { useAppTheme } from '../context/ThemeContext';

export default function RefreshLocationButton() {
  const { refreshLocation, locationStatus } = useLocation();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { colors } = useAppTheme();

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
    <Pressable
      style={({ pressed }) => [
        styles.button,
        { backgroundColor: colors.card, borderColor: colors.border },
        pressed && styles.pressed,
      ]}
      onPress={handleRefresh}
      disabled={isRefreshing}
    >
      {isRefreshing || locationStatus === 'detecting' ? (
        <ActivityIndicator size="small" color={colors.primary} />
      ) : (
        <RefreshCw size={18} color={colors.primary} />
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    width: 42,
    height: 42,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 14,
    borderWidth: 1,
  },
  pressed: {
    opacity: 0.84,
  },
});
