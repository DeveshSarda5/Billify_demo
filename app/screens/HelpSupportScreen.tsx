import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Pressable,
  Alert,
  ActivityIndicator,
  FlatList,
  ScrollView,
  Modal,
} from "react-native";
import { useState, useEffect } from "react";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/AppNavigator";
import { supportAPI } from "../services/api";
import { MessageSquare, ChevronDown } from "lucide-react-native";

type Props = NativeStackScreenProps<RootStackParamList, "HelpSupport">;

type Ticket = {
  _id: string;
  title: string;
  description: string;
  status: string;
  category: string;
  createdAt: string;
};

const TICKET_CATEGORIES = [
  { label: "Billing Issue", value: "billing-issue" },
  { label: "Payment Failure", value: "payment-failure" },
  { label: "Refund Request", value: "refund-request" },
  { label: "Technical Problem", value: "technical-problem" },
  { label: "Account Issue", value: "account-issue" },
  { label: "Other", value: "other" },
];

export default function HelpSupportScreen({ navigation }: Props) {
  const [activeTab, setActiveTab] = useState<"faq" | "ticket">("faq");
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("other");
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);

  useEffect(() => {
    loadTickets();
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
    if (!title || !description) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    setSubmitting(true);
    try {
      await supportAPI.createTicket({ title, description, category });
      Alert.alert("Success", "Ticket submitted successfully");
      setTitle("");
      setDescription("");
      setCategory("other");
      loadTickets();
    } catch (error: any) {
      Alert.alert("Error", error.message);
    } finally {
      setSubmitting(false);
    }
  };

  const getCategoryLabel = (value: string) => {
    const cat = TICKET_CATEGORIES.find((c) => c.value === value);
    return cat?.label || "Other";
  };

  const renderTicket = ({ item }: { item: Ticket }) => (
    <Pressable
      style={styles.card}
      onPress={() =>
        navigation.navigate("TicketDetails", { ticketId: item._id })
      }
    >
      <View style={styles.cardHeader}>
        <View style={{ flex: 1 }}>
          <Text style={styles.cardTitle}>{item.title}</Text>
          <Text style={styles.categoryBadgeText}>
            {getCategoryLabel(item.category)}
          </Text>
        </View>

        <View
          style={[
            styles.statusBadge,
            {
              backgroundColor:
                item.status === "open"
                  ? "#e0f2fe"
                  : item.status === "closed"
                  ? "#dcfce7"
                  : "#fef3c7",
            },
          ]}
        >
          <Text
            style={[
              styles.statusText,
              {
                color:
                  item.status === "open"
                    ? "#0ea5e9"
                    : item.status === "closed"
                    ? "#22c55e"
                    : "#b45309",
              },
            ]}
          >
            {item.status.toUpperCase()}
          </Text>
        </View>
      </View>

      <Text style={styles.cardBody} numberOfLines={2}>
        {item.description}
      </Text>
      <Text style={styles.cardDate}>
        {new Date(item.createdAt).toLocaleDateString()}
      </Text>
    </Pressable>
  );

  return (
    <View style={styles.container}>
      {/* Tabs */}
      <View style={styles.tabContainer}>
        <Pressable
          style={[styles.tab, activeTab === "faq" && styles.activeTab]}
          onPress={() => setActiveTab("faq")}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === "faq" && styles.activeTabText,
            ]}
          >
            FAQs
          </Text>
        </Pressable>

        <Pressable
          style={[styles.tab, activeTab === "ticket" && styles.activeTab]}
          onPress={() => setActiveTab("ticket")}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === "ticket" && styles.activeTabText,
            ]}
          >
            My Tickets
          </Text>
        </Pressable>
      </View>

      {activeTab === "faq" ? (
        <ScrollView style={styles.content}>
          <Text style={styles.sectionTitle}>
            Frequently Asked Questions
          </Text>
        </ScrollView>
      ) : (
        <>
          <View style={styles.formSection}>
            <Text style={styles.sectionTitle}>
              Create Support Ticket
            </Text>

            <TextInput
              style={styles.input}
              placeholder="Title"
              value={title}
              onChangeText={setTitle}
            />

            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Describe your issue..."
              value={description}
              onChangeText={setDescription}
              multiline
              textAlignVertical="top"
            />

            <Pressable
              style={styles.categoryInput}
              onPress={() => setShowCategoryModal(true)}
            >
              <Text style={styles.categoryLabel}>
                {getCategoryLabel(category)}
              </Text>
              <ChevronDown size={20} color="#9ca3af" />
            </Pressable>

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

          {loading ? (
            <ActivityIndicator style={{ marginTop: 20 }} color="#4caf50" />
          ) : (
            <FlatList
              data={tickets}
              renderItem={renderTicket}
              keyExtractor={(item) => item._id}
              contentContainerStyle={styles.listContent}
            />
          )}
        </>
      )}

      {/* Category Modal */}
      <Modal visible={showCategoryModal} transparent animationType="fade">
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setShowCategoryModal(false)}
        >
          <View style={styles.categoryModal}>
            <Text style={styles.modalTitle}>Select Category</Text>
            {TICKET_CATEGORIES.map((cat) => (
              <Pressable
                key={cat.value}
                style={[
                  styles.categoryOption,
                  category === cat.value && styles.selectedCategory,
                ]}
                onPress={() => {
                  setCategory(cat.value);
                  setShowCategoryModal(false);
                }}
              >
                <Text
                  style={[
                    styles.categoryOptionText,
                    category === cat.value &&
                      styles.selectedCategoryText,
                  ]}
                >
                  {cat.label}
                </Text>
              </Pressable>
            ))}
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f9fafb" },
  tabContainer: { flexDirection: "row", backgroundColor: "#fff" },
  tab: { flex: 1, padding: 16, alignItems: "center" },
  activeTab: { borderBottomWidth: 2, borderBottomColor: "#4caf50" },
  tabText: { color: "#6b7280", fontWeight: "500" },
  activeTabText: { color: "#4caf50", fontWeight: "600" },
  content: { padding: 20 },
  sectionTitle: { fontSize: 18, fontWeight: "600", marginBottom: 16 },
  formSection: { padding: 20, backgroundColor: "#fff" },
  input: {
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  },
  textArea: { minHeight: 100 },
  categoryInput: {
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  categoryLabel: { fontSize: 16 },
  submitBtn: {
    backgroundColor: "#4caf50",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  submitText: { color: "#fff", fontWeight: "600" },
  disabled: { opacity: 0.7 },
  listContent: { padding: 20 },
  card: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  cardTitle: { fontSize: 16, fontWeight: "600" },
  categoryBadgeText: { fontSize: 12, color: "#6b7280" },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 },
  statusText: { fontSize: 10, fontWeight: "700" },
  cardBody: { fontSize: 14, marginBottom: 8 },
  cardDate: { fontSize: 12, color: "#9ca3af" },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "flex-end",
  },
  categoryModal: {
    backgroundColor: "#fff",
    padding: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  modalTitle: { fontSize: 18, fontWeight: "600", marginBottom: 16 },
  categoryOption: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 8,
    backgroundColor: "#f9fafb",
  },
  selectedCategory: { backgroundColor: "#e0f2fe" },
  categoryOptionText: { fontSize: 15 },
  selectedCategoryText: { color: "#0ea5e9", fontWeight: "600" },
});
