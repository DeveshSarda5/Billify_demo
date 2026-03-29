import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ChevronRight, RefreshCw, MapPin } from 'lucide-react-native';
import { useLocation } from '../context/LocationContext';
import { useAppTheme } from '../context/ThemeContext';
import { RootStackParamList } from '../navigation/AppNavigator';

export default function LocationHeader() {
  const { currentStore, locationStatus, refreshLocation } = useLocation();
  const { colors } = useAppTheme();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const isDetecting = locationStatus === 'detecting';

  let displayText = '';
  let statusColor = '#666';

  if (currentStore) {
    displayText = currentStore.name;
    statusColor = '#4caf50';
  } else if (locationStatus === 'detecting') {
    displayText = 'Finding nearby stores…';
    statusColor = '#FF9800';
  } else if (locationStatus === 'denied' || locationStatus === 'error') {
    displayText = 'Select your store';
    statusColor = '#ef4444';
  } else {
    displayText = 'Choose your store';
    statusColor = colors.textMuted;
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.card, borderBottomColor: colors.divider }] }>
      <View style={styles.content}>
        <Pressable
          style={({ pressed }) => [styles.storeButton, pressed && styles.pressed]}
          onPress={() => navigation.navigate('StoreSelection', { mode: 'manual', returnTo: 'back' })}
        >
          <MapPin size={16} color={statusColor} style={styles.icon} />
          <Text
            style={[styles.locationText, { color: statusColor }]}
            numberOfLines={1}
          >
            {displayText}
          </Text>
          <Text style={[styles.changeText, { color: colors.primary }]}>Change</Text>
          <ChevronRight size={14} color={colors.primary} />
        </Pressable>
        <Pressable
          onPress={() => refreshLocation()}
          disabled={isDetecting}
          style={({ pressed }) => [
            styles.refreshBtn,
            { backgroundColor: colors.background, borderColor: colors.border },
            pressed && styles.pressed,
            isDetecting && styles.disabled,
          ]}
        >
          <RefreshCw
            size={14}
            color={colors.icon}
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
    borderBottomWidth: 1,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  storeButton: {
    flex: 1,
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
  changeText: {
    fontSize: 12,
    fontWeight: '700',
    marginRight: 2,
  },
  refreshBtn: {
    padding: 6,
    borderRadius: 8,
    borderWidth: 1,
  },
  pressed: {
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
