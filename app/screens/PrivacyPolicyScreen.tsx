import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';

type Props = NativeStackScreenProps<RootStackParamList, 'PrivacyPolicy'>;

const LAST_UPDATED = 'June 2025';
const CONTACT_EMAIL = 'privacy@billify.in';

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {children}
    </View>
  );
}

function Para({ children, bold }: { children: React.ReactNode; bold?: boolean }) {
  return <Text style={[styles.para, bold && styles.paraBold]}>{children}</Text>;
}

function Bullet({ children }: { children: React.ReactNode }) {
  return (
    <View style={styles.bulletRow}>
      <Text style={styles.bulletDot}>{'\u2022'}</Text>
      <Text style={styles.bulletText}>{children}</Text>
    </View>
  );
}

export default function PrivacyPolicyScreen({ navigation }: Props) {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Privacy Policy</Text>
      <Text style={styles.meta}>Last updated: {LAST_UPDATED}</Text>

      <Section title="1. Introduction">
        <Para>
          Billify ("we", "our", or "us") is a smart self-checkout retail application developed for use within partner
          retail stores. We are committed to protecting your personal data and respecting your privacy rights in
          accordance with the Digital Personal Data Protection Act, 2023 (DPDP Act), the Information Technology
          Act, 2000, and applicable RBI guidelines on payment data.
        </Para>
        <Para>
          This Privacy Policy describes how we collect, use, store, share, and protect the personal information you
          provide when using the Billify mobile application. By using the app, you consent to the practices described
          here. If you are under 18 years of age, please ensure a parent or guardian has reviewed this policy before
          you use the app.
        </Para>
      </Section>

      <Section title="2. Information We Collect">
        <Para>We collect the following categories of personal data:</Para>
        <Para bold>Account and Identity Information</Para>
        <Bullet>Full name, email address, and phone number provided during registration.</Bullet>
        <Bullet>Encrypted password (we never store passwords in plain text).</Bullet>
        <Bullet>Profile details you voluntarily update (e.g., display name, preferred store).</Bullet>
        <Para bold>Location Data</Para>
        <Bullet>Device GPS coordinates, collected only when you open the app and solely to detect which partner retail store you are physically present in.</Bullet>
        <Bullet>Location data is used in-session and is not stored on our servers after your session ends.</Bullet>
        <Para bold>Shopping and Transaction Data</Para>
        <Bullet>Barcodes scanned during your shopping session (product IDs, names, prices, quantities).</Bullet>
        <Bullet>Cart contents and checkout details.</Bullet>
        <Bullet>Invoice records including items purchased, amounts paid, discounts applied, and timestamps.</Bullet>
        <Bullet>Previous bills and transaction history linked to your account.</Bullet>
        <Para bold>Payment Information</Para>
        <Bullet>Payments are processed exclusively by Razorpay, a PCI-DSS compliant payment gateway. We do not collect, transmit, or store your card numbers, CVV, or bank account credentials.</Bullet>
        <Bullet>UPI IDs you save on the app for convenience are stored in encrypted form and are only used to pre-fill the payment form.</Bullet>
        <Bullet>We retain Razorpay order IDs, payment IDs, and payment status for financial record-keeping and GST compliance.</Bullet>
        <Para bold>Ratings and Feedback</Para>
        <Bullet>Store ratings you submit (star rating only; no text reviews are stored at this time).</Bullet>
        <Para bold>Device and Technical Data</Para>
        <Bullet>Device type and operating system version (for compatibility purposes).</Bullet>
        <Bullet>App version and session logs (for error diagnosis; logs are purged after 30 days).</Bullet>
        <Bullet>We do not use advertising identifiers, fingerprinting, or tracking SDKs.</Bullet>
      </Section>

      <Section title="3. How We Use Your Data">
        <Para>We use your personal data strictly for the following purposes:</Para>
        <Bullet>To authenticate your account and maintain session security.</Bullet>
        <Bullet>To detect your store location and display relevant pricing and inventory.</Bullet>
        <Bullet>To process your self-checkout and generate digital invoices (PDF and on-screen).</Bullet>
        <Bullet>To facilitate and verify payments via Razorpay.</Bullet>
        <Bullet>To display your bill history and allow you to request exit-pass verification at the store.</Bullet>
        <Bullet>To show you active offers and apply coupon codes during checkout.</Bullet>
        <Bullet>To aggregate anonymised store feedback (e.g., average rating per store).</Bullet>
        <Bullet>To comply with GST record-keeping obligations under the CGST Act, 2017 (7-year retention).</Bullet>
        <Bullet>To send transactional notifications (e.g., payment confirmation) — no marketing messages without explicit opt-in.</Bullet>
      </Section>

      <Section title="4. Legal Basis for Processing">
        <Para>Under the DPDP Act, 2023, we rely on the following bases to process your data:</Para>
        <Bullet>Consent: You voluntarily provide account details and location access when you register and use the app.</Bullet>
        <Bullet>Contract: Processing is necessary to fulfil the self-checkout service you have requested.</Bullet>
        <Bullet>Legal obligation: Transaction records are retained to comply with GST, income tax, and RBI regulations.</Bullet>
        <Bullet>Legitimate interest: Aggregate, anonymised analytics to improve store operations — no individual profiling.</Bullet>
      </Section>

      <Section title="5. Data Sharing and Third Parties">
        <Para>We do not sell, rent, or trade your personal data. We share data only as follows:</Para>
        <Bullet>Razorpay (payment processing): Order amount, your name, email, and phone are shared with Razorpay solely to initiate and verify payments. Razorpay's privacy policy governs their handling of this data.</Bullet>
        <Bullet>Partner Retail Stores: Store-specific transaction data (items, total amount) is visible to the store's admin portal for billing, inventory, and support purposes. Stores are bound by data processing agreements.</Bullet>
        <Bullet>Cloud Infrastructure: Our backend is hosted on a secure cloud server. All data in transit is protected by TLS 1.2 or higher. At-rest encryption is applied to sensitive fields.</Bullet>
        <Bullet>Law Enforcement: We may disclose data if required by a court order, government directive, or to protect the safety of users, subject to applicable legal process.</Bullet>
      </Section>

      <Section title="6. Data Retention">
        <Bullet>Account data: Retained for the duration of your active account, plus 90 days after deletion request to allow dispute resolution.</Bullet>
        <Bullet>Transaction and invoice records: Retained for 7 years from the date of transaction as required by GST law.</Bullet>
        <Bullet>Location data: Not stored beyond the active session.</Bullet>
        <Bullet>App session logs: Purged after 30 days.</Bullet>
        <Bullet>UPI IDs: Deleted immediately upon your request or account deletion.</Bullet>
      </Section>

      <Section title="7. Your Rights">
        <Para>
          Under the DPDP Act, 2023 and other applicable laws, you have the following rights regarding your personal data:
        </Para>
        <Bullet>Right to Access: Request a copy of all personal data we hold about you.</Bullet>
        <Bullet>Right to Correction: Request correction of any inaccurate or incomplete data.</Bullet>
        <Bullet>Right to Erasure: Request deletion of your account and personal data (subject to statutory retention requirements).</Bullet>
        <Bullet>Right to Data Portability: Receive your transaction history and profile data in a machine-readable format.</Bullet>
        <Bullet>Right to Withdraw Consent: Withdraw consent for optional data uses (e.g., location access) via device settings at any time, though this may limit app functionality.</Bullet>
        <Bullet>Right to Grievance Redressal: Lodge a complaint with our Data Protection Officer or with the Data Protection Board of India once constituted.</Bullet>
        <Para>
          To exercise any of these rights, contact us at{' '}
          <Text style={styles.link}>{CONTACT_EMAIL}</Text>. We will respond within 30 days.
        </Para>
      </Section>

      <Section title="8. Data Security">
        <Para>We implement the following safeguards to protect your data:</Para>
        <Bullet>All API communication uses HTTPS / TLS encryption.</Bullet>
        <Bullet>Passwords are hashed using bcrypt before storage.</Bullet>
        <Bullet>Authentication tokens (JWT) are short-lived and stored securely on your device.</Bullet>
        <Bullet>Payment data never passes through our servers — Razorpay handles all card/UPI processing directly.</Bullet>
        <Bullet>Access to admin and backend systems is restricted by role-based authentication.</Bullet>
        <Para>
          While we take commercially reasonable steps to protect your data, no method of transmission or storage is 100% secure. In the event of a significant data breach, we will notify affected users within 72 hours as required by applicable law.
        </Para>
      </Section>

      <Section title="9. Children's Privacy">
        <Para>
          Billify is intended for shoppers aged 18 and above. We do not knowingly collect personal data from anyone under 18 without verifiable parental or guardian consent. If you believe a minor has registered without consent, please contact us immediately at{' '}
          <Text style={styles.link}>{CONTACT_EMAIL}</Text> and we will promptly delete the account.
        </Para>
      </Section>

      <Section title="10. Cookies and Tracking">
        <Para>
          The Billify mobile app does not use browser cookies. We do not embed third-party advertising SDKs or cross-app trackers. The only third-party SDK integrated is Razorpay's payment library, which operates under its own privacy policy.
        </Para>
      </Section>

      <Section title="11. Changes to This Policy">
        <Para>
          We may update this Privacy Policy periodically. When we make material changes, we will notify you via an in-app notification and update the "Last updated" date at the top of this document. Continued use of the app after the effective date constitutes your acceptance of the updated policy.
        </Para>
      </Section>

      <Section title="12. Contact Us">
        <Para>
          For any privacy-related questions, data requests, or complaints, please contact our Data Protection Officer:
        </Para>
        <Bullet>Email: {CONTACT_EMAIL}</Bullet>
        <Bullet>Address: Billify, India</Bullet>
        <Para>
          We aim to respond to all enquiries within 30 business days. If you are not satisfied with our response, you may contact the Data Protection Board of India once it becomes operational under the DPDP Act, 2023.
        </Para>
      </Section>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 40,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 4,
  },
  meta: {
    fontSize: 12,
    color: '#9ca3af',
    marginBottom: 24,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
    paddingBottom: 6,
  },
  para: {
    fontSize: 13,
    color: '#4b5563',
    lineHeight: 21,
    marginBottom: 6,
  },
  paraBold: {
    fontWeight: '600',
    color: '#374151',
    marginTop: 10,
    marginBottom: 2,
  },
  bulletRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 5,
    paddingLeft: 4,
  },
  bulletDot: {
    fontSize: 13,
    color: '#4caf50',
    marginRight: 8,
    lineHeight: 21,
  },
  bulletText: {
    fontSize: 13,
    color: '#4b5563',
    lineHeight: 21,
    flex: 1,
  },
  link: {
    color: '#2563eb',
    textDecorationLine: 'underline',
  },
});
