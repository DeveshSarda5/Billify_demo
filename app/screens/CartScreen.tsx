import { View, Text, FlatList, Pressable, StyleSheet, TextInput, Alert } from 'react-native';
import { Plus, Minus, Trash2, Tag } from 'lucide-react-native';
import { useCart } from '../context/CartContext';
import { useNavigation } from '@react-navigation/native';
import { useState } from 'react';

export default function CartScreen() {
  const { items, updateQty, removeItem, total } = useCart();
  const navigation = useNavigation<any>();
  const [coupon, setCoupon] = useState('');
  const [discount, setDiscount] = useState(0);

  const applyCoupon = () => {
    if (coupon.trim().toUpperCase() === 'SAVE50') {
      setDiscount(50);
      Alert.alert('Success', 'Coupon Applied! You saved ₹50');
    } else if (coupon.trim().toUpperCase() === 'WELCOME10') {
      const disc = Math.round(total * 0.1);
      setDiscount(disc);
      Alert.alert('Success', `Coupon Applied! You saved ₹${disc}`);
    } else {
      Alert.alert('Invalid Coupon', 'This coupon is not valid.');
      setDiscount(0);
    }
  };

  if (items.length === 0) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyText}>Your cart is empty</Text>
      </View>
    );
  }

  const finalTotal = Math.max(0, total - discount);

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
        {/* Coupon Input */}
        <View style={styles.couponRow}>
          <View style={styles.couponInputContainer}>
            <Tag size={18} color="#6b7280" style={{ marginRight: 8 }} />
            <TextInput
              placeholder="Enter Coupon Code"
              style={styles.couponInput}
              value={coupon}
              onChangeText={setCoupon}
              autoCapitalize="characters"
            />
          </View>
          <Pressable style={styles.applyBtn} onPress={applyCoupon}>
            <Text style={styles.applyText}>Apply</Text>
          </Pressable>
        </View>

        {/* Available Coupons */}
        <View style={styles.couponList}>
          <Text style={styles.couponListTitle}>Available Coupons:</Text>
          <View style={styles.couponItem}>
            <Text style={styles.couponCode}>SAVE50</Text>
            <Text style={styles.couponDesc}> - Flat ₹50 off</Text>
          </View>
          <View style={styles.couponItem}>
            <Text style={styles.couponCode}>WELCOME10</Text>
            <Text style={styles.couponDesc}> - 10% off on total</Text>
          </View>
        </View>

        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Subtotal:</Text>
          <Text style={styles.summaryValue}>₹{total}</Text>
        </View>
        {discount > 0 && (
          <View style={styles.summaryRow}>
            <Text style={[styles.summaryLabel, { color: '#22c55e' }]}>Discount:</Text>
            <Text style={[styles.summaryValue, { color: '#22c55e' }]}>-₹{discount}</Text>
          </View>
        )}
        <View style={[styles.summaryRow, { marginTop: 8 }]}>
          <Text style={styles.totalLabel}>Total:</Text>
          <Text style={styles.totalValue}>₹{finalTotal}</Text>
        </View>

        <Pressable
          style={styles.payBtn}
          onPress={() => navigation.navigate('Payment', { total: finalTotal })}
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

  /* Coupon */
  couponRow: {
    flexDirection: 'row',
    marginBottom: 20,
    gap: 12,
  },
  couponInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
    borderRadius: 12,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  couponInput: {
    flex: 1,
    height: 48,
    fontSize: 16,
  },
  applyBtn: {
    backgroundColor: '#1f2937',
    borderRadius: 12,
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  applyText: {
    color: '#fff',
    fontWeight: '600',
  },

  /* Available Coupons */
  couponList: {
    marginBottom: 16,
    backgroundColor: '#f0fdf4',
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#bbf7d0',
  },
  couponListTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#166534',
    marginBottom: 4,
  },
  couponItem: {
    flexDirection: 'row',
    marginBottom: 2,
  },
  couponCode: {
    fontSize: 12,
    fontWeight: '700',
    color: '#15803d',
  },
  couponDesc: {
    fontSize: 12,
    color: '#166534',
  },

  /* Summary */
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  summaryLabel: {
    fontSize: 15,
    color: '#6b7280',
  },
  summaryValue: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1f2937',
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1f2937',
  },
  totalValue: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1f2937',
  },

  payBtn: {
    backgroundColor: '#4caf50',
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
    marginTop: 16,
  },

  payText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
});