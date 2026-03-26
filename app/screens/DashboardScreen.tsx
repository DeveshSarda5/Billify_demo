import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { CreditCard, Gift, HelpCircle, LogOut, Receipt, ScanBarcode, User } from 'lucide-react-native';
import AppCard from '../components/ui/AppCard';
import Screen from '../components/ui/Screen';
import ThemeToggleButton from '../components/ui/ThemeToggleButton';
import { useAuth } from '../context/AuthContext';
import { useAppTheme } from '../context/ThemeContext';
import { RootStackParamList } from '../navigation/AppNavigator';
import LocationHeader from '../components/LocationHeader';
import { radius } from '../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'Dashboard'>;

const actions = [
    { title: 'Previous Bills', subtitle: 'View order history', icon: Receipt, key: 'PreviousBills' as const },
    { title: 'My Profile', subtitle: 'Account settings', icon: User, key: 'Profile' as const },
    { title: 'Offers & Deals', subtitle: 'Save more money', icon: Gift, key: 'Offers' as const },
    { title: 'Payment Methods', subtitle: 'Manage cards & UPI', icon: CreditCard, key: 'PaymentMethods' as const },
];

export default function DashboardScreen({ navigation }: Props) {
    const { logout, user } = useAuth();
    const { colors, isDark } = useAppTheme();

    return (
        <Screen scrollable padded={false}>
            <View style={styles.headerWrap}>
                <View style={styles.headerRow}>
                    <View>
                        <Text style={[styles.title, { color: colors.text }]}>Billify</Text>
                        <Text style={[styles.subtitle, { color: colors.textMuted }]}>Welcome back, {user?.name || 'Guest'}.</Text>
                    </View>
                    <View style={styles.headerActions}>
                        <ThemeToggleButton />
                        <Pressable
                            style={({ pressed }) => [styles.logoutBtn, { backgroundColor: colors.card, borderColor: colors.border }, pressed && styles.pressed]}
                            onPress={logout}
                        >
                            <LogOut size={18} color={colors.primary} />
                            <Text style={[styles.logoutText, { color: colors.text }]}>Logout</Text>
                        </Pressable>
                    </View>
                </View>
            </View>

            <LocationHeader />

            <View style={styles.content}>
                <Pressable onPress={() => navigation.navigate('Scan')}>
                    <LinearGradient
                        colors={isDark ? ['#166534', '#16a34a'] : ['#16a34a', '#34d399']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.scanCard}
                    >
                        <View style={styles.scanLeft}>
                            <View style={styles.scanIconBox}>
                                <ScanBarcode size={30} color="#fff" />
                            </View>
                            <View style={styles.scanCopy}>
                                <Text style={styles.scanTitle}>Start Shopping</Text>
                                <Text style={styles.scanSubtitle}>Scan products as you shop and keep your cart updated in real time.</Text>
                            </View>
                        </View>
                        <Text style={styles.arrow}>›</Text>
                    </LinearGradient>
                </Pressable>

                <Text style={[styles.sectionTitle, { color: colors.text }]}>Quick Actions</Text>

                <View style={styles.grid}>
                    {actions.map(({ title, subtitle, icon: Icon, key }) => (
                        <Pressable key={key} style={styles.gridItem} onPress={() => navigation.navigate(key)}>
                            <AppCard style={[styles.actionCard, { backgroundColor: colors.card, borderColor: colors.border }]}> 
                                <View style={[styles.iconBox, getActionIconStyle(key)]}>
                                    <Icon size={22} color="#ffffff" />
                                </View>
                                <Text style={[styles.cardTitle, { color: colors.text }]}>{title}</Text>
                                <Text style={[styles.cardSubtitle, { color: colors.textMuted }]}>{subtitle}</Text>
                            </AppCard>
                        </Pressable>
                    ))}
                </View>

                <Pressable onPress={() => navigation.navigate('HelpSupport')}>
                    <AppCard style={[styles.helpCard, { backgroundColor: colors.card, borderColor: colors.border }]}> 
                        <View style={[styles.helpIconBox, { backgroundColor: isDark ? '#6b7280' : '#717b8d' }]}>
                            <HelpCircle size={22} color="#ffffff" />
                        </View>
                        <View style={styles.helpCopy}>
                            <Text style={[styles.cardTitle, { color: colors.text }]}>Help & Support</Text>
                            <Text style={[styles.cardSubtitle, { color: colors.textMuted }]}>FAQs, chat with us</Text>
                        </View>
                    </AppCard>
                </Pressable>

                <Text style={[styles.footer, { color: colors.textSoft }]}>Scan · Shop · Pay · Go</Text>
            </View>
        </Screen>
    );
}

function getActionIconStyle(key: (typeof actions)[number]['key']) {
    switch (key) {
        case 'PreviousBills':
            return { backgroundColor: '#3b82f6' };
        case 'Profile':
            return { backgroundColor: '#7c3aed' };
        case 'Offers':
            return { backgroundColor: '#f97316' };
        case 'PaymentMethods':
            return { backgroundColor: '#22c55e' };
        default:
            return { backgroundColor: '#4caf50' };
    }
}

const styles = StyleSheet.create({
    headerWrap: {
        paddingHorizontal: 16,
        paddingTop: 10,
        paddingBottom: 12,
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    headerActions: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    logoutBtn: {
        minHeight: 42,
        borderRadius: radius.md,
        borderWidth: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 14,
        gap: 8,
    },
    logoutText: {
        fontSize: 13,
        fontWeight: '700',
    },
    pressed: {
        opacity: 0.84,
    },
    title: {
        fontSize: 28,
        fontWeight: '800',
    },
    subtitle: {
        marginTop: 4,
        fontSize: 14,
    },
    content: {
        paddingHorizontal: 16,
        paddingTop: 12,
        paddingBottom: 36,
    },
    scanCard: {
        marginBottom: 18,
        padding: 20,
        borderRadius: 24,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    scanLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
        marginRight: 12,
    },
    scanIconBox: {
        width: 58,
        height: 58,
        borderRadius: 18,
        backgroundColor: 'rgba(255,255,255,0.2)',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 14,
    },
    scanCopy: {
        flex: 1,
    },
    scanTitle: {
        color: '#ffffff',
        fontSize: 20,
        fontWeight: '800',
    },
    scanSubtitle: {
        color: '#dcfce7',
        marginTop: 4,
        lineHeight: 18,
    },
    arrow: {
        color: '#ffffff',
        fontSize: 28,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '700',
        marginBottom: 12,
    },
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
    gridItem: {
        width: '48%',
    },
    actionCard: {
        minHeight: 134,
        borderRadius: 20,
        padding: 16,
        marginBottom: 16,
    },
    iconBox: {
        width: 48,
        height: 48,
        borderRadius: 14,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 12,
    },
    cardTitle: {
        fontSize: 15,
        fontWeight: '700',
    },
    cardSubtitle: {
        fontSize: 12,
        lineHeight: 18,
        marginTop: 6,
    },
    helpCard: {
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: 20,
        padding: 16,
        gap: 14,
        marginTop: 8,
    },
    helpIconBox: {
        width: 48,
        height: 48,
        borderRadius: 14,
        alignItems: 'center',
        justifyContent: 'center',
    },
    helpCopy: {
        flex: 1,
    },
    footer: {
        textAlign: 'center',
        marginTop: 8,
        fontSize: 12,
        paddingBottom: 10,
    },
});