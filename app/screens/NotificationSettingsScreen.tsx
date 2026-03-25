import { useState } from 'react';
import { StyleSheet, Switch, Text, View } from 'react-native';
import AppCard from '../components/ui/AppCard';
import AppHeader from '../components/ui/AppHeader';
import Screen from '../components/ui/Screen';
import { useAppTheme } from '../context/ThemeContext';

export default function NotificationSettingsScreen() {
    const { colors } = useAppTheme();
    const [pushEnabled, setPushEnabled] = useState(true);
    const [emailEnabled, setEmailEnabled] = useState(true);
    const [promoEnabled, setPromoEnabled] = useState(false);

    return (
        <Screen scrollable>
            <AppHeader title="Notification Settings" subtitle="Choose which updates Billify should surface across the app." />
            <AppCard>
                <SettingRow
                    title="Push Notifications"
                    label="Order Updates"
                    helper="Get notified when your order status changes."
                    value={pushEnabled}
                    onChange={setPushEnabled}
                    colors={colors}
                />
                <Divider color={colors.divider} />
                <SettingRow
                    title="Email Notifications"
                    label="Invoices & Receipts"
                    helper="Receive digital bills and payment receipts via email."
                    value={emailEnabled}
                    onChange={setEmailEnabled}
                    colors={colors}
                />
                <Divider color={colors.divider} />
                <SettingRow
                    title="Marketing"
                    label="Promotions & Offers"
                    helper="Stay updated with the latest deals and discounts."
                    value={promoEnabled}
                    onChange={setPromoEnabled}
                    colors={colors}
                />
            </AppCard>
        </Screen>
    );
}

function SettingRow({
    title,
    label,
    helper,
    value,
    onChange,
    colors,
}: {
    title: string;
    label: string;
    helper: string;
    value: boolean;
    onChange: (value: boolean) => void;
    colors: {
        primary: string;
        text: string;
        textMuted: string;
    };
}) {
    return (
        <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>{title}</Text>
            <View style={styles.row}>
                <Text style={[styles.label, { color: colors.text }]}>{label}</Text>
                <Switch value={value} onValueChange={onChange} trackColor={{ true: colors.primary }} thumbColor="#ffffff" />
            </View>
            <Text style={[styles.helperText, { color: colors.textMuted }]}>{helper}</Text>
        </View>
    );
}

function Divider({ color }: { color: string }) {
    return <View style={[styles.divider, { backgroundColor: color }]} />;
}

const styles = StyleSheet.create({
    section: {
        marginBottom: 20,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '700',
        marginBottom: 12,
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    label: {
        fontSize: 16,
        fontWeight: '600',
    },
    helperText: {
        fontSize: 14,
        lineHeight: 20,
    },
    divider: {
        height: 1,
        marginVertical: 20,
    },
});
