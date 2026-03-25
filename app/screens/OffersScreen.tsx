import {
  View,
  Text,
  StyleSheet,
  Pressable,
  FlatList,
  Alert,
  ActivityIndicator,
  Clipboard,
  RefreshControl,
} from 'react-native';
import { useEffect, useState, useCallback } from 'react';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Tag } from 'lucide-react-native';
import { offersAPI, OfferResponse } from '../services/api';
import { RootStackParamList } from '../navigation/AppNavigator';

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
  return diff > 0 && diff < 3 * 24 * 60 * 60 * 1000; // within 3 days
}

export default function OffersScreen({ navigation }: Props) {
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
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={styles.discountBadge}>
            <Tag size={14} color="#fff" />
            <Text style={styles.discountText}>{formatDiscount(item)}</Text>
          </View>
          {expiringSoon && (
            <View style={styles.urgentBadge}>
              <Text style={styles.urgentText}>Ends Soon</Text>
            </View>
          )}
        </View>

        <Text style={styles.offerName}>{item.name}</Text>

        {item.applicableProducts && item.applicableProducts !== 'all' && (
          <Text style={styles.applicableTo}>
            Applicable on: {item.applicableProducts}
          </Text>
        )}

        <View style={styles.dateRow}>
          <Text style={styles.dateText}>
            Valid: {formatDate(item.startDate)} - {formatDate(item.endDate)}
          </Text>
        </View>

        <View style={styles.cardFooter}>
          <View style={styles.codeContainer}>
            <Text style={styles.codeLabel}>Code</Text>
            <Text style={styles.codeValue}>{item.couponCode}</Text>
          </View>
          <Pressable
            style={styles.copyBtn}
            onPress={() => handleCopyCode(item.couponCode)}
          >
            <Text style={styles.copyText}>Copy Code</Text>
          </Pressable>
        </View>
      </View>
    );
  };

  const renderEmpty = () => (
    <View style={styles.emptyState}>
      <Tag size={48} color="#d1d5db" />
      <Text style={styles.emptyTitle}>No Active Offers</Text>
      <Text style={styles.emptyDesc}>
        Check back later for new deals and discounts.
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Offers & Deals</Text>
        <Text style={styles.subtitle}>
          {loading ? '' : `${offers.length} active offer${offers.length !== 1 ? 's' : ''}`}
        </Text>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4caf50" />
          <Text style={styles.loadingText}>Loading offers...</Text>
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <Pressable style={styles.retryBtn} onPress={() => loadOffers()}>
            <Text style={styles.retryText}>Retry</Text>
          </Pressable>
        </View>
      ) : (
        <FlatList
          data={offers}
          keyExtractor={(item) => item._id}
          renderItem={renderOffer}
          ListEmptyComponent={renderEmpty}
          contentContainerStyle={offers.length === 0 ? styles.emptyContainer : styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => loadOffers(true)}
              colors={['#4caf50']}
              tintColor="#4caf50"
            />
          }
        />
      )}

      <Pressable style={styles.backBtn} onPress={() => navigation.goBack()}>
        <Text style={styles.backText}>Back to Dashboard</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  subtitle: {
    fontSize: 13,
    color: '#6b7280',
    marginTop: 2,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 12,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
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
    backgroundColor: '#4caf50',
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
    backgroundColor: '#fef3c7',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  urgentText: {
    color: '#d97706',
    fontWeight: '600',
    fontSize: 11,
  },
  offerName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },
  applicableTo: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 4,
  },
  dateRow: {
    marginBottom: 12,
  },
  dateText: {
    fontSize: 12,
    color: '#9ca3af',
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
    paddingTop: 12,
  },
  codeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  codeLabel: {
    fontSize: 11,
    color: '#9ca3af',
    fontWeight: '500',
  },
  codeValue: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1f2937',
    letterSpacing: 1,
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  copyBtn: {
    backgroundColor: '#eff6ff',
    paddingVertical: 7,
    paddingHorizontal: 14,
    borderRadius: 8,
  },
  copyText: {
    color: '#2563eb',
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
    color: '#6b7280',
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
    color: '#dc2626',
    textAlign: 'center',
    fontSize: 14,
  },
  retryBtn: {
    backgroundColor: '#4caf50',
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  retryText: {
    color: '#fff',
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingVertical: 60,
  },
  emptyState: {
    alignItems: 'center',
    gap: 12,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
  },
  emptyDesc: {
    fontSize: 14,
    color: '#9ca3af',
    textAlign: 'center',
  },
  backBtn: {
    alignItems: 'center',
    padding: 14,
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
    backgroundColor: '#fff',
  },
  backText: {
    color: '#2563eb',
    fontWeight: '600',
  },
});