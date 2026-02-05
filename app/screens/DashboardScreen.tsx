import { View, Text, Pressable, StyleSheet, Alert, ScrollView } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import {
    ScanBarcode,
    Receipt,
    User,
    Gift,
    CreditCard,
    HelpCircle,
    LogOut,
} from 'lucide-react-native';
import { useAuth } from '../context/AuthContext';

type Props = NativeStackScreenProps<RootStackParamList, 'Dashboard'>;

export default function DashboardScreen({ navigation }: Props) {
    const { logout, user } = useAuth();

    const comingSoon = (feature: string) => {
        Alert.alert('Coming Soon', `${feature} will be available soon`);
    };

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <View>
                    <Text style={styles.title}>Billify</Text>
                    <Text style={styles.subtitle}>Welcome back, {user?.name || 'Guest'}!</Text>
                </View>

                <Pressable style={styles.logoutBtn} onPress={logout}>
                    <LogOut size={20} color="#555" />
                </Pressable>
            </View>

            {/* Scan Card */}
            <Pressable style={styles.scanCard} onPress={() => navigation.navigate('Scan')}>
                <View style={styles.scanLeft}>
                    <View style={styles.scanIconBox}>
                        <ScanBarcode size={32} color="#fff" />
                    </View>
                    <View>
                        <Text style={styles.scanTitle}>Start Shopping</Text>
                        <Text style={styles.scanSubtitle}>Scan products as you shop</Text>
                    </View>
                </View>
                <Text style={styles.arrow}>›</Text>
            </Pressable>

            {/* Quick Actions */}
            <ScrollView contentContainerStyle={styles.actions}>
                <Text style={styles.sectionTitle}>Quick Actions</Text>

                <View style={styles.grid}>
                    <ActionCard
                        title="Previous Bills"
                        subtitle="View order history"
                        icon={<Receipt size={22} color="#fff" />}
                        color="#3b82f6"
                        onPress={() => navigation.navigate('PreviousBills')}
                    />

                    <ActionCard
                        title="My Profile"
                        subtitle="Account settings"
                        icon={<User size={22} color="#fff" />}
                        color="#8b5cf6"
                        onPress={() => navigation.navigate('Profile')}
                    />

                    <ActionCard
                        title="Offers & Deals"
                        subtitle="Save more money"
                        icon={<Gift size={22} color="#fff" />}
                        color="#f97316"
                        onPress={() => navigation.navigate('Offers')}
                    />

                    <ActionCard
                        title="Payment Methods"
                        subtitle="Manage cards & UPI"
                        icon={<CreditCard size={22} color="#fff" />}
                        color="#22c55e"
                        onPress={() => navigation.navigate('PaymentMethods')}
                    />
                </View>

                {/* Help */}
                <Pressable style={styles.helpCard} onPress={() => navigation.navigate('HelpSupport')}>
                    <View style={[styles.iconBox, { backgroundColor: '#6b7280' }]}>
                        <HelpCircle size={22} color="#fff" />
                    </View>
                    <View>
                        <Text style={styles.cardTitle}>Help & Support</Text>
                        <Text style={styles.cardSubtitle}>FAQs, chat with us</Text>
                    </View>
                </Pressable>
            </ScrollView>

            <Text style={styles.footer}>Scan · Shop · Pay · Go</Text>
        </View>
    );
}

/* ---------- Small reusable card ---------- */
function ActionCard({
    title,
    subtitle,
    icon,
    color,
    onPress,
}: {
    title: string;
    subtitle: string;
    icon: React.ReactNode;
    color: string;
    onPress: () => void;
}) {
    return (
        <Pressable style={styles.card} onPress={onPress}>
            <View style={[styles.iconBox, { backgroundColor: color }]}>{icon}</View>
            <Text style={styles.cardTitle}>{title}</Text>
            <Text style={styles.cardSubtitle}>{subtitle}</Text>
        </Pressable>
    );
}

/* ---------- Styles ---------- */
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#e8f5e9',
        paddingTop: 20,
    },
    header: {
        paddingHorizontal: 20,
        paddingBottom: 10,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    title: { fontSize: 28, fontWeight: 'bold', color: '#1f2937' },
    subtitle: { color: '#6b7280', marginTop: 4 },
    logoutBtn: {
        backgroundColor: '#fff',
        padding: 12,
        borderRadius: 999,
    },

    scanCard: {
        margin: 20,
        padding: 20,
        borderRadius: 24,
        backgroundColor: '#4caf50',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    scanLeft: { flexDirection: 'row', alignItems: 'center', gap: 16 },
    scanIconBox: {
        width: 60,
        height: 60,
        borderRadius: 16,
        backgroundColor: 'rgba(255,255,255,0.25)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    scanTitle: { color: '#fff', fontSize: 20, fontWeight: 'bold' },
    scanSubtitle: { color: '#ecfdf5', marginTop: 4 },
    arrow: { color: '#fff', fontSize: 28 },

    actions: { paddingHorizontal: 20, paddingBottom: 20 },
    sectionTitle: { fontSize: 16, fontWeight: '600', color: '#374151', marginBottom: 12 },

    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
    card: {
        backgroundColor: '#fff',
        width: '48%',
        borderRadius: 20,
        padding: 16,
        marginBottom: 16,
    },
    iconBox: {
        width: 48,
        height: 48,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 10,
    },
    cardTitle: { fontWeight: '600', color: '#1f2937' },
    cardSubtitle: { fontSize: 12, color: '#6b7280', marginTop: 4 },

    helpCard: {
        backgroundColor: '#fff',
        borderRadius: 20,
        padding: 16,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 14,
        marginTop: 8,
    },

    footer: {
        textAlign: 'center',
        fontSize: 12,
        color: '#9ca3af',
        paddingBottom: 10,
    },
});