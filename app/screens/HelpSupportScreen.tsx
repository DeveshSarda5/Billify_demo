import {
  ActivityIndicator,
  Alert,
  FlatList,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useEffect, useState } from 'react';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ChevronDown, MessageSquare } from 'lucide-react-native';
import AppButton from '../components/ui/AppButton';
import AppCard from '../components/ui/AppCard';
import AppHeader from '../components/ui/AppHeader';
import Screen from '../components/ui/Screen';
import { useAppTheme } from '../context/ThemeContext';
import { RootStackParamList } from '../navigation/AppNavigator';
import { supportAPI } from '../services/api';
import { radius, shadows, spacing } from '../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'HelpSupport'>;

type Ticket = {
  _id: string;
  title: string;
  description: string;
  status: string;
  category: string;
  createdAt: string;
};

const TICKET_CATEGORIES = [
  { label: 'Billing Issue', value: 'billing-issue' },
  { label: 'Payment Failure', value: 'payment-failure' },
  { label: 'Refund Request', value: 'refund-request' },
  { label: 'Technical Problem', value: 'technical-problem' },
  { label: 'Account Issue', value: 'account-issue' },
  { label: 'Other', value: 'other' },
];

const FAQS = [
  {
    question: 'How do I scan products?',
    answer:
      "Open the Scan tab, point your camera at the product barcode, and hold it steady. Billify detects the item automatically and adds it to your cart.",
  },
  {
    question: 'What should I do if a product will not scan?',
    answer:
      'Make sure the barcode is well lit and flat. If it still does not scan, search for the product manually or ask a store assistant for help.',
  },
  {
    question: 'How do I pay for my items?',
    answer:
      'After scanning, open your cart and tap Checkout. You can complete the purchase with UPI, saved cards, or other available payment methods.',
  },
  {
    question: 'What is an Exit Pass?',
    answer:
      'After a successful payment, Billify generates an Exit Pass with verification details. Show it at the store exit for quick clearance.',
  },
  {
    question: 'Can I remove items from my cart?',
    answer:
      'Yes. Open your cart to adjust quantities or remove products before completing payment.',
  },
  {
    question: 'Is my payment secure?',
    answer:
      'Yes. Billify uses secure payment gateways and standard encryption practices to protect transaction data.',
  },
];

function FAQItem({
  question,
  answer,
  accent,
  backgroundColor,
  borderColor,
  textColor,
  mutedTextColor,
}: {
  question: string;
  answer: string;
  accent: string;
  backgroundColor: string;
  borderColor: string;
  textColor: string;
  mutedTextColor: string;
}) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Pressable
      onPress={() => setIsOpen((value) => !value)}
      style={[
        styles.faqCard,
        {
          backgroundColor,
          borderColor,
        },
      ]}
    >
      <View style={styles.faqHeader}>
        <Text style={[styles.faqQuestion, { color: textColor }]}>{question}</Text>
        <View style={[styles.chevronWrap, { backgroundColor: `${accent}18` }]}>
          <ChevronDown
            size={18}
            color={accent}
            style={{ transform: [{ rotate: isOpen ? '180deg' : '0deg' }] }}
          />
        </View>
      </View>
      {isOpen ? (
        <View style={[styles.faqAnswerContainer, { borderTopColor: borderColor }]}>
          <Text style={[styles.faqAnswer, { color: mutedTextColor }]}>{answer}</Text>
        </View>
      ) : null}
    </Pressable>
  );
}

function getTicketStatusTone(status: string) {
  switch (status) {
    case 'closed':
      return { backgroundColor: '#dcfce7', color: '#15803d' };
    case 'in-progress':
      return { backgroundColor: '#dbeafe', color: '#1d4ed8' };
    default:
      return { backgroundColor: '#fef3c7', color: '#b45309' };
  }
}

export default function HelpSupportScreen({ navigation }: Props) {
  const { colors, isDark } = useAppTheme();
  const [activeTab, setActiveTab] = useState<'faq' | 'ticket'>('faq');
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('other');
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);

  useEffect(() => {
    void loadTickets();
  }, []);

  const loadTickets = async () => {
    setLoading(true);
    try {
      const data = await supportAPI.getMyTickets();
      setTickets(data as Ticket[]);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!title.trim() || !description.trim()) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setSubmitting(true);
    try {
      await supportAPI.createTicket({
        title: title.trim(),
        description: description.trim(),
        category,
      });
      Alert.alert('Success', 'Ticket submitted successfully');
      setTitle('');
      setDescription('');
      setCategory('other');
      await loadTickets();
    } catch (error: any) {
      Alert.alert('Error', error.message);
    } finally {
      setSubmitting(false);
    }
  };

  const getCategoryLabel = (value: string) => {
    const selectedCategory = TICKET_CATEGORIES.find((item) => item.value === value);
    return selectedCategory?.label || 'Other';
  };

  const renderTicket = ({ item }: { item: Ticket }) => {
    const statusTone = getTicketStatusTone(item.status);

    return (
      <Pressable
        style={[
          styles.ticketCard,
          {
            backgroundColor: colors.card,
            borderColor: colors.border,
          },
          shadows[isDark ? 'dark' : 'light'],
        ]}
        onPress={() => navigation.navigate('TicketDetails', { ticketId: item._id })}
      >
        <View style={styles.ticketHeader}>
          <View style={styles.ticketHeaderCopy}>
            <Text style={[styles.ticketTitle, { color: colors.text }]} numberOfLines={1}>
              {item.title}
            </Text>
            <View style={styles.ticketMetaRow}>
              <View style={[styles.categoryChip, { backgroundColor: colors.cardAlt }]}>
                <Text style={[styles.categoryChipText, { color: colors.primary }]}>
                  {getCategoryLabel(item.category)}
                </Text>
              </View>
              <Text style={[styles.ticketDate, { color: colors.textSoft }]}>
                {new Date(item.createdAt).toLocaleDateString('en-IN', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                })}
              </Text>
            </View>
          </View>

          <View style={[styles.statusBadge, { backgroundColor: statusTone.backgroundColor }]}>
            <Text style={[styles.statusText, { color: statusTone.color }]}>{item.status.toUpperCase()}</Text>
          </View>
        </View>

        <Text style={[styles.ticketDescription, { color: colors.textMuted }]} numberOfLines={2}>
          {item.description}
        </Text>
      </Pressable>
    );
  };

  const renderComposer = () => (
    <View style={styles.listHeader}>
      <AppCard style={styles.composerCard}>
        <Text style={[styles.sectionEyebrow, { color: colors.primary }]}>SUPPORT DESK</Text>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Create Support Ticket</Text>
        <Text style={[styles.sectionDescription, { color: colors.textMuted }]}>
          Describe the issue clearly so the support team can resolve it faster.
        </Text>

        <TextInput
          style={[
            styles.input,
            {
              backgroundColor: colors.inputBackground,
              borderColor: colors.border,
              color: colors.text,
            },
          ]}
          placeholder="Short title"
          placeholderTextColor={colors.inputPlaceholder}
          value={title}
          onChangeText={setTitle}
        />

        <TextInput
          style={[
            styles.input,
            styles.textArea,
            {
              backgroundColor: colors.inputBackground,
              borderColor: colors.border,
              color: colors.text,
            },
          ]}
          placeholder="Describe your issue"
          placeholderTextColor={colors.inputPlaceholder}
          value={description}
          onChangeText={setDescription}
          multiline
          textAlignVertical="top"
        />

        <Pressable
          style={[
            styles.categoryInput,
            {
              backgroundColor: colors.inputBackground,
              borderColor: colors.border,
            },
          ]}
          onPress={() => setShowCategoryModal(true)}
        >
          <View>
            <Text style={[styles.categoryFieldLabel, { color: colors.textSoft }]}>Category</Text>
            <Text style={[styles.categoryFieldValue, { color: colors.text }]}>{getCategoryLabel(category)}</Text>
          </View>
          <ChevronDown size={20} color={colors.textSoft} />
        </Pressable>

        <AppButton onPress={handleSubmit} disabled={submitting} loading={submitting}>
          Submit Ticket
        </AppButton>
      </AppCard>

      <View style={styles.ticketsHeaderRow}>
        <Text style={[styles.ticketsHeading, { color: colors.text }]}>My Tickets</Text>
        <Text style={[styles.ticketsCount, { color: colors.textSoft }]}>{tickets.length} total</Text>
      </View>
    </View>
  );

  const renderEmptyState = () => (
    <AppCard style={styles.emptyStateCard}>
      <View style={[styles.emptyIcon, { backgroundColor: colors.cardAlt }]}>
        <MessageSquare size={26} color={colors.primary} />
      </View>
      <Text style={[styles.emptyTitle, { color: colors.text }]}>No tickets yet</Text>
      <Text style={[styles.emptyText, { color: colors.textMuted }]}>
        Your submitted support requests will appear here.
      </Text>
    </AppCard>
  );

  return (
    <Screen padded={false} safeEdges={['top', 'bottom', 'left', 'right']}>
      <View style={styles.headerShell}>
        <AppHeader
          title="Help & Support"
          subtitle="Browse FAQs, raise an issue, and track your tickets in one place."
          onBack={() => navigation.goBack()}
        />
      </View>

      <View style={[styles.tabBar, { borderBottomColor: colors.border }]}> 
        <View style={[styles.tabTrack, { backgroundColor: colors.card }]}> 
          {(['faq', 'ticket'] as const).map((tab) => {
            const active = activeTab === tab;

            return (
              <Pressable
                key={tab}
                onPress={() => setActiveTab(tab)}
                style={[
                  styles.tab,
                  active && {
                    backgroundColor: colors.primary,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.tabText,
                    {
                      color: active ? '#ffffff' : colors.textMuted,
                    },
                  ]}
                >
                  {tab === 'faq' ? 'FAQs' : 'My Tickets'}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      {activeTab === 'faq' ? (
        <ScrollView
          style={styles.flex}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          <View style={styles.sectionBlock}>
            <Text style={[styles.sectionEyebrow, { color: colors.primary }]}>HELP CENTER</Text>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Frequently Asked Questions</Text>
            <Text style={[styles.sectionDescription, { color: colors.textMuted }]}>
              Quick answers for checkout, scanning, and payment flow issues.
            </Text>
          </View>

          {FAQS.map((item) => (
            <FAQItem
              key={item.question}
              question={item.question}
              answer={item.answer}
              accent={colors.primary}
              backgroundColor={colors.card}
              borderColor={colors.border}
              textColor={colors.text}
              mutedTextColor={colors.textMuted}
            />
          ))}
        </ScrollView>
      ) : loading ? (
        <View style={styles.loaderWrap}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <FlatList
          style={styles.flex}
          data={tickets}
          renderItem={renderTicket}
          keyExtractor={(item) => item._id}
          ListHeaderComponent={renderComposer}
          ListEmptyComponent={renderEmptyState}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.ticketListContent}
        />
      )}

      <Modal visible={showCategoryModal} transparent animationType="fade">
        <Pressable style={[styles.modalOverlay, { backgroundColor: colors.overlay }]} onPress={() => setShowCategoryModal(false)}>
          <Pressable
            style={[
              styles.categoryModal,
              {
                backgroundColor: colors.card,
                borderColor: colors.border,
              },
            ]}
            onPress={() => undefined}
          >
            <Text style={[styles.modalTitle, { color: colors.text }]}>Select Category</Text>
            {TICKET_CATEGORIES.map((item) => {
              const active = category === item.value;

              return (
                <Pressable
                  key={item.value}
                  style={[
                    styles.categoryOption,
                    {
                      backgroundColor: active ? colors.chip : colors.cardAlt,
                      borderColor: active ? colors.primary : colors.border,
                    },
                  ]}
                  onPress={() => {
                    setCategory(item.value);
                    setShowCategoryModal(false);
                  }}
                >
                  <Text style={[styles.categoryOptionText, { color: active ? colors.chipText : colors.text }]}> 
                    {item.label}
                  </Text>
                </Pressable>
              );
            })}

            <AppButton variant="secondary" onPress={() => setShowCategoryModal(false)}>
              Cancel
            </AppButton>
          </Pressable>
        </Pressable>
      </Modal>
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  headerShell: {
    paddingHorizontal: spacing.screenX,
    paddingTop: spacing.screenY,
  },
  tabBar: {
    paddingHorizontal: spacing.screenX,
    paddingBottom: spacing.screenY,
    borderBottomWidth: 1,
  },
  tabTrack: {
    flexDirection: 'row',
    padding: 4,
    borderRadius: radius.lg,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: radius.md,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '700',
  },
  scrollContent: {
    paddingHorizontal: spacing.screenX,
    paddingTop: spacing.screenY,
    paddingBottom: 100,
  },
  sectionBlock: {
    marginBottom: 14,
  },
  sectionEyebrow: {
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1.1,
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '800',
  },
  sectionDescription: {
    marginTop: 6,
    fontSize: 14,
    lineHeight: 21,
  },
  faqCard: {
    borderWidth: 1,
    borderRadius: radius.lg,
    padding: 16,
    marginBottom: 12,
  },
  faqHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  faqQuestion: {
    flex: 1,
    fontSize: 15,
    fontWeight: '700',
    lineHeight: 22,
    marginRight: 12,
  },
  chevronWrap: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
  faqAnswerContainer: {
    marginTop: 14,
    paddingTop: 14,
    borderTopWidth: 1,
  },
  faqAnswer: {
    fontSize: 14,
    lineHeight: 21,
  },
  loaderWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ticketListContent: {
    paddingHorizontal: spacing.screenX,
    paddingTop: spacing.screenY,
    paddingBottom: 100,
  },
  listHeader: {
    marginBottom: 6,
  },
  composerCard: {
    borderRadius: 20,
    marginBottom: 16,
  },
  input: {
    borderWidth: 1,
    borderRadius: radius.md,
    paddingHorizontal: 14,
    paddingVertical: 13,
    fontSize: 15,
    marginTop: 12,
  },
  textArea: {
    minHeight: 116,
  },
  categoryInput: {
    marginTop: 12,
    marginBottom: 14,
    borderWidth: 1,
    borderRadius: radius.md,
    paddingHorizontal: 14,
    paddingVertical: 13,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  categoryFieldLabel: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  categoryFieldValue: {
    marginTop: 4,
    fontSize: 15,
    fontWeight: '700',
  },
  ticketsHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  ticketsHeading: {
    fontSize: 18,
    fontWeight: '800',
  },
  ticketsCount: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.7,
  },
  ticketCard: {
    borderWidth: 1,
    borderRadius: 18,
    padding: 16,
    marginBottom: 12,
  },
  ticketHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  ticketHeaderCopy: {
    flex: 1,
    marginRight: 12,
  },
  ticketTitle: {
    fontSize: 16,
    fontWeight: '800',
    lineHeight: 22,
  },
  ticketMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  categoryChip: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  categoryChipText: {
    fontSize: 12,
    fontWeight: '700',
  },
  ticketDate: {
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 12,
  },
  statusBadge: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 7,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  ticketDescription: {
    marginTop: 12,
    fontSize: 14,
    lineHeight: 21,
  },
  emptyStateCard: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  emptyIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: '800',
  },
  emptyText: {
    marginTop: 6,
    fontSize: 14,
    lineHeight: 21,
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  categoryModal: {
    width: '100%',
    borderWidth: 1,
    borderRadius: 24,
    padding: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 14,
  },
  categoryOption: {
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 14,
    marginBottom: 10,
  },
  categoryOptionText: {
    fontSize: 15,
    fontWeight: '700',
  },
});