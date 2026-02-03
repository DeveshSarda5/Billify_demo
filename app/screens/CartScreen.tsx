import { View, Text, FlatList, Pressable, StyleSheet } from 'react-native';
import { Plus, Minus, Trash2 } from 'lucide-react-native';
import { useCart } from '../context/CartContext';
import { useNavigation } from '@react-navigation/native';

export default function CartScreen() {
  const { items, updateQty, removeItem, total } = useCart();
  const navigation = useNavigation<any>();

  if (items.length === 0) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyText}>Your cart is empty</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={items}
        keyExtractor={(item) => item.barcode}
        contentContainerStyle={{ padding: 16 }}
        renderItem={({ item }) => (
          <View style={styles.card}>
            {/* Item info */}
            <View style={{ flex: 1 }}>
              <Text style={styles.name}>{item.name}</Text>
              <Text style={styles.price}>₹{item.price}</Text>
            </View>

            {/* Quantity controls */}
            <View style={styles.qtyRow}>
              <Pressable
                style={styles.qtyBtn}
                onPress={() =>
                  item.qty === 1
                    ? removeItem(item.barcode)
                    : updateQty(item.barcode, item.qty - 1)
                }
              >
                <Minus size={16} color="#1f2937" />
              </Pressable>

              <Text style={styles.qty}>{item.qty}</Text>

              <Pressable
                style={styles.qtyBtn}
                onPress={() => updateQty(item.barcode, item.qty + 1)}
              >
                <Plus size={16} color="#1f2937" />
              </Pressable>
            </View>

            {/* Remove item */}
            <Pressable
              onPress={() => removeItem(item.barcode)}
              style={styles.deleteBtn}
            >
              <Trash2 size={18} color="#ef4444" />
            </Pressable>
          </View>
        )}
      />

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.total}>Total: ₹{total}</Text>

        <Pressable
          style={styles.payBtn}
          onPress={() => navigation.navigate('Payment', { total })}
        >
          <Text style={styles.payText}>Proceed to Pay</Text>
        </Pressable>
      </View>
    </View>
  );
}

/* ---------------- STYLES ---------------- */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },

  /* Empty state */
  empty: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 18,
    color: '#6b7280',
    fontWeight: '500',
  },

  /* Cart item card */
  card: {
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 16,
    marginBottom: 14,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },

  name: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
  },

  price: {
    marginTop: 4,
    fontSize: 14,
    color: '#6b7280',
  },

  /* Quantity controls */
  qtyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 10,
  },

  qtyBtn: {
    backgroundColor: '#e5f4ea',
    padding: 6,
    borderRadius: 8,
  },

  qty: {
    marginHorizontal: 10,
    fontSize: 15,
    fontWeight: '600',
    color: '#1f2937',
    minWidth: 20,
    textAlign: 'center',
  },

  deleteBtn: {
    padding: 6,
  },

  /* Footer */
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderColor: '#e5e7eb',
    backgroundColor: '#fff',
  },

  total: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 12,
  },

  payBtn: {
    backgroundColor: '#4caf50',
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
  },

  payText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
});