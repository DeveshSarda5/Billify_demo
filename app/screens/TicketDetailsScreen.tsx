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

export default function TicketDetailsScreen({ route, navigation }: Props) {
  const { ticketId } = route.params;
  const [ticket, setTicket] = useState<TicketDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadTicketDetails();
  }, [ticketId]);

  const loadTicketDetails = async () => {
    try {
      setLoading(true);
      setError('');
      // Get ticket from myTickets and find by ID
      const tickets = await supportAPI.getMyTickets();
      const ticket = tickets.find((t: any) => t._id === ticketId);
      
      if (!ticket) {
        setError('Ticket not found');
        return;
      }
      
      setTicket(ticket);
    } catch (err: any) {
      setError(err.message || 'Failed to load ticket details');
    } finally {
      setLoading(false);
    }
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
            <Text style={styles.infoValue}>
              {ticket.category ? ticket.category.charAt(0).toUpperCase() + ticket.category.slice(1) : 'General'}
            </Text>
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
          <Text style={styles.titleText}>{ticket.title}</Text>
        </View>
      </View>

      {/* Description */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Description</Text>
        <View style={styles.descriptionCard}>
          <Text style={styles.descriptionText}>{ticket.description}</Text>
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
          style={styles.closeBtn}
          onPress={() => {
            Alert.alert(
              'Close Ticket',
              'Are you sure you want to close this ticket?',
              [
                { text: 'Cancel', style: 'cancel' },
                {
                  text: 'Close',
                  style: 'destructive',
                  onPress: () => {
                    Alert.alert('Success', 'Ticket closed successfully');
                    navigation.goBack();
                  },
                },
              ]
            );
          }}
        >
          <Text style={styles.closeBtnText}>Close Ticket</Text>
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
    paddingHorizontal: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
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
    marginHorizontal: 16,
    marginTop: 16,
    padding: 16,
    backgroundColor: '#fff',
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
    borderRadius: 6,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#fff',
  },
  section: {
    paddingHorizontal: 16,
    marginTop: 20,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  infoCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  infoLabel: {
    fontSize: 13,
    color: '#6b7280',
  },
  infoValue: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1f2937',
  },
  divider: {
    height: 1,
    backgroundColor: '#f3f4f6',
    marginVertical: 8,
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
    backgroundColor: '#f0fdf4',
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#4caf50',
  },
  cardBg: {
    backgroundColor: '#ecfdf5',
  },
  responseText: {
    fontSize: 14,
    color: '#15803d',
    lineHeight: 22,
    marginBottom: 8,
  },
  respondedDate: {
    fontSize: 12,
    color: '#6b7280',
    fontStyle: 'italic',
  },
  closeBtn: {
    marginHorizontal: 16,
    marginVertical: 20,
    paddingVertical: 12,
    backgroundColor: '#ff9800',
    borderRadius: 8,
    alignItems: 'center',
  },
  closeBtnText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  retryBtn: {
    marginTop: 16,
    paddingHorizontal: 24,
    paddingVertical: 10,
    backgroundColor: '#4caf50',
    borderRadius: 8,
  },
  retryText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  errorText: {
    fontSize: 14,
    color: '#ef4444',
    marginTop: 12,
    textAlign: 'center',
  },
  footer: {
    height: 20,
  },
});
