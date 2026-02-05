import { View, Text, StyleSheet, Switch } from 'react-native';
import { useState } from 'react';

export default function NotificationSettingsScreen() {
    const [pushEnabled, setPushEnabled] = useState(true);
    const [emailEnabled, setEmailEnabled] = useState(true);
    const [promoEnabled, setPromoEnabled] = useState(false);

    return (
        <View style={styles.container}>
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Push Notifications</Text>
                <View style={styles.row}>
                    <Text style={styles.label}>Order Updates</Text>
                    <Switch
                        value={pushEnabled}
                        onValueChange={setPushEnabled}
                        trackColor={{ true: '#4caf50' }}
                    />
                </View>
                <Text style={styles.helperText}>Get notified when your order status changes.</Text>
            </View>

            <View style={styles.divider} />

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Email Notifications</Text>
                <View style={styles.row}>
                    <Text style={styles.label}>Invoices & Receipts</Text>
                    <Switch
                        value={emailEnabled}
                        onValueChange={setEmailEnabled}
                        trackColor={{ true: '#4caf50' }}
                    />
                </View>
                <Text style={styles.helperText}>Receive digital bills and payment receipts via email.</Text>
            </View>

            <View style={styles.divider} />

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Marketing</Text>
                <View style={styles.row}>
                    <Text style={styles.label}>Promotions & Offers</Text>
                    <Switch
                        value={promoEnabled}
                        onValueChange={setPromoEnabled}
                        trackColor={{ true: '#4caf50' }}
                    />
                </View>
                <Text style={styles.helperText}>Stay updated with the latest deals and discounts.</Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        padding: 20,
    },
    section: {
        marginBottom: 20,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1f2937',
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
        color: '#374151',
    },
    helperText: {
        fontSize: 14,
        color: '#6b7280',
    },
    divider: {
        height: 1,
        backgroundColor: '#f3f4f6',
        marginVertical: 20,
    },
});
