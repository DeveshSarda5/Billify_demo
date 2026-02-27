import { View, Text, StyleSheet, Pressable, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { User, Mail, Phone, LogOut, ChevronRight, ArrowLeft, Edit2 } from 'lucide-react-native';
import { useAuth } from '../context/AuthContext';
import { useState } from 'react';

type Props = NativeStackScreenProps<RootStackParamList, 'Profile'>;

export default function ProfileScreen({ navigation }: Props) {
    const { logout, user } = useAuth();
    const [loading, setLoading] = useState(false);

    // Provide default values if user is null or missing properties
    const userData = {
        name: user?.name || 'Guest User',
        email: user?.email || 'No email provided',
        phone: user?.phone || 'No phone provided',
    };

    const handleLogout = () => {
        Alert.alert(
            'Logout',
            'Are you sure you want to logout?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Logout',
                    style: 'destructive',
                    onPress: async () => {
                        setLoading(true);
                        await logout();
                        setLoading(false);
                    }
                },
            ]
        );
    };

    if (loading) {
        return (
            <View style={[styles.container, styles.centered]}>
                <ActivityIndicator size="large" color="#4caf50" />
                <Text style={styles.loadingText}>Logging out...</Text>
            </View>
        );
    }

    return (
        <ScrollView style={styles.container}>
            {/* Unified Header */}
            <View style={styles.header}>
                {/* Navigation Row */}
                <View style={styles.headerNav}>
                    <Pressable onPress={() => navigation.goBack()} style={styles.backBtn}>
                        <ArrowLeft size={24} color="#fff" />
                    </Pressable>
                    <Text style={styles.headerTitle}>My Profile</Text>
                    <Pressable onPress={() => navigation.navigate('EditProfile')} style={styles.backBtn}>
                        <Edit2 size={20} color="#fff" />
                    </Pressable>
                </View>

                {/* Avatar & User Info */}
                <View style={styles.avatarContainer}>
                    <View style={styles.avatar}>
                        <User size={40} color="#fff" />
                    </View>
                    <Text style={styles.name}>{userData.name}</Text>
                    <Text style={styles.email}>{userData.email}</Text>
                </View>
            </View>

            {/* Account Info */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Account Information</Text>

                <View style={styles.card}>
                    <View style={styles.infoRow}>
                        <View style={styles.iconBox}>
                            <User size={20} color="#4caf50" />
                        </View>
                        <View style={styles.infoContent}>
                            <Text style={styles.infoLabel}>Full Name</Text>
                            <Text style={styles.infoValue}>{userData.name}</Text>
                        </View>
                    </View>

                    <View style={styles.divider} />

                    <View style={styles.infoRow}>
                        <View style={styles.iconBox}>
                            <Mail size={20} color="#4caf50" />
                        </View>
                        <View style={styles.infoContent}>
                            <Text style={styles.infoLabel}>Email</Text>
                            <Text style={styles.infoValue}>{userData.email}</Text>
                        </View>
                    </View>

                    <View style={styles.divider} />

                    <View style={styles.infoRow}>
                        <View style={styles.iconBox}>
                            <Phone size={20} color="#4caf50" />
                        </View>
                        <View style={styles.infoContent}>
                            <Text style={styles.infoLabel}>Phone</Text>
                            <Text style={styles.infoValue}>{userData.phone}</Text>
                        </View>
                    </View>
                </View>
            </View>

            {/* Settings */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Settings</Text>

                <Pressable style={styles.settingItem} onPress={() => navigation.navigate('EditProfile')}>
                    <Text style={styles.settingText}>Edit Profile</Text>
                    <ChevronRight size={20} color="#9ca3af" />
                </Pressable>

                <Pressable style={styles.settingItem} onPress={() => navigation.navigate('ChangePassword')}>
                    <Text style={styles.settingText}>Change Password</Text>
                    <ChevronRight size={20} color="#9ca3af" />
                </Pressable>

                <Pressable style={styles.settingItem} onPress={() => navigation.navigate('NotificationSettings')}>
                    <Text style={styles.settingText}>Notifications</Text>
                    <ChevronRight size={20} color="#9ca3af" />
                </Pressable>

                <Pressable style={styles.settingItem} onPress={() => navigation.navigate('PrivacyPolicy')}>
                    <Text style={styles.settingText}>Privacy Policy</Text>
                    <ChevronRight size={20} color="#9ca3af" />
                </Pressable>

                <Pressable style={styles.settingItem} onPress={() => navigation.navigate('HelpSupport')}>
                    <Text style={styles.settingText}>Help & Support</Text>
                    <ChevronRight size={20} color="#9ca3af" />
                </Pressable>
            </View>

            {/* Logout Button */}
            <Pressable style={styles.logoutBtn} onPress={handleLogout}>
                <LogOut size={20} color="#ef4444" />
                <Text style={styles.logoutText}>Logout</Text>
            </Pressable>

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
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        marginTop: 12,
        fontSize: 16,
        color: '#6b7280',
    },
    header: {
        backgroundColor: '#4caf50',
        paddingTop: 50,
        paddingBottom: 30,
        paddingHorizontal: 20,
    },
    headerNav: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    headerTitle: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
    backBtn: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatarContainer: {
        alignItems: 'center',
    },
    avatar: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: 'rgba(255,255,255,0.3)',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 12,
    },
    name: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 4,
    },
    email: {
        fontSize: 14,
        color: '#e8f5e9',
    },
    section: {
        padding: 20,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#374151',
        marginBottom: 12,
    },
    card: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 16,
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
    },
    iconBox: {
        width: 40,
        height: 40,
        borderRadius: 12,
        backgroundColor: '#f0fdf4',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    infoContent: {
        flex: 1,
    },
    infoLabel: {
        fontSize: 12,
        color: '#6b7280',
        marginBottom: 2,
    },
    infoValue: {
        fontSize: 16,
        color: '#1f2937',
        fontWeight: '500',
    },
    divider: {
        height: 1,
        backgroundColor: '#f3f4f6',
    },
    settingItem: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    settingText: {
        fontSize: 16,
        color: '#1f2937',
    },
    settingSubtext: {
        fontSize: 12,
        color: '#6b7280',
        marginTop: 4,
    },
    logoutBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#fff',
        marginHorizontal: 20,
        padding: 16,
        borderRadius: 12,
        gap: 8,
        borderWidth: 1,
        borderColor: '#fee2e2',
    },
    logoutText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#ef4444',
    },
    footer: {
        height: 40,
    },
});
