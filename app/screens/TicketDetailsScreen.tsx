import {
  ActivityIndicator,
  Alert,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useEffect, useState } from 'react';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AlertCircle, Clock } from 'lucide-react-native';
import AppCard from '../components/ui/AppCard';
import AppHeader from '../components/ui/AppHeader';
import Screen from '../components/ui/Screen';
import { useAppTheme } from '../context/ThemeContext';
import { RootStackParamList } from '../navigation/AppNavigator';
import { supportAPI } from '../services/api';
import { radius, shadows, spacing } from '../theme';

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
  other: 'Other',
};

function getStatusColor(status: string | undefined) {
  switch (status) {
    case 'open':
      return '#f59e0b';
    case 'in-progress':
      return '#3b82f6';
    case 'closed':
      return '#22c55e';
    default:
      return '#64748b';
  }
}

export default function TicketDetailsScreen({ route, navigation }: Props) {
  const { colors, isDark } = useAppTheme();
  const { ticketId } = route.params;
  const [ticket, setTicket] = useState<TicketDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [closing, setClosing] = useState(false);

  useEffect(() => {
    void loadTicketDetails();
  }, [ticketId]);

  const loadTicketDetails = async () => {
    try {
      setLoading(true);
      setError('');
      const ticketData = await supportAPI.getTicket(ticketId);
      setTicket(ticketData as TicketDetail);
    } catch (err: any) {
      setError(err.message || 'Failed to load ticket details');
    } finally {
      setLoading(false);
    }
  };

  const handleCloseTicket = async () => {
    if (!ticket) {
      return;
    }

    Alert.alert('Close Ticket', 'Are you sure you want to close this ticket?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Close',
        style: 'destructive',
        onPress: async () => {
          setClosing(true);
          try {
            const updatedTicket = await supportAPI.closeTicket(ticketId);
            setTicket(updatedTicket as TicketDetail);
            Alert.alert('Success', 'Ticket closed successfully');
            navigation.goBack();
          } catch (err: any) {
            Alert.alert('Error', err.message || 'Failed to close ticket');
          } finally {
            setClosing(false);
          }
        },
      },
    ]);
  };

  const getCategoryLabel = (category: string | undefined) => {
    if (!category) {
      return 'Other';
    }

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
      <Screen safeEdges={['top', 'bottom', 'left', 'right']}>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </Screen>
    );
  }

  if (error || !ticket) {
    return (
      <Screen safeEdges={['top', 'bottom', 'left', 'right']}>
        <AppHeader title="Ticket Details" subtitle="Review the issue and try again." onBack={() => navigation.goBack()} />
        <View style={styles.centered}>
          <View style={[styles.errorIconWrap, { backgroundColor: colors.cardAlt }]}> 
            <AlertCircle size={42} color={colors.danger} />
          </View>
          <Text style={[styles.errorTitle, { color: colors.text }]}>Unable to load ticket</Text>
          <Text style={[styles.errorText, { color: colors.textMuted }]}>{error || 'Ticket not found'}</Text>
          <Pressable style={[styles.retryBtn, { backgroundColor: colors.primary }]} onPress={() => void loadTicketDetails()}>
            <Text style={styles.retryText}>Retry</Text>
          </Pressable>
        </View>
      </Screen>
    );
  }

  const statusColor = getStatusColor(ticket.status);

  return (
    <Screen scrollable safeEdges={['top', 'bottom', 'left', 'right']} scrollProps={{ showsVerticalScrollIndicator: false }}>
      <AppHeader
        title="Ticket Details"
        subtitle="Track the request, review the latest response, and manage the ticket status."
        onBack={() => navigation.goBack()}
      />

      <View
        style={[
          styles.statusBanner,
          {
            backgroundColor: colors.cardAlt,
            borderColor: colors.border,
          },
          shadows[isDark ? 'dark' : 'light'],
        ]}
      >
        <View style={styles.statusBannerCopy}>
          <Text style={[styles.statusEyebrow, { color: colors.textSoft }]}>CURRENT STATUS</Text>
          <Text style={[styles.statusTitle, { color: colors.text }]}> 
            {ticket.status.charAt(0).toUpperCase() + ticket.status.slice(1).replace('-', ' ')}
          </Text>
        </View>
        <View style={[styles.statusPill, { backgroundColor: statusColor }]}> 
          <Text style={styles.statusPillText}>{ticket.status.toUpperCase()}</Text>
        </View>
      </View>

      <AppCard>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Ticket Information</Text>

        <View style={styles.infoRow}>
          <Text style={[styles.infoLabel, { color: colors.textSoft }]}>Ticket ID</Text>
          <Text style={[styles.infoValue, { color: colors.text }]}>{ticket._id.substring(0, 12)}...</Text>
        </View>
        <View style={[styles.divider, { backgroundColor: colors.divider }]} />

        <View style={styles.infoRow}>
          <Text style={[styles.infoLabel, { color: colors.textSoft }]}>Category</Text>
          <Text style={[styles.infoValue, { color: colors.text }]}>{getCategoryLabel(ticket.category)}</Text>
        </View>
        <View style={[styles.divider, { backgroundColor: colors.divider }]} />

        <View style={styles.infoRow}>
          <View style={styles.iconLabelRow}>
            <Clock size={16} color={colors.primary} />
            <Text style={[styles.infoLabel, { color: colors.textSoft }]}>Created</Text>
          </View>
          <Text style={[styles.infoValue, { color: colors.text }]}>{formatDate(ticket.createdAt)}</Text>
        </View>
      </AppCard>

      <AppCard>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Title</Text>
        <Text style={[styles.bodyTitle, { color: colors.text }]}>{ticket.title || 'N/A'}</Text>
      </AppCard>

      <AppCard>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Description</Text>
        <Text style={[styles.bodyText, { color: colors.textMuted }]}>{ticket.description || 'N/A'}</Text>
      </AppCard>

      {ticket.response ? (
        <AppCard style={[styles.responseCard, { backgroundColor: colors.cardAlt, borderColor: colors.border }]}> 
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Support Response</Text>
          <Text style={[styles.bodyText, { color: colors.text }]}>{ticket.response}</Text>
          {ticket.respondedAt ? (
            <Text style={[styles.respondedDate, { color: colors.textSoft }]}>Responded on {formatDate(ticket.respondedAt)}</Text>
          ) : null}
        </AppCard>
      ) : null}

      {ticket.status === 'open' ? (
        <Pressable
          style={[
            styles.closeBtn,
            {
              backgroundColor: colors.danger,
            },
            closing && styles.disabled,
          ]}
          onPress={handleCloseTicket}
          disabled={closing}
        >
          {closing ? <ActivityIndicator color="#ffffff" /> : <Text style={styles.closeBtnText}>Close Ticket</Text>}
        </Pressable>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.screenX,
  },
  errorIconWrap: {
    width: 76,
    height: 76,
    borderRadius: 38,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: '800',
  },
  errorText: {
    marginTop: 8,
    fontSize: 14,
    lineHeight: 21,
    textAlign: 'center',
  },
  retryBtn: {
    marginTop: 18,
    paddingHorizontal: 20,
    paddingVertical: 13,
    borderRadius: radius.md,
  },
  retryText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '700',
  },
  statusBanner: {
    borderWidth: 1,
    borderRadius: 22,
    padding: 18,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  statusBannerCopy: {
    flex: 1,
    marginRight: 12,
  },
  statusEyebrow: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.8,
  },
  statusTitle: {
    marginTop: 6,
    fontSize: 22,
    fontWeight: '800',
  },
  statusPill: {
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  statusPillText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.6,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  iconLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  infoLabel: {
    fontSize: 13,
    fontWeight: '700',
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '700',
    marginLeft: 12,
    flexShrink: 1,
    textAlign: 'right',
  },
  divider: {
    height: 1,
  },
  bodyTitle: {
    fontSize: 17,
    fontWeight: '800',
    lineHeight: 24,
  },
  bodyText: {
    fontSize: 14,
    lineHeight: 22,
  },
  responseCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#10b981',
  },
  respondedDate: {
    marginTop: 12,
    fontSize: 12,
    fontWeight: '600',
  },
  closeBtn: {
    minHeight: 52,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  closeBtnText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '800',
  },
  disabled: {
    opacity: 0.72,
  },
});