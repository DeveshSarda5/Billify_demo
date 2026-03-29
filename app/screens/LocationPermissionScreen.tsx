import { useEffect, useRef, useState } from 'react';
import { Alert, Animated, Easing, Pressable, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MapPin, Navigation, Search } from 'lucide-react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import Screen from '../components/ui/Screen';
import AppCard from '../components/ui/AppCard';
import { useLocation } from '../context/LocationContext';
import { useAppTheme } from '../context/ThemeContext';
import { RootStackParamList } from '../navigation/AppNavigator';
import { radius, shadows } from '../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'LocationPermission'>;

export default function LocationPermissionScreen({ navigation }: Props) {
  const { colors, isDark } = useAppTheme();
  const { requestLocationAccess } = useLocation();
  const [submitting, setSubmitting] = useState<'location' | 'manual' | null>(null);
  const contentOpacity = useRef(new Animated.Value(0)).current;
  const contentTranslateY = useRef(new Animated.Value(18)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(contentOpacity, {
        toValue: 1,
        duration: 320,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(contentTranslateY, {
        toValue: 0,
        duration: 320,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();
  }, [contentOpacity, contentTranslateY]);

  const handleAllowLocation = async () => {
    setSubmitting('location');

    try {
      const granted = await requestLocationAccess();

      if (granted) {
        navigation.replace('StoreSelection', { mode: 'nearby', returnTo: 'root' });
        return;
      }

      Alert.alert(
        'Location unavailable',
        'You can still select your store manually and continue shopping.',
        [
          {
            text: 'Choose Manually',
            onPress: () => navigation.replace('StoreSelection', { mode: 'manual', returnTo: 'root' }),
          },
          { text: 'Not now', style: 'cancel' },
        ],
      );
    } finally {
      setSubmitting(null);
    }
  };

  return (
    <Screen padded={false}>
      <LinearGradient colors={isDark ? ['#0b1220', '#132033', '#18283b'] : ['#edf7ef', '#f4fbf6', '#ffffff']} style={StyleSheet.absoluteFillObject} />
      <Animated.View
        style={[
          styles.container,
          {
            opacity: contentOpacity,
            transform: [{ translateY: contentTranslateY }],
          },
        ]}
      >
        <View style={styles.heroWrap}>
          <View style={[styles.heroOrb, styles.heroOrbLeft]} />
          <View style={[styles.heroOrb, styles.heroOrbRight, { backgroundColor: isDark ? 'rgba(52, 211, 153, 0.12)' : 'rgba(16, 185, 129, 0.12)' }]} />
          <View style={[styles.heroIcon, { backgroundColor: colors.card, borderColor: colors.border }]}> 
            <MapPin size={28} color={colors.primary} />
          </View>
          <Text style={[styles.eyebrow, { color: colors.primary }]}>STORE SETUP</Text>
          <Text style={[styles.title, { color: colors.text }]}>Choose the best Billify store for this session</Text>
          <Text style={[styles.subtitle, { color: colors.textMuted }]}>Enable location to see nearby stores first, or browse the full list manually.</Text>
        </View>

        <View style={styles.benefitsRow}>
          <FeaturePill label="Nearest stores first" icon={<Navigation size={16} color={colors.primary} />} colors={colors} />
          <FeaturePill label="Manual search" icon={<Search size={16} color={colors.primary} />} colors={colors} />
        </View>

        <AppCard style={[styles.infoCard, shadows[isDark ? 'dark' : 'light']]}>
          <Text style={[styles.cardTitle, { color: colors.text }]}>What this improves</Text>
          <Text style={[styles.cardBody, { color: colors.textMuted }]}>Your selected store is saved on this device, so returning users can skip this step and continue directly to checkout.</Text>
        </AppCard>

        <View style={styles.actions}>
          <Pressable
            onPress={handleAllowLocation}
            disabled={submitting !== null}
            style={({ pressed }) => [
              styles.primaryButton,
              { backgroundColor: colors.primary },
              pressed && styles.pressed,
              submitting !== null && styles.disabled,
            ]}
          >
            <Text style={styles.primaryButtonText}>{submitting === 'location' ? 'Checking location…' : 'Allow Location'}</Text>
          </Pressable>

          <Pressable
            onPress={() => navigation.replace('StoreSelection', { mode: 'manual', returnTo: 'root' })}
            disabled={submitting !== null}
            style={({ pressed }) => [
              styles.secondaryButton,
              { backgroundColor: colors.card, borderColor: colors.border },
              pressed && styles.pressed,
              submitting !== null && styles.disabled,
            ]}
          >
            <Text style={[styles.secondaryButtonText, { color: colors.text }]}>Choose Manually</Text>
          </Pressable>
        </View>
      </Animated.View>
    </Screen>
  );
}

function FeaturePill({
  label,
  icon,
  colors,
}: {
  label: string;
  icon: React.ReactNode;
  colors: { card: string; border: string; text: string };
}) {
  return (
    <View style={[styles.featurePill, { backgroundColor: colors.card, borderColor: colors.border }]}>
      {icon}
      <Text style={[styles.featureText, { color: colors.text }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 18,
    paddingBottom: 24,
  },
  heroWrap: {
    position: 'relative',
    paddingTop: 28,
    paddingBottom: 24,
  },
  heroOrb: {
    position: 'absolute',
    width: 148,
    height: 148,
    borderRadius: 999,
    backgroundColor: 'rgba(76, 175, 80, 0.12)',
  },
  heroOrbLeft: {
    top: 10,
    left: -50,
  },
  heroOrbRight: {
    right: -32,
    top: 58,
  },
  heroIcon: {
    width: 64,
    height: 64,
    borderRadius: 22,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 22,
  },
  eyebrow: {
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 2.2,
    marginBottom: 14,
  },
  title: {
    fontSize: 30,
    lineHeight: 36,
    fontWeight: '800',
  },
  subtitle: {
    marginTop: 12,
    fontSize: 15,
    lineHeight: 22,
  },
  benefitsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
  },
  featurePill: {
    flex: 1,
    minHeight: 52,
    borderRadius: radius.lg,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  featureText: {
    fontSize: 13,
    fontWeight: '700',
  },
  infoCard: {
    marginTop: 6,
    borderRadius: 20,
    padding: 18,
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: '700',
    marginBottom: 8,
  },
  cardBody: {
    fontSize: 14,
    lineHeight: 22,
  },
  actions: {
    marginTop: 'auto',
    gap: 12,
  },
  primaryButton: {
    minHeight: 54,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  primaryButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '800',
  },
  secondaryButton: {
    minHeight: 54,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: '700',
  },
  pressed: {
    opacity: 0.88,
  },
  disabled: {
    opacity: 0.7,
  },
});