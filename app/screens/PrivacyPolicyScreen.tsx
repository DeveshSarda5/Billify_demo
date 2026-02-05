import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';

type Props = NativeStackScreenProps<RootStackParamList, 'PrivacyPolicy'>;

export default function PrivacyPolicyScreen({ navigation }: Props) {
    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.content}>
            <Text style={styles.title}>Privacy Policy</Text>
            <Text style={styles.lastUpdated}>Last updated: {new Date().toLocaleDateString()}</Text>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>1. Introduction</Text>
                <Text style={styles.text}>
                    Welcome to Billify. We respect your privacy and are committed to protecting your personal data.
                    This privacy policy will inform you as to how we look after your personal data when you visit our app
                    and tell you about your privacy rights and how the law protects you.
                </Text>
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>2. Data We Collect</Text>
                <Text style={styles.text}>
                    We may collect, use, store and transfer different kinds of personal data about you which we have grouped together follows:
                    {"\n\n"}• Identity Data includes first name, last name, username or similar identifier.
                    {"\n"}• Contact Data includes email address and telephone numbers.
                    {"\n"}• Transaction Data includes details about payments to and from you and other details of products and services you have purchased from us.
                </Text>
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>3. How We Use Your Data</Text>
                <Text style={styles.text}>
                    We will only use your personal data when the law allows us to. Most commonly, we will use your personal data in the following circumstances:
                    {"\n\n"}• Where we need to perform the contract we are about to enter into or have entered into with you.
                    {"\n"}• Where it is necessary for our legitimate interests (or those of a third party) and your interests and fundamental rights do not override those interests.
                    {"\n"}• Where we need to comply with a legal or regulatory obligation.
                </Text>
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>4. Data Security</Text>
                <Text style={styles.text}>
                    We have put in place appropriate security measures to prevent your personal data from being accidentally lost, used or accessed in an unauthorized way, altered or disclosed.
                </Text>
            </View>

            <View style={styles.footer}>
                <Text style={styles.footerText}>Contact us if you have any questions about this privacy policy.</Text>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    content: {
        padding: 20,
        paddingBottom: 40,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#1f2937',
        marginBottom: 8,
    },
    lastUpdated: {
        fontSize: 14,
        color: '#6b7280',
        marginBottom: 24,
    },
    section: {
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#1f2937',
        marginBottom: 8,
    },
    text: {
        fontSize: 15,
        lineHeight: 24,
        color: '#4b5563',
    },
    footer: {
        marginTop: 20,
        paddingTop: 20,
        borderTopWidth: 1,
        borderTopColor: '#f3f4f6',
    },
    footerText: {
        fontSize: 14,
        color: '#9ca3af',
        fontStyle: 'italic',
    },
});
