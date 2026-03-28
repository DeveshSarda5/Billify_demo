import {
  ActivityIndicator,
  Alert,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useEffect, useMemo, useRef, useState } from 'react';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';
import * as Location from 'expo-location';
import {
  CalendarDays,
  MapPin,
  Receipt,
  ShieldCheck,
  User,
  Wallet,
} from 'lucide-react-native';
import AppButton from '../components/ui/AppButton';
import Screen from '../components/ui/Screen';
import { useAuth } from '../context/AuthContext';
import { useAppTheme } from '../context/ThemeContext';
import { RootStackParamList } from '../navigation/AppNavigator';
import { paymentAPI } from '../services/api';
import { radius, shadows, spacing } from '../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'ExitPass'>;

const BARCODE_PATTERN = [
  0.52, 0.86, 0.42, 0.74, 0.58, 0.92, 0.5, 0.8, 0.48, 0.68, 0.94, 0.46, 0.84, 0.62,
  0.9, 0.44, 0.78, 0.56, 0.88, 0.4, 0.72, 0.54, 0.96, 0.6,
];

function DetailRow({
  icon,
  label,
  value,
  accent,
  textColor,
  mutedColor,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  accent: string;
  textColor: string;
  mutedColor: string;
}) {
  return (
    <View style={styles.detailRow}>
      <View style={[styles.detailIconWrap, { backgroundColor: `${accent}18` }]}>{icon}</View>
      <View style={styles.detailCopy}>
        <Text style={[styles.detailLabel, { color: mutedColor }]}>{label}</Text>
        <Text style={[styles.detailValue, { color: textColor }]}>{value}</Text>
      </View>
    </View>
  );
}

export default function ExitPassScreen({ navigation, route }: Props) {
  const { colors, isDark } = useAppTheme();
  const { user } = useAuth();
  const billId = route.params?.billId;
  const amountPaid = route.params?.amountPaid ?? 0;
  const fallbackIssuedAt = useRef(new Date().toISOString()).current;
  const issuedAt = route.params?.issuedAt ?? fallbackIssuedAt;

  const [verifying, setVerifying] = useState(false);
  const [verified, setVerified] = useState(false);
  const [verificationError, setVerificationError] = useState('');
  const [verificationData, setVerificationData] = useState<any>(null);

  const passId = useMemo(() => {
    if (billId) {
      return billId.slice(-8).toUpperCase();
    }

    return `${Math.floor(100000 + Math.random() * 900000)}`;
  }, [billId]);

  useEffect(() => {
    if (billId) {
      void verifyBillLocation();
    }
  }, [billId]);

  const verifyBillLocation = async () => {
    setVerifying(true);
    setVerificationError('');

    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setVerificationError('Location permission denied');
        return;
      }

      const position = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      const { latitude, longitude } = position.coords;

      if (!billId) {
        setVerificationError('No bill ID provided');
        return;
      }

      const response = await paymentAPI.verifyBill({
        billId,
        userLatitude: latitude,
        userLongitude: longitude,
      });

      if (response.success) {
        setVerified(true);
        setVerificationData(response);
        Alert.alert('Verified', `You're verified at ${response.nearestStoreName}`);
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Verification failed';
      setVerificationError(errorMessage);
      Alert.alert('Verification Failed', errorMessage);
    } finally {
      setVerifying(false);
    }
  };

  const formatDateTime = (value: string) =>
    new Date(value).toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

  const formattedAmount = `₹${amountPaid.toFixed(2)}`;
  const verificationTitle = verified ? 'Gate verified' : verifying ? 'Verifying location' : 'Awaiting gate verification';
  const verificationBody = verified
    ? `${verificationData?.nearestStoreName || 'Store gate'} • ${verificationData?.distanceInMeters || 0}m away`
    : verificationError || 'Show this pass at the exit gate to complete store verification.';

  return (
    <Screen scrollable safeEdges={['top', 'bottom', 'left', 'right']} scrollProps={{ showsVerticalScrollIndicator: false }}>
      <View style={styles.heroHeader}>
        <Text style={[styles.heroEyebrow, { color: colors.primary }]}>RETAIL CLEARANCE PASS</Text>
        <Text style={[styles.heroTitle, { color: colors.text }]}>Premium exit verification ready for gate staff.</Text>
        <Text style={[styles.heroText, { color: colors.textMuted }]}> 
          This pass confirms payment, purchase reference, and the live verification state for the active bill.
        </Text>
      </View>

      <LinearGradient
        colors={
          isDark
            ? ['#10261f', '#0f3b4c', '#111827']
            : ['#f8fffb', '#dcfce7', '#eff6ff']
        }
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.passCard, shadows[isDark ? 'dark' : 'light']]}
      >
        <View style={styles.passTopRow}>
          <View>
            <Text style={[styles.passLabel, { color: colors.textSoft }]}>Title</Text>
            <Text style={[styles.passTitle, { color: colors.text }]}>EXIT PASS</Text>
          </View>
          <View style={[styles.paidBadge, { backgroundColor: colors.success }]}> 
            <Text style={styles.paidBadgeText}>PAID OK</Text>
          </View>
        </View>

        <View style={styles.passSummaryRow}>
          <View>
            <Text style={[styles.passNumberLabel, { color: colors.textSoft }]}>Pass No.</Text>
            <Text style={[styles.passNumber, { color: colors.text }]}>{passId}</Text>
          </View>
          <View style={[styles.statusChip, { backgroundColor: colors.card }]}> 
            <ShieldCheck size={16} color={colors.primary} />
            <Text style={[styles.statusChipText, { color: colors.text }]}>Ready for exit scan</Text>
          </View>
        </View>

        <View style={styles.detailGrid}>
          <DetailRow
            icon={<User size={18} color={colors.primary} />}
            label="Customer"
            value={user?.name || 'Guest User'}
            accent={colors.primary}
            textColor={colors.text}
            mutedColor={colors.textSoft}
          />
          <DetailRow
            icon={<Receipt size={18} color={colors.primary} />}
            label="Bill ID"
            value={billId || 'Pending'}
            accent={colors.primary}
            textColor={colors.text}
            mutedColor={colors.textSoft}
          />
          <DetailRow
            icon={<Wallet size={18} color={colors.primary} />}
            label="Amount Paid"
            value={formattedAmount}
            accent={colors.primary}
            textColor={colors.text}
            mutedColor={colors.textSoft}
          />
          <DetailRow
            icon={<CalendarDays size={18} color={colors.primary} />}
            label="Issued At"
            value={formatDateTime(issuedAt)}
            accent={colors.primary}
            textColor={colors.text}
            mutedColor={colors.textSoft}
          />
        </View>

        <View style={styles.perforationRow}>
          <View style={[styles.perforationCut, { backgroundColor: colors.background }]} />
          <View style={[styles.perforationLine, { borderColor: colors.divider }]} />
          <View style={[styles.perforationCut, { backgroundColor: colors.background }]} />
        </View>

        <View style={[styles.barcodeCard, { backgroundColor: colors.card }]}> 
          <Text style={[styles.barcodeLabel, { color: colors.textSoft }]}>Scan at the exit gate</Text>
          <View style={styles.barcodeBars}>
            {BARCODE_PATTERN.map((height, index) => (
              <View
                key={`${height}-${index}`}
                style={[
                  styles.barcodeBar,
                  {
                    height: 30 + height * 34,
                    backgroundColor: colors.text,
                    opacity: index % 3 === 0 ? 0.98 : 0.82,
                  },
                ]}
              />
            ))}
          </View>
          <Text style={[styles.barcodeCaption, { color: colors.textMuted }]}>BILLIFY-{passId}</Text>
        </View>

        <View style={[styles.verificationPanel, { backgroundColor: `${colors.card}D9`, borderColor: colors.border }]}> 
          <View style={styles.verificationHeader}>
            <View style={[styles.mapIconWrap, { backgroundColor: `${colors.primary}18` }]}>
              <MapPin size={18} color={colors.primary} />
            </View>
            <View style={styles.verificationCopy}>
              <Text style={[styles.verificationTitle, { color: colors.text }]}>{verificationTitle}</Text>
              <Text style={[styles.verificationText, { color: colors.textMuted }]}>{verificationBody}</Text>
            </View>
          </View>

          {verifying ? <ActivityIndicator style={styles.verificationSpinner} color={colors.primary} /> : null}

          {verificationError ? (
            <Pressable style={[styles.retryBtn, { borderColor: colors.border, backgroundColor: colors.card }]} onPress={() => void verifyBillLocation()}>
              <Text style={[styles.retryBtnText, { color: colors.text }]}>Retry verification</Text>
            </Pressable>
          ) : null}
        </View>
      </LinearGradient>

      <AppButton onPress={() => navigation.popToTop()}>Back to Dashboard</AppButton>
    </Screen>
  );
}

const styles = StyleSheet.create({
  heroHeader: {
    marginBottom: 18,
  },
  heroEyebrow: {
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1.1,
  },
  heroTitle: {
    marginTop: 8,
    fontSize: 24,
    fontWeight: '800',
    lineHeight: 31,
  },
  heroText: {
    marginTop: 8,
    fontSize: 14,
    lineHeight: 21,
  },
  passCard: {
    borderRadius: 28,
    padding: 20,
    marginBottom: 18,
  },
  passTopRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  passLabel: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  passTitle: {
    marginTop: 6,
    fontSize: 30,
    fontWeight: '900',
    letterSpacing: 1.4,
  },
  paidBadge: {
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 9,
  },
  paidBadgeText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.9,
  },
  passSummaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  passNumberLabel: {
    fontSize: 12,
    fontWeight: '700',
  },
  passNumber: {
    marginTop: 6,
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: 1,
  },
  statusChip: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  statusChipText: {
    marginLeft: 8,
    fontSize: 12,
    fontWeight: '700',
  },
  detailGrid: {
    marginTop: 22,
    gap: 12,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: radius.lg,
    paddingHorizontal: 14,
    paddingVertical: 13,
    backgroundColor: 'rgba(255,255,255,0.18)',
  },
  detailIconWrap: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  detailCopy: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.7,
  },
  detailValue: {
    marginTop: 4,
    fontSize: 15,
    fontWeight: '800',
  },
  perforationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },
  perforationCut: {
    width: 18,
    height: 18,
    borderRadius: 9,
  },
  perforationLine: {
    flex: 1,
    borderTopWidth: 1,
    borderStyle: 'dashed',
    marginHorizontal: 10,
  },
  barcodeCard: {
    borderRadius: 22,
    padding: 16,
  },
  barcodeLabel: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  barcodeBars: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    marginTop: 18,
    height: 70,
  },
  barcodeBar: {
    width: 5,
    borderRadius: 999,
  },
  barcodeCaption: {
    marginTop: 14,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.8,
    textAlign: 'center',
  },
  verificationPanel: {
    marginTop: 18,
    borderWidth: 1,
    borderRadius: 22,
    padding: 16,
  },
  verificationHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  mapIconWrap: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  verificationCopy: {
    flex: 1,
  },
  verificationTitle: {
    fontSize: 16,
    fontWeight: '800',
  },
  verificationText: {
    marginTop: 6,
    fontSize: 14,
    lineHeight: 21,
  },
  verificationSpinner: {
    marginTop: 14,
  },
  retryBtn: {
    alignSelf: 'flex-start',
    marginTop: 14,
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  retryBtnText: {
    fontSize: 13,
    fontWeight: '700',
  },
});