/**
 * TicketDetailsScreen - Display full ticket information
 */

import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { useEffect, useState } from 'react';
import { supportAPI } from '../services/api';
import { ArrowLeft, Clock, AlertCircle } from 'lucide-react-native';

type Props = NativeStackScreenProps<RootStackParamList, 'TicketDetails'>;

interface TicketDetail {
  _id: string;
  title: string;
  description: string;
  status: 'open' | 'closed' | 'in-progress';
  category: string;
  createdAt: string;
  response?: string;
  respondedAt?: string;
}

const CATEGORY_LABELS: Record<string, string> = {
  'billing-issue': 'Billing Issue',
  'payment-failure': 'Payment Failure',
  'refund-request': 'Refund Request',
  'technical-problem': 'Technical Problem',
  'account-issue': 'Account Issue',
  'other': 'Other',
};

export default function TicketDetailsScreen({ route, navigation }: Props) {
  const { ticketId } = route.params;
  const [ticket, setTicket] = useState<TicketDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [closing, setClosing] = useState(false);

  useEffect(() => {
    loadTicketDetails();
  }, [ticketId]);

  const loadTicketDetails = async () => {
    try {
      setLoading(true);
      setError('');
      const ticketData = await supportAPI.getTicket(ticketId);
      setTicket(ticketData);
    } catch (err: any) {
      setError(err.message || 'Failed to load ticket details');
    } finally {
      setLoading(false);
    }
  };

  const handleCloseTicket = async () => {
    if (!ticket) return;

    Alert.alert(
      'Close Ticket',
      'Are you sure you want to close this ticket?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Close',
          style: 'destructive',
          onPress: async () => {
            setClosing(true);
            try {
              const updatedTicket = await supportAPI.closeTicket(ticketId);
              setTicket(updatedTicket);
              Alert.alert('Success', 'Ticket closed successfully');
              navigation.goBack();
            } catch (err: any) {
              Alert.alert('Error', err.message || 'Failed to close ticket');
            } finally {
              setClosing(false);
            }
          },
        },
      ]
    );
  };

  const getStatusColor = (status: string | undefined) => {
    if (!status) return '#6b7280';
    switch (status) {
      case 'open':
        return '#ff9800';
      case 'in-progress':
        return '#2196f3';
      case 'closed':
        return '#4caf50';
      default:
        return '#6b7280';
    }
  };

  const getStatusLabel = (status: string | undefined) => {
    if (!status) return 'Unknown';
    return status.charAt(0).toUpperCase() + status.slice(1).replace('-', ' ');
  };

  const getCategoryLabel = (category: string | undefined) => {
    if (!category) return 'Other';
    return CATEGORY_LABELS[category] || 'Other';
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color="#4caf50" />
      </View>
    );
  }

  if (error || !ticket) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Pressable onPress={() => navigation.goBack()}>
            <ArrowLeft size={24} color="#1f2937" />
          </Pressable>
          <Text style={styles.headerTitle}>Ticket Details</Text>
          <View style={{ width: 24 }} />
        </View>

        <View style={styles.centered}>
          <AlertCircle size={48} color="#ef4444" />
          <Text style={styles.errorText}>{error || 'Ticket not found'}</Text>
          <Pressable style={styles.retryBtn} onPress={loadTicketDetails}>
            <Text style={styles.retryText}>Retry</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()}>
          <ArrowLeft size={24} color="#1f2937" />
        </Pressable>
        <Text style={styles.headerTitle}>Ticket Details</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Status Card */}
      <View
        style={[
          styles.statusCard,
          { borderLeftColor: getStatusColor(ticket.status) },
        ]}
      >
        <View style={styles.statusRow}>
          <Text style={styles.statusLabel}>Status</Text>
          <View
            style={[
              styles.statusBadge,
              { backgroundColor: getStatusColor(ticket.status) },
            ]}
          >
            <Text style={styles.statusText}>
              {getStatusLabel(ticket.status)}
            </Text>
          </View>
        </View>
      </View>

      {/* Ticket Information */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Ticket Information</Text>

        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Ticket ID</Text>
            <Text style={styles.infoValue}>{ticket._id.substring(0, 12)}...</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Category</Text>
            <Text style={styles.infoValue}>{getCategoryLabel(ticket.category)}</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.infoRow}>
            <Clock size={16} color="#6b7280" />
            <View style={{ marginLeft: 8, flex: 1 }}>
              <Text style={styles.infoLabel}>Created</Text>
              <Text style={styles.infoValue}>{formatDate(ticket.createdAt)}</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Title */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Title</Text>
        <View style={styles.titleCard}>
          <Text style={styles.titleText}>{ticket.title || 'N/A'}</Text>
        </View>
      </View>

      {/* Description */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Description</Text>
        <View style={styles.descriptionCard}>
          <Text style={styles.descriptionText}>{ticket.description || 'N/A'}</Text>
        </View>
      </View>

      {/* Response (if any) */}
      {ticket.response && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Support Response</Text>
          <View style={[styles.responseCard, styles.cardBg]}>
            <Text style={styles.responseText}>{ticket.response}</Text>
            {ticket.respondedAt && (
              <Text style={styles.respondedDate}>
                Responded on {formatDate(ticket.respondedAt)}
              </Text>
            )}
          </View>
        </View>
      )}

      {/* Action Button */}
      {ticket.status === 'open' && (
        <Pressable
          style={[styles.closeBtn, closing && { opacity: 0.7 }]}
          onPress={handleCloseTicket}
          disabled={closing}
        >
          {closing ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.closeBtnText}>Close Ticket</Text>
          )}
        </Pressable>
      )}

      <View style={styles.footer} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
  },
  statusCard: {
    backgroundColor: '#fff',
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 12,
    borderRadius: 12,
    borderLeftWidth: 4,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusLabel: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '500',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  section: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 12,
  },
  infoCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  infoLabel: {
    fontSize: 13,
    color: '#6b7280',
    fontWeight: '500',
  },
  infoValue: {
    fontSize: 14,
    color: '#1f2937',
    fontWeight: '600',
    marginLeft: 'auto',
  },
  divider: {
    height: 1,
    backgroundColor: '#e5e7eb',
  },
  titleCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
  },
  titleText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    lineHeight: 24,
  },
  descriptionCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
  },
  descriptionText: {
    fontSize: 14,
    color: '#4b5563',
    lineHeight: 22,
  },
  responseCard: {
    backgroundColor: '#f3f4f6',
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#10b981',
  },
  cardBg: {
    backgroundColor: '#f0fdf4',
  },
  responseText: {
    fontSize: 14,
    color: '#1f2937',
    lineHeight: 22,
  },
  respondedDate: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 12,
    fontStyle: 'italic',
  },
  closeBtn: {
    backgroundColor: '#ef4444',
    marginHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginVertical: 16,
  },
  closeBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  errorText: {
    fontSize: 16,
    color: '#ef4444',
    marginBottom: 16,
  },
  retryBtn: {
    backgroundColor: '#4caf50',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryText: {
    color: '#fff',
    fontWeight: '600',
  },
  footer: {
    height: 20,
  },
});
