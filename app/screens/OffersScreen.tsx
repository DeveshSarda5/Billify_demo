import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Clipboard, FlatList, Pressable, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Tag } from 'lucide-react-native';
import AppButton from '../components/ui/AppButton';
import AppCard from '../components/ui/AppCard';
import AppHeader from '../components/ui/AppHeader';
import Screen from '../components/ui/Screen';
import { useAppTheme } from '../context/ThemeContext';
import { RootStackParamList } from '../navigation/AppNavigator';
import { offersAPI, OfferResponse } from '../services/api';

type Props = NativeStackScreenProps<RootStackParamList, 'Offers'>;

  function formatDiscount(offer: OfferResponse): string {
    if (offer.discountType === 'percentage') return `${offer.discountValue}% OFF`;
    if (offer.discountType === 'fixed') return `Save Rs.${offer.discountValue}`;
    return 'Buy One Get One';
  }

  function formatDate(dateStr: string): string {
    try {
      return new Date(dateStr).toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      });
    } catch {
      return dateStr;
    }
  }

  function isExpiringSoon(endDate: string): boolean {
    const diff = new Date(endDate).getTime() - Date.now();
    return diff > 0 && diff < 3 * 24 * 60 * 60 * 1000;
  }

  export default function OffersScreen({ navigation }: Props) {
    const { colors } = useAppTheme();
    const [offers, setOffers] = useState<OfferResponse[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const loadOffers = useCallback(async (isRefresh = false) => {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);
      setError(null);

      try {
        const data = await offersAPI.getActiveOffers();
        setOffers(data);
      } catch (err: any) {
        setError(err.message || 'Failed to load offers. Please try again.');
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    }, []);

    useEffect(() => {
      loadOffers();
    }, [loadOffers]);

    const handleCopyCode = (couponCode: string) => {
      Clipboard.setString(couponCode);
      Alert.alert('Copied!', `Coupon code "${couponCode}" copied to clipboard.`);
    };

    const renderOffer = ({ item }: { item: OfferResponse }) => {
      const expiringSoon = isExpiringSoon(item.endDate);

      return (
        <AppCard>
          <View style={styles.cardHeader}>
            <View style={[styles.discountBadge, { backgroundColor: colors.primary }]}>
              <Tag size={14} color="#fff" />
              <Text style={styles.discountText}>{formatDiscount(item)}</Text>
            </View>
            {expiringSoon ? (
              <View style={[styles.urgentBadge, { backgroundColor: colors.warningBg }]}>
                <Text style={[styles.urgentText, { color: colors.warningText }]}>Ends Soon</Text>
              </View>
            ) : null}
          </View>

          <Text style={[styles.offerName, { color: colors.text }]}>{item.name}</Text>

          {item.applicableProducts && item.applicableProducts !== 'all' ? (
            <Text style={[styles.applicableTo, { color: colors.textMuted }]}>Applicable on: {item.applicableProducts}</Text>
          ) : null}

          <View style={styles.dateRow}>
            <Text style={[styles.dateText, { color: colors.textSoft }]}>
              Valid: {formatDate(item.startDate)} - {formatDate(item.endDate)}
            </Text>
          </View>

          <View style={[styles.cardFooter, { borderTopColor: colors.divider }]}> 
            <View style={styles.codeContainer}>
              <Text style={[styles.codeLabel, { color: colors.textSoft }]}>Code</Text>
              <Text style={[styles.codeValue, { color: colors.text, backgroundColor: colors.cardAlt }]}>{item.couponCode}</Text>
            </View>
            <Pressable style={[styles.copyBtn, { backgroundColor: colors.chip }]} onPress={() => handleCopyCode(item.couponCode)}>
              <Text style={[styles.copyText, { color: colors.primary }]}>Copy Code</Text>
            </Pressable>
          </View>
        </AppCard>
      );
    };

    return (
      <Screen padded={false}>
        <View style={styles.headerWrap}>
          <AppHeader
            title="Offers & Deals"
            subtitle={loading ? 'Loading active offers...' : `${offers.length} active offer${offers.length !== 1 ? 's' : ''}`}
            onBack={() => navigation.goBack()}
          />
        </View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={[styles.loadingText, { color: colors.textMuted }]}>Loading offers...</Text>
          </View>
        ) : error ? (
          <View style={styles.errorContainer}>
            <Text style={[styles.errorText, { color: colors.danger }]}>{error}</Text>
            <AppButton onPress={() => loadOffers()}>Retry</AppButton>
          </View>
        ) : (
          <FlatList
            data={offers}
            keyExtractor={(item) => item._id}
            renderItem={renderOffer}
            ListEmptyComponent={
              <View style={styles.emptyState}>
                <Tag size={48} color={colors.textSoft} />
                <Text style={[styles.emptyTitle, { color: colors.text }]}>No Active Offers</Text>
                <Text style={[styles.emptyDesc, { color: colors.textMuted }]}>Check back later for new deals and discounts.</Text>
              </View>
            }
            contentContainerStyle={offers.length === 0 ? styles.emptyContainer : styles.listContent}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => loadOffers(true)} colors={[colors.primary]} tintColor={colors.primary} />}
          />
        )}

        <View style={styles.footerWrap}>
          <AppButton variant="secondary" onPress={() => navigation.goBack()}>
            Back to Dashboard
          </AppButton>
        </View>
      </Screen>
    );
  }

  const styles = StyleSheet.create({
    headerWrap: {
      paddingHorizontal: 16,
      paddingTop: 10,
    },
    listContent: {
      paddingHorizontal: 16,
      paddingBottom: 12,
    },
    cardHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 10,
      gap: 8,
    },
    discountBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      borderRadius: 8,
      paddingHorizontal: 10,
      paddingVertical: 4,
      gap: 4,
    },
    discountText: {
      color: '#fff',
      fontWeight: '700',
      fontSize: 13,
    },
    urgentBadge: {
      borderRadius: 8,
      paddingHorizontal: 8,
      paddingVertical: 4,
    },
    urgentText: {
      fontWeight: '600',
      fontSize: 11,
    },
    offerName: {
      fontSize: 16,
      fontWeight: '600',
      marginBottom: 4,
    },
    applicableTo: {
      fontSize: 12,
      marginBottom: 4,
    },
    dateRow: {
      marginBottom: 12,
    },
    dateText: {
      fontSize: 12,
    },
    cardFooter: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      borderTopWidth: 1,
      paddingTop: 12,
    },
    codeContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
    },
    codeLabel: {
      fontSize: 11,
      fontWeight: '500',
    },
    codeValue: {
      fontSize: 14,
      fontWeight: '700',
      letterSpacing: 1,
      paddingHorizontal: 8,
      paddingVertical: 2,
      borderRadius: 4,
    },
    copyBtn: {
      paddingVertical: 7,
      paddingHorizontal: 14,
      borderRadius: 8,
    },
    copyText: {
      fontWeight: '600',
      fontSize: 13,
    },
    loadingContainer: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      gap: 12,
    },
    loadingText: {
      fontSize: 14,
    },
    errorContainer: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 32,
      gap: 12,
    },
    errorText: {
      textAlign: 'center',
      fontSize: 14,
    },
    emptyContainer: {
      flexGrow: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: 32,
    },
    emptyState: {
      alignItems: 'center',
    },
    emptyTitle: {
      marginTop: 12,
      fontSize: 18,
      fontWeight: '700',
    },
    emptyDesc: {
      marginTop: 8,
      fontSize: 14,
      textAlign: 'center',
    },
    footerWrap: {
      paddingHorizontal: 16,
      paddingBottom: 16,
    },
  });