import { View, Text, FlatList, Pressable, StyleSheet, TextInput, Alert } from 'react-native';
import { Plus, Minus, Trash2, Tag } from 'lucide-react-native';
import { useCart } from '../context/CartContext';
import { useNavigation } from '@react-navigation/native';
import { useState, useMemo, useEffect } from 'react';
import { offersAPI, type OfferResponse } from '../services/api';
import { useAppTheme } from '../context/ThemeContext';

type SortOption = 'name' | 'quantity' | 'price' | 'none';

export default function CartScreen() {
  const { items, updateQty, removeItem, total } = useCart();
  const navigation = useNavigation<any>();
  const { colors, isDark } = useAppTheme();
  const [coupon, setCoupon] = useState('');
  const [discount, setDiscount] = useState(0);
  const [sortBy, setSortBy] = useState<SortOption>('none');
  const [activeOffers, setActiveOffers] = useState<OfferResponse[]>([]);

  useEffect(() => {
    offersAPI.getActiveOffers()
      .then(setActiveOffers)
      .catch(() => {
        // Silently fallback — no offers will be shown
      });
  }, []);

  // Get sorted items without mutating original cart state
  const sortedItems = useMemo(() => {
    if (sortBy === 'none') return items;

    const itemsCopy = [...items];
    
    switch (sortBy) {
      case 'name':
        return itemsCopy.sort((a, b) => a.name.localeCompare(b.name));
      case 'quantity':
        return itemsCopy.sort((a, b) => b.qty - a.qty);
      case 'price':
        return itemsCopy.sort((a, b) => b.price - a.price);
      default:
        return itemsCopy;
    }
  }, [items, sortBy]);

  const applyCoupon = () => {
    const code = coupon.trim().toUpperCase();
    const matched = activeOffers.find((o) => o.couponCode === code);

    if (!matched) {
      Alert.alert('Invalid Coupon', 'This coupon is not valid or has expired.');
      setDiscount(0);
      return;
    }

    if (matched.currentUsage >= matched.maxUsage) {
      Alert.alert('Coupon Expired', 'This coupon has reached its maximum redemption limit.');
      setDiscount(0);
      return;
    }

    let disc = 0;
    if (matched.discountType === 'percentage') {
      disc = Math.round(total * (matched.discountValue / 100));
    } else if (matched.discountType === 'fixed') {
      disc = matched.discountValue;
    } else if (matched.discountType === 'bogo') {
      disc = matched.discountValue;
    }

    disc = Math.min(disc, total);
    setDiscount(disc);
    Alert.alert('Coupon Applied', `${matched.name} applied! You saved ₹${disc}`);
  };

  const getOfferDescription = (offer: OfferResponse) => {
    if (offer.discountType === 'percentage') return `${offer.discountValue}% off`;
    if (offer.discountType === 'fixed') return `₹${offer.discountValue} off`;
    if (offer.discountType === 'bogo') return `Buy One Get One`;
    return '';
  };

  if (items.length === 0) {
    return (
      <View style={[styles.empty, { backgroundColor: colors.background }]}>
        <Text style={[styles.emptyText, { color: colors.textMuted }]}>Your cart is empty</Text>
      </View>
    );
  }

  const finalTotal = Math.max(0, total - discount);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Sort Controls */}
      <View style={[styles.sortControls, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Text style={[styles.sortLabel, { color: colors.textMuted }]}>Sort by:</Text>
        <View style={styles.sortButtons}>
          <Pressable
            style={[styles.sortBtn, { backgroundColor: colors.background, borderColor: colors.border }, sortBy === 'none' && styles.sortBtnActive]}
            onPress={() => setSortBy('none')}
          >
            <Text style={[styles.sortBtnText, { color: colors.textMuted }, sortBy === 'none' && styles.sortBtnTextActive]}>
              Default
            </Text>
          </Pressable>
          <Pressable
            style={[styles.sortBtn, { backgroundColor: colors.background, borderColor: colors.border }, sortBy === 'name' && styles.sortBtnActive]}
            onPress={() => setSortBy('name')}
          >
            <Text style={[styles.sortBtnText, { color: colors.textMuted }, sortBy === 'name' && styles.sortBtnTextActive]}>
              Name
            </Text>
          </Pressable>
          <Pressable
            style={[styles.sortBtn, { backgroundColor: colors.background, borderColor: colors.border }, sortBy === 'quantity' && styles.sortBtnActive]}
            onPress={() => setSortBy('quantity')}
          >
            <Text style={[styles.sortBtnText, { color: colors.textMuted }, sortBy === 'quantity' && styles.sortBtnTextActive]}>
              Qty
            </Text>
          </Pressable>
          <Pressable
            style={[styles.sortBtn, { backgroundColor: colors.background, borderColor: colors.border }, sortBy === 'price' && styles.sortBtnActive]}
            onPress={() => setSortBy('price')}
          >
            <Text style={[styles.sortBtnText, { color: colors.textMuted }, sortBy === 'price' && styles.sortBtnTextActive]}>
              Price
            </Text>
          </Pressable>
        </View>
      </View>

      <FlatList
        data={sortedItems}
        keyExtractor={(item) => item.barcode}
        contentContainerStyle={{ padding: 16 }}
        renderItem={({ item }) => {
          // Derived calculation: quantity × price (no mutation)
          const totalPrice = item.qty * item.price;
          
          return (
            <View style={[styles.card, { backgroundColor: colors.card }]}>
              {/* Left side: Item name and per-piece price */}
              <View style={{ flex: 1 }}>
                <Text style={[styles.name, { color: colors.text }]}>{item.name}</Text>
                <Text style={[styles.pricePerPiece, { color: colors.textMuted }]}>₹{item.price} per piece</Text>
              </View>

              {/* Right side: Quantity and total price */}
              <View style={styles.rightSection}>
                <Text style={[styles.qtyLabel, { color: colors.textSoft }]}>Qty: {item.qty}</Text>
                <Text style={[styles.totalPrice, { color: colors.primary }]}>₹{totalPrice}</Text>
              </View>

              <View style={styles.controlsRow}>
                {/* Quantity controls */}
                <View style={styles.qtyRow}>
                  <Pressable
                    style={[styles.qtyBtn, { backgroundColor: isDark ? colors.cardAlt : '#e5f4ea' }]}
                    onPress={() =>
                      item.qty === 1
                        ? removeItem(item.barcode)
                        : updateQty(item.barcode, item.qty - 1)
                    }
                  >
                    <Minus size={16} color={colors.text} />
                  </Pressable>

                  <Text style={[styles.qty, { color: colors.text }]}>{item.qty}</Text>

                  <Pressable
                    style={[styles.qtyBtn, { backgroundColor: isDark ? colors.cardAlt : '#e5f4ea' }]}
                    onPress={() => updateQty(item.barcode, item.qty + 1)}
                  >
                    <Plus size={16} color={colors.text} />
                  </Pressable>
                </View>

                {/* Remove item */}
                <Pressable
                  onPress={() => removeItem(item.barcode)}
                  style={styles.deleteBtn}
                >
                  <Trash2 size={18} color={colors.danger} />
                </Pressable>
              </View>
            </View>
          );
        }}
      />

      {/* Footer */}
      <View style={[styles.footer, { backgroundColor: colors.card, borderColor: colors.border }]}>
        {/* Coupon Input */}
        <View style={styles.couponRow}>
          <View style={[styles.couponInputContainer, { backgroundColor: colors.inputBackground, borderColor: colors.border }]}>
            <Tag size={18} color={colors.textMuted} style={{ marginRight: 8 }} />
            <TextInput
              placeholder="Enter Coupon Code"
              placeholderTextColor={colors.inputPlaceholder}
              style={[styles.couponInput, { color: colors.text }]}
              value={coupon}
              onChangeText={setCoupon}
              autoCapitalize="characters"
            />
          </View>
          <Pressable style={[styles.applyBtn, { backgroundColor: colors.text }]} onPress={applyCoupon}>
            <Text style={[styles.applyText, { color: colors.background }]}>Apply</Text>
          </Pressable>
        </View>

        {/* Available Coupons */}
        {activeOffers.length > 0 && (
          <View style={[styles.couponList, { backgroundColor: isDark ? colors.cardAlt : '#f0fdf4', borderColor: isDark ? colors.border : '#bbf7d0' }]}>
            <Text style={[styles.couponListTitle, { color: isDark ? colors.primary : '#166534' }]}>Available Coupons:</Text>
            {activeOffers.map((offer) => (
              <View key={offer._id} style={styles.couponItem}>
                <Text style={[styles.couponCode, { color: colors.primary }]}>{offer.couponCode}</Text>
                <Text style={[styles.couponDesc, { color: isDark ? colors.primaryAlt : '#166534' }]}> - {getOfferDescription(offer)}</Text>
              </View>
            ))}
          </View>
        )}

        <View style={styles.summaryRow}>
          <Text style={[styles.summaryLabel, { color: colors.textMuted }]}>Subtotal:</Text>
          <Text style={[styles.summaryValue, { color: colors.text }]}>₹{total}</Text>
        </View>
        {discount > 0 && (
          <View style={styles.summaryRow}>
            <Text style={[styles.summaryLabel, { color: colors.success }]}>Discount:</Text>
            <Text style={[styles.summaryValue, { color: colors.success }]}>-₹{discount}</Text>
          </View>
        )}
        <View style={[styles.summaryRow, { marginTop: 8 }]}>
          <Text style={[styles.totalLabel, { color: colors.text }]}>Total:</Text>
          <Text style={[styles.totalValue, { color: colors.text }]}>₹{finalTotal}</Text>
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
  },

  /* Empty state */
  empty: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '500',
  },

  /* Cart item card */
  card: {
    borderRadius: 18,
    padding: 14,
    marginBottom: 14,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },

  name: {
    fontSize: 15,
    fontWeight: '700',
  },

  pricePerPiece: {
    marginTop: 4,
    fontSize: 13,
    fontWeight: '500',
  },

  /* Right section: Quantity and total price */
  rightSection: {
    alignItems: 'flex-end',
    marginBottom: 8,
  },

  qtyLabel: {
    fontSize: 12,
    marginBottom: 2,
  },

  totalPrice: {
    fontSize: 16,
    fontWeight: '700',
  },

  /* Controls row: Quantity buttons and delete */
  controlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  /* Quantity controls */
  qtyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },

  qtyBtn: {
    padding: 6,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },

  qty: {
    marginHorizontal: 8,
    fontSize: 14,
    fontWeight: '600',
    minWidth: 18,
    textAlign: 'center',
  },

  deleteBtn: {
    padding: 6,
  },

  /* Footer */
  footer: {
    padding: 16,
    borderTopWidth: 1,
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
    borderRadius: 12,
    paddingHorizontal: 12,
    borderWidth: 1,
  },
  couponInput: {
    flex: 1,
    height: 48,
    fontSize: 16,
  },
  applyBtn: {
    borderRadius: 12,
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  applyText: {
    fontWeight: '600',
  },

  /* Available Coupons */
  couponList: {
    marginBottom: 16,
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
  },
  couponListTitle: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 4,
  },
  couponItem: {
    flexDirection: 'row',
    marginBottom: 2,
  },
  couponCode: {
    fontSize: 12,
    fontWeight: '700',
  },
  couponDesc: {
    fontSize: 12,
  },

  /* Summary */
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  summaryLabel: {
    fontSize: 15,
  },
  summaryValue: {
    fontSize: 15,
    fontWeight: '600',
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: '700',
  },
  totalValue: {
    fontSize: 20,
    fontWeight: '800',
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

  /* Sort Controls */
  sortControls: {
    borderBottomWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  sortLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 6,
  },
  sortButtons: {
    flexDirection: 'row',
    gap: 6,
    flexWrap: 'wrap',
  },
  sortBtn: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  sortBtnActive: {
    backgroundColor: '#4caf50',
    borderColor: '#4caf50',
  },
  sortBtnText: {
    fontSize: 12,
    fontWeight: '500',
  },
  sortBtnTextActive: {
    color: '#fff',
  },
});