import { useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Animated,
  Easing,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ArrowLeft, MapPin, Navigation, Search } from 'lucide-react-native';
import Screen from '../components/ui/Screen';
import { useLocation } from '../context/LocationContext';
import { useAppTheme } from '../context/ThemeContext';
import { RootStackParamList } from '../navigation/AppNavigator';
import { radius, shadows } from '../theme';
import { formatDistance, getStoresSortedByDistance, StoreWithDistance } from '../utils/locationUtils';

type Props = NativeStackScreenProps<RootStackParamList, 'StoreSelection'>;
type ListMode = 'manual' | 'nearby';

export default function StoreSelectionScreen({ navigation, route }: Props) {
  const { colors, isDark } = useAppTheme();
  const { currentStore, userLocation, locationStatus, refreshLocation, setCurrentStore } = useLocation();
  const [query, setQuery] = useState('');
  const [listMode, setListMode] = useState<ListMode>(route.params?.mode ?? (userLocation ? 'nearby' : 'manual'));
  const [locationLoading, setLocationLoading] = useState(false);
  const [savingStoreId, setSavingStoreId] = useState<string | null>(null);
  const contentOpacity = useRef(new Animated.Value(0)).current;
  const contentTranslateY = useRef(new Animated.Value(18)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(contentOpacity, {
        toValue: 1,
        duration: 260,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(contentTranslateY, {
        toValue: 0,
        duration: 260,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();
  }, [contentOpacity, contentTranslateY]);

  useEffect(() => {
    if (route.params?.mode) {
      setListMode(route.params.mode);
    }
  }, [route.params?.mode]);

  const stores = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    const results = getStoresSortedByDistance(userLocation, listMode === 'manual');

    if (!normalizedQuery) {
      return results;
    }

    return results.filter((store) => {
      const haystack = `${store.name} ${store.area} ${store.address}`.toLowerCase();
      return haystack.includes(normalizedQuery);
    });
  }, [listMode, query, userLocation]);

  const nearestStoreId = useMemo(() => {
    const nearbyStores = getStoresSortedByDistance(userLocation, false);
    return nearbyStores[0]?.id ?? null;
  }, [userLocation]);

  const canUseNearbyMode = !!userLocation && listMode === 'nearby';

  const handleUseCurrentLocation = async () => {
    setLocationLoading(true);

    try {
      const granted = await refreshLocation();

      if (!granted) {
        Alert.alert('Location unavailable', 'Please allow location access or continue by choosing a store manually.');
        return;
      }

      setListMode('nearby');
    } finally {
      setLocationLoading(false);
    }
  };

  const handleSelectStore = async (store: StoreWithDistance) => {
    setSavingStoreId(store.id);

    try {
      await setCurrentStore(store, { manualOverride: !(listMode === 'nearby' && !!userLocation) });

      if (route.params?.returnTo === 'back' && navigation.canGoBack()) {
        navigation.goBack();
        return;
      }

      navigation.reset({
        index: 0,
        routes: [{ name: 'Dashboard' }],
      });
    } finally {
      setSavingStoreId(null);
    }
  };

  const renderStore = ({ item }: { item: StoreWithDistance }) => {
    const isSelected = currentStore?.id === item.id;
    const isNearest = canUseNearbyMode && item.id === nearestStoreId;
    const isSaving = savingStoreId === item.id;

    return (
      <View
        style={[
          styles.storeCard,
          {
            backgroundColor: colors.card,
            borderColor: isSelected ? colors.primary : colors.border,
          },
          shadows[isDark ? 'dark' : 'light'],
          isNearest && { borderColor: colors.primary, backgroundColor: isDark ? '#173126' : '#edf9f0' },
        ]}
      >
        <View style={styles.storeTopRow}>
          <View style={styles.storeCopy}>
            <Text style={[styles.storeName, { color: colors.text }]} numberOfLines={1}>{item.name}</Text>
            <Text style={[styles.storeArea, { color: colors.primary }]} numberOfLines={1}>{item.area}</Text>
          </View>
          {isNearest ? (
            <View style={[styles.nearestBadge, { backgroundColor: colors.chip }]}>
              <Text style={[styles.nearestBadgeText, { color: colors.chipText }]}>Nearest</Text>
            </View>
          ) : null}
        </View>

        <Text style={[styles.storeAddress, { color: colors.textMuted }]}>{item.address}</Text>

        <View style={styles.metaRow}>
          <View style={[styles.metaPill, { backgroundColor: isDark ? '#132230' : '#f3f7f5' }]}>
            <MapPin size={14} color={colors.icon} />
            <Text style={[styles.metaText, { color: colors.textMuted }]}>{formatDistance(item.distanceMeters)}</Text>
          </View>

          <Pressable
            onPress={() => handleSelectStore(item)}
            disabled={isSaving}
            style={({ pressed }) => [
              styles.selectButton,
              { backgroundColor: isSelected ? colors.cardAlt : colors.primary },
              pressed && styles.pressed,
              isSaving && styles.disabled,
            ]}
          >
            {isSaving ? (
              <ActivityIndicator size="small" color={isSelected ? colors.primary : '#ffffff'} />
            ) : (
              <Text style={[styles.selectButtonText, { color: isSelected ? colors.primary : '#ffffff' }]}>
                {isSelected ? 'Selected' : 'Select'}
              </Text>
            )}
          </Pressable>
        </View>
      </View>
    );
  };

  return (
    <Screen padded={false}>
      <Animated.View
        style={[
          styles.container,
          {
            opacity: contentOpacity,
            transform: [{ translateY: contentTranslateY }],
          },
        ]}
      >
        <View style={styles.header}>
          {route.params?.returnTo === 'back' ? (
            <Pressable
              onPress={() => navigation.goBack()}
              style={({ pressed }) => [
                styles.backButton,
                { backgroundColor: colors.card, borderColor: colors.border },
                pressed && styles.pressed,
              ]}
            >
              <ArrowLeft size={18} color={colors.text} />
            </Pressable>
          ) : null}

          <View style={styles.headerCopy}>
            <Text style={[styles.title, { color: colors.text }]}>Select Your Store</Text>
            <Text style={[styles.subtitle, { color: colors.textMuted }]}>Search by store name or area, or use your current location for the closest match.</Text>
          </View>
        </View>

        <View style={[styles.searchWrap, { backgroundColor: colors.card, borderColor: colors.border }]}> 
          <Search size={18} color={colors.icon} />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Search by store name or area"
            placeholderTextColor={colors.inputPlaceholder}
            style={[styles.searchInput, { color: colors.text }]}
            autoCapitalize="none"
            autoCorrect={false}
          />
        </View>

        <Pressable
          onPress={handleUseCurrentLocation}
          disabled={locationLoading}
          style={({ pressed }) => [
            styles.locationAction,
            { backgroundColor: colors.card, borderColor: colors.border },
            pressed && styles.pressed,
            locationLoading && styles.disabled,
          ]}
        >
          <View style={[styles.locationActionIcon, { backgroundColor: colors.cardAlt }]}> 
            {locationLoading || locationStatus === 'detecting' ? (
              <ActivityIndicator size="small" color={colors.primary} />
            ) : (
              <Navigation size={18} color={colors.primary} />
            )}
          </View>
          <View style={styles.locationActionCopy}>
            <Text style={[styles.locationActionTitle, { color: colors.text }]}>Use Current Location</Text>
            <Text style={[styles.locationActionSubtitle, { color: colors.textMuted }]}>Nearby stores will be sorted first and the nearest one will be highlighted.</Text>
          </View>
        </Pressable>

        <View style={styles.modeRow}>
          <ModeChip label="Nearby" active={listMode === 'nearby'} onPress={() => setListMode('nearby')} colors={colors} />
          <ModeChip label="All Stores" active={listMode === 'manual'} onPress={() => setListMode('manual')} colors={colors} />
        </View>

        <FlatList
          data={stores}
          keyExtractor={(item) => item.id}
          renderItem={renderStore}
          contentContainerStyle={styles.listContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={[styles.emptyState, { backgroundColor: colors.card, borderColor: colors.border }]}> 
              <Text style={[styles.emptyTitle, { color: colors.text }]}>No stores match your search</Text>
              <Text style={[styles.emptyBody, { color: colors.textMuted }]}>Try a different store name or area, or switch back to the full store list.</Text>
            </View>
          }
        />
      </Animated.View>
    </Screen>
  );
}

function ModeChip({
  label,
  active,
  onPress,
  colors,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
  colors: {
    card: string;
    border: string;
    primary: string;
    text: string;
  };
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.modeChip,
        {
          backgroundColor: active ? colors.primary : colors.card,
          borderColor: active ? colors.primary : colors.border,
        },
        pressed && styles.pressed,
      ]}
    >
      <Text style={[styles.modeChipText, { color: active ? '#ffffff' : colors.text }]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 14,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    marginBottom: 18,
  },
  backButton: {
    width: 42,
    height: 42,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerCopy: {
    flex: 1,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
  },
  subtitle: {
    marginTop: 8,
    fontSize: 14,
    lineHeight: 21,
  },
  searchWrap: {
    minHeight: 54,
    borderRadius: 16,
    borderWidth: 1,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    paddingVertical: 0,
  },
  locationAction: {
    borderRadius: 18,
    borderWidth: 1,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  locationActionIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  locationActionCopy: {
    flex: 1,
  },
  locationActionTitle: {
    fontSize: 15,
    fontWeight: '700',
  },
  locationActionSubtitle: {
    marginTop: 4,
    fontSize: 13,
    lineHeight: 18,
  },
  modeRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 8,
  },
  modeChip: {
    flex: 1,
    minHeight: 42,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modeChipText: {
    fontSize: 13,
    fontWeight: '700',
  },
  listContent: {
    paddingTop: 8,
    paddingBottom: 110,
    gap: 12,
  },
  storeCard: {
    borderRadius: 18,
    borderWidth: 1,
    padding: 16,
  },
  storeTopRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
  },
  storeCopy: {
    flex: 1,
  },
  storeName: {
    fontSize: 17,
    fontWeight: '800',
  },
  storeArea: {
    marginTop: 4,
    fontSize: 13,
    fontWeight: '700',
  },
  nearestBadge: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  nearestBadgeText: {
    fontSize: 12,
    fontWeight: '800',
  },
  storeAddress: {
    marginTop: 10,
    fontSize: 14,
    lineHeight: 20,
  },
  metaRow: {
    marginTop: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  metaPill: {
    flex: 1,
    minHeight: 38,
    borderRadius: radius.md,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  metaText: {
    fontSize: 13,
    fontWeight: '600',
  },
  selectButton: {
    minWidth: 92,
    minHeight: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  selectButtonText: {
    fontSize: 13,
    fontWeight: '800',
  },
  emptyState: {
    marginTop: 24,
    borderRadius: 18,
    borderWidth: 1,
    padding: 18,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 8,
  },
  emptyBody: {
    fontSize: 14,
    lineHeight: 20,
  },
  pressed: {
    opacity: 0.88,
  },
  disabled: {
    opacity: 0.7,
  },
});