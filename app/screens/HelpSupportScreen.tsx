import { View, Text, StyleSheet, TextInput, Pressable, Alert, ActivityIndicator, FlatList, ScrollView } from 'react-native';
import { useState, useEffect } from 'react';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { supportAPI } from '../services/api';
import { MessageSquare } from 'lucide-react-native';

type Props = NativeStackScreenProps<RootStackParamList, 'HelpSupport'>;

type Ticket = {
    _id: string;
    subject: string;
    message: string;
    status: string;
    createdAt: string;
};

export default function HelpSupportScreen({ navigation }: Props) {
    const [activeTab, setActiveTab] = useState<'faq' | 'ticket'>('faq');
    const [tickets, setTickets] = useState<Ticket[]>([]);
    const [subject, setSubject] = useState('');
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        loadTickets();
    }, []);

    const loadTickets = async () => {
        setLoading(true);
        try {
            const data = await supportAPI.getMyTickets();
            setTickets(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async () => {
        if (!subject || !message) {
            Alert.alert('Error', 'Please fill in all fields');
            return;
        }

        setSubmitting(true);
        try {
            await supportAPI.createTicket({ subject, message });
            Alert.alert('Success', 'Ticket submitted successfully');
            setSubject('');
            setMessage('');
            loadTickets(); // Refresh list
        } catch (error: any) {
            Alert.alert('Error', error.message);
        } finally {
            setSubmitting(false);
        }
    };

    const renderTicket = ({ item }: { item: Ticket }) => (
        <View style={styles.card}>
            <View style={styles.cardHeader}>
                <Text style={styles.cardTitle}>{item.subject}</Text>
                <View style={[styles.statusBadge,
                { backgroundColor: item.status === 'open' ? '#e0f2fe' : '#dcfce7' }
                ]}>
                    <Text style={[styles.statusText,
                    { color: item.status === 'open' ? '#0ea5e9' : '#22c55e' }
                    ]}>{item.status.toUpperCase()}</Text>
                </View>
            </View>
            <Text style={styles.cardBody} numberOfLines={2}>{item.message}</Text>
            <Text style={styles.cardDate}>{new Date(item.createdAt).toLocaleDateString()}</Text>
        </View>
    );

    return (
        <View style={styles.container}>
            {/* TABS */}
            <View style={styles.tabContainer}>
                <Pressable
                    style={[styles.tab, activeTab === 'faq' && styles.activeTab]}
                    onPress={() => setActiveTab('faq')}
                >
                    <Text style={[styles.tabText, activeTab === 'faq' && styles.activeTabText]}>FAQs</Text>
                </Pressable>
                <Pressable
                    style={[styles.tab, activeTab === 'ticket' && styles.activeTab]}
                    onPress={() => setActiveTab('ticket')}
                >
                    <Text style={[styles.tabText, activeTab === 'ticket' && styles.activeTabText]}>My Tickets</Text>
                </Pressable>
            </View>

            {activeTab === 'faq' ? (
                <ScrollView style={styles.content}>
                    <Text style={styles.sectionTitle}>Frequently Asked Questions</Text>

                    <View style={styles.faqItem}>
                        <Text style={styles.question}>How do I reset my password?</Text>
                        <Text style={styles.answer}>Go to Profile {'>'} Change Password. Enter your current password and choose a new one.</Text>
                    </View>

                    <View style={styles.faqItem}>
                        <Text style={styles.question}>How do I get a refund?</Text>
                        <Text style={styles.answer}>Refunds are processed within 5-7 business days. Please create a support ticket with your Order ID.</Text>
                    </View>

                    <View style={styles.faqItem}>
                        <Text style={styles.question}>Where can I view my past bills?</Text>
                        <Text style={styles.answer}>You can view all your previous transactions in the "Previous Bills" section on the Dashboard.</Text>
                    </View>

                    <View style={styles.faqContact}>
                        <Text style={styles.faqContactText}>Still have questions? Switch to the "My Tickets" tab to contact us.</Text>
                    </View>
                </ScrollView>
            ) : (
                <>
                    <View style={styles.formSection}>
                        <Text style={styles.sectionTitle}>Contact Support</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Subject"
                            value={subject}
                            onChangeText={setSubject}
                        />
                        <TextInput
                            style={[styles.input, styles.textArea]}
                            placeholder="Describe your issue..."
                            value={message}
                            onChangeText={setMessage}
                            multiline
                            numberOfLines={4}
                            textAlignVertical="top"
                        />
                        <Pressable
                            style={[styles.submitBtn, submitting && styles.disabled]}
                            onPress={handleSubmit}
                            disabled={submitting}
                        >
                            {submitting ? (
                                <ActivityIndicator color="#fff" />
                            ) : (
                                <Text style={styles.submitText}>Submit Ticket</Text>
                            )}
                        </Pressable>
                    </View>

                    <Text style={styles.historyTitle}>Your Tickets</Text>
                    {loading ? (
                        <ActivityIndicator style={{ marginTop: 20 }} color="#4caf50" />
                    ) : (
                        <FlatList
                            data={tickets}
                            renderItem={renderTicket}
                            keyExtractor={item => item._id}
                            contentContainerStyle={styles.listContent}
                            ListEmptyComponent={
                                <View style={styles.emptyState}>
                                    <MessageSquare size={40} color="#9ca3af" />
                                    <Text style={styles.emptyText}>No tickets yet</Text>
                                </View>
                            }
                        />
                    )}
                </>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f9fafb',
    },
    formSection: {
        padding: 20,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#f3f4f6',
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 16,
        color: '#1f2937',
    },
    input: {
        borderWidth: 1,
        borderColor: '#e5e7eb',
        borderRadius: 12,
        padding: 12,
        marginBottom: 12,
        fontSize: 16,
        backgroundColor: '#f9fafb',
    },
    textArea: {
        minHeight: 100,
    },
    submitBtn: {
        backgroundColor: '#4caf50',
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
    },
    disabled: {
        opacity: 0.7,
    },
    submitText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    historyTitle: {
        fontSize: 18,
        fontWeight: '600',
        margin: 20,
        marginBottom: 10,
        color: '#1f2937',
    },
    listContent: {
        paddingHorizontal: 20,
        paddingBottom: 20,
    },
    card: {
        backgroundColor: '#fff',
        padding: 16,
        borderRadius: 12,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 2,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    cardTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1f2937',
        flex: 1,
        marginRight: 8,
    },
    statusBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
    },
    statusText: {
        fontSize: 10,
        fontWeight: '700',
    },
    cardBody: {
        fontSize: 14,
        color: '#4b5563',
        marginBottom: 8,
    },
    cardDate: {
        fontSize: 12,
        color: '#9ca3af',
    },
    emptyState: {
        alignItems: 'center',
        justifyContent: 'center',
        padding: 40,
    },
    emptyText: {
        marginTop: 12,
        color: '#9ca3af',
        fontSize: 16,
    },

    /* Tabs */
    tabContainer: {
        flexDirection: 'row',
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#e5e7eb',
    },
    tab: {
        flex: 1,
        paddingVertical: 16,
        alignItems: 'center',
        borderBottomWidth: 2,
        borderBottomColor: 'transparent',
    },
    activeTab: {
        borderBottomColor: '#4caf50',
    },
    tabText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#6b7280',
    },
    activeTabText: {
        color: '#4caf50',
    },

    /* FAQ */
    content: {
        flex: 1,
        padding: 20,
    },
    faqItem: {
        backgroundColor: '#fff',
        padding: 16,
        borderRadius: 12,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOpacity: 0.03,
        shadowRadius: 4,
        elevation: 1,
    },
    question: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#1f2937',
        marginBottom: 6,
    },
    answer: {
        fontSize: 14,
        color: '#4b5563',
        lineHeight: 20,
    },
    faqContact: {
        marginTop: 20,
        marginBottom: 40,
        padding: 16,
        backgroundColor: '#e0f2fe',
        borderRadius: 12,
    },
    faqContactText: {
        color: '#0284c7',
        fontSize: 14,
        textAlign: 'center',
        fontWeight: '500',
    },
});
