import { useState } from 'react';
import { ActivityIndicator, Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Check, ChevronRight, Edit2, Mail, Phone, User } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import AppButton from '../components/ui/AppButton';
import AppCard from '../components/ui/AppCard';
import AppHeader from '../components/ui/AppHeader';
import Screen from '../components/ui/Screen';
import ThemeToggleButton from '../components/ui/ThemeToggleButton';
import { useAuth } from '../context/AuthContext';
import { useAppTheme } from '../context/ThemeContext';
import { RootStackParamList } from '../navigation/AppNavigator';

type Props = NativeStackScreenProps<RootStackParamList, 'Profile'>;

export default function ProfileScreen({ navigation }: Props) {
    const { logout, user, sendEmailVerification } = useAuth();
    const { colors, isDark } = useAppTheme();
    const [loading, setLoading] = useState(false);
    const [verificationSending, setVerificationSending] = useState(false);

    const userData = {
        name: user?.name || 'Guest User',
        email: user?.email || 'No email provided',
        phone: user?.phone || 'No phone provided',
        emailVerified: user?.emailVerified || false,
    };

    const handleLogout = () => {
        Alert.alert('Logout', 'Are you sure you want to logout?', [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Logout',
                style: 'destructive',
                onPress: async () => {
                    setLoading(true);
                    await logout();
                    setLoading(false);
                },
            },
        ]);
    };

    const handleSendVerificationEmail = async () => {
        try {
            setVerificationSending(true);
            await sendEmailVerification();
            Alert.alert('Verification Email Sent', 'Check your email inbox for the verification link.');
        } catch (error: any) {
            Alert.alert('Error', error.message || 'Failed to send verification email');
        } finally {
            setVerificationSending(false);
        }
    };

    if (loading) {
        return (
            <Screen>
                <View style={styles.centered}>
                    <ActivityIndicator size="large" color={colors.primary} />
                    <Text style={[styles.loadingText, { color: colors.textMuted }]}>Logging out...</Text>
                </View>
            </Screen>
        );
    }

    return (
        <Screen scrollable>
            <AppHeader
                title="My Profile"
                subtitle="Manage your account details, security, and support access."
                onBack={() => navigation.goBack()}
                rightSlot={
                    <Pressable
                        onPress={() => navigation.navigate('EditProfile')}
                        style={({ pressed }) => [
                            styles.editButton,
                            { backgroundColor: colors.card, borderColor: colors.border },
                            pressed && styles.pressed,
                        ]}
                    >
                        <Edit2 size={18} color={colors.primary} />
                    </Pressable>
                }
            />

            <LinearGradient
                colors={isDark ? ['#052e16', '#166534'] : ['#dcfce7', '#f0fdf4']}
                style={[styles.hero, { borderColor: colors.border }]}
            >
                <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
                    <User size={36} color="#fff" />
                </View>
                <Text style={[styles.name, { color: colors.text }]}>{userData.name}</Text>
                <Text style={[styles.email, { color: colors.textMuted }]}>{userData.email}</Text>
            </LinearGradient>

            {!userData.emailVerified ? (
                <AppCard style={{ backgroundColor: colors.warningBg }}>
                    <View style={styles.bannerRow}>
                        <View style={styles.bannerCopy}>
                            <Text style={[styles.bannerTitle, { color: colors.warningText }]}>Verify Your Email</Text>
                            <Text style={[styles.bannerText, { color: colors.warningText }]}>Add another layer of security to your account.</Text>
                        </View>
                        <AppButton onPress={handleSendVerificationEmail} loading={verificationSending}>
                            Send
                        </AppButton>
                    </View>
                </AppCard>
            ) : null}

            <AppCard>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>Account Information</Text>
                <InfoRow icon={<User size={18} color={colors.primary} />} label="Full Name" value={userData.name} colors={colors} />
                <Divider color={colors.divider} />
                <InfoRow
                    icon={<Mail size={18} color={colors.primary} />}
                    label="Email"
                    value={userData.email}
                    colors={colors}
                    badge={userData.emailVerified ? (
                        <View style={[styles.verifiedBadge, { backgroundColor: colors.success }]}>
                            <Check size={12} color="#fff" />
                            <Text style={styles.verifiedText}>Verified</Text>
                        </View>
                    ) : null}
                />
                <Divider color={colors.divider} />
                <InfoRow icon={<Phone size={18} color={colors.primary} />} label="Phone" value={userData.phone} colors={colors} />
            </AppCard>

            <AppCard>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>Settings</Text>
                <SettingItem label="Edit Profile" onPress={() => navigation.navigate('EditProfile')} colors={colors} />
                <SettingItem label="Change Password" onPress={() => navigation.navigate('ChangePassword')} colors={colors} />
                <SettingItem label="Notifications" onPress={() => navigation.navigate('NotificationSettings')} colors={colors} />
                <SettingToggleItem label="Your mode" colors={colors} />
                <SettingItem label="Privacy Policy" onPress={() => navigation.navigate('PrivacyPolicy')} colors={colors} />
                <SettingItem label="Help & Support" onPress={() => navigation.navigate('HelpSupport')} colors={colors} />
            </AppCard>

            <AppButton variant="secondary" onPress={handleLogout}>
                Logout
            </AppButton>
        </Screen>
    );
}

function InfoRow({
    icon,
    label,
    value,
    colors,
    badge,
}: {
    icon: React.ReactNode;
    label: string;
    value: string;
    colors: {
        primary: string;
        chip: string;
        text: string;
        textSoft: string;
    };
    badge?: React.ReactNode;
}) {
    return (
        <View style={styles.infoRow}>
            <View style={[styles.iconBox, { backgroundColor: colors.chip }]}>{icon}</View>
            <View style={styles.infoContent}>
                <View style={styles.infoHeader}>
                    <Text style={[styles.infoLabel, { color: colors.textSoft }]}>{label}</Text>
                    {badge}
                </View>
                <Text style={[styles.infoValue, { color: colors.text }]}>{value}</Text>
            </View>
        </View>
    );
}

function SettingItem({
    label,
    onPress,
    colors,
}: {
    label: string;
    onPress: () => void;
    colors: {
        text: string;
        textSoft: string;
        divider: string;
    };
}) {
    return (
        <Pressable style={({ pressed }) => [styles.settingItem, { borderBottomColor: colors.divider }, pressed && styles.pressed]} onPress={onPress}>
            <Text style={[styles.settingText, { color: colors.text }]}>{label}</Text>
            <ChevronRight size={18} color={colors.textSoft} />
        </Pressable>
    );
}

function SettingToggleItem({
    label,
    colors,
}: {
    label: string;
    colors: {
        text: string;
        divider: string;
    };
}) {
    return (
        <View style={[styles.settingItem, styles.settingToggleItem, { borderBottomColor: colors.divider }]}>
            <Text style={[styles.settingText, { color: colors.text }]}>{label}</Text>
            <ThemeToggleButton />
        </View>
    );
}

function Divider({ color }: { color: string }) {
    return <View style={[styles.divider, { backgroundColor: color }]} />;
}

const styles = StyleSheet.create({
    centered: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        marginTop: 12,
        fontSize: 16,
    },
    editButton: {
        width: 44,
        height: 44,
        borderRadius: 14,
        borderWidth: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    pressed: {
        opacity: 0.84,
    },
    hero: {
        borderWidth: 1,
        borderRadius: 24,
        padding: 24,
        alignItems: 'center',
        marginBottom: 16,
    },
    avatar: {
        width: 84,
        height: 84,
        borderRadius: 42,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 12,
    },
    name: {
        fontSize: 24,
        fontWeight: '800',
    },
    email: {
        marginTop: 6,
        fontSize: 14,
    },
    bannerRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    bannerCopy: {
        flex: 1,
        marginRight: 12,
    },
    bannerTitle: {
        fontSize: 15,
        fontWeight: '700',
        marginBottom: 4,
    },
    bannerText: {
        fontSize: 13,
        lineHeight: 18,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '700',
        marginBottom: 12,
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 10,
    },
    iconBox: {
        width: 40,
        height: 40,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    infoContent: {
        flex: 1,
    },
    infoHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 4,
    },
    infoLabel: {
        fontSize: 12,
        fontWeight: '600',
    },
    infoValue: {
        fontSize: 15,
        fontWeight: '600',
    },
    divider: {
        height: 1,
    },
    verifiedBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 999,
    },
    verifiedText: {
        color: '#fff',
        fontSize: 10,
        fontWeight: '700',
    },
    settingItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 14,
        borderBottomWidth: 1,
    },
    settingText: {
        fontSize: 15,
        fontWeight: '600',
    },
    settingToggleItem: {
        gap: 12,
    },
});
