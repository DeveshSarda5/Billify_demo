import { View, Text, StyleSheet, Pressable, Alert, Modal } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { ShoppingCart, ScanLine, X } from 'lucide-react-native';
import { useCart } from '../context/CartContext';
import { useLocation } from '../context/LocationContext';
import { useNavigation } from '@react-navigation/native';
import { useState } from 'react';
import { productsAPI } from '../services/api';
import LocationHeader from '../components/LocationHeader';
import { findProductByBarcode } from '../constants/storeInventory';

/* =======================
   DEV TEST PRODUCT
======================= */
const DEV_PRODUCT = {
  barcode: 'DEV-001',
  name: 'Test Shampoo',
  price: 199,
};

export default function ScanScreen() {
  const { items, addItem } = useCart();
  const { currentStore } = useLocation();
  const navigation = useNavigation<any>();

  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [lastScannedItem, setLastScannedItem] = useState<any>(null);

  /* =======================
     PERMISSION HANDLING
  ======================= */
  if (!permission) return <View />;

  if (!permission.granted) {
    return (
      <View style={styles.permission}>
        <Text style={styles.permissionText}>
          Camera access is required to scan products
        </Text>
        <Pressable style={styles.permissionBtn} onPress={requestPermission}>
          <Text style={styles.permissionBtnText}>Allow Camera</Text>
        </Pressable>
      </View>
    );
  }

  /* =======================
     BARCODE HANDLER
  ======================= */
  const handleScan = async ({ data }: { data: string }) => {
    if (scanned) return;

    setScanned(true);

    try {
      // First, try to find product in store-specific inventory
      if (currentStore?.id) {
        const storeProduct = findProductByBarcode(data, currentStore.id);
        
        if (storeProduct) {
          // Immediately update cart state
          addItem({
            barcode: data,
            name: storeProduct.name,
            price: storeProduct.price,
          });

          // Store for confirmation UI
          setLastScannedItem({
            name: storeProduct.name,
            price: storeProduct.price,
          });

          setShowConfirmation(true);
          return;
        }
      }

      // Fallback: Try API lookup
      const product = await productsAPI.getProductByBarcode(data);

      // Immediately update cart state
      addItem({
        barcode: data,
        name: product.name,
        price: product.price,
      });

      // Store for confirmation UI
      setLastScannedItem({
        name: product.name,
        price: product.price,
      });

      setShowConfirmation(true);
    } catch (err: any) {
      if (err.message === 'Product not found') {
        Alert.alert(
          'Product Not Found',
          'This product is not available in ' + (currentStore?.name || 'your store') + '.'
        );
      } else {
        Alert.alert('Error', 'Failed to fetch product. Please try again.');
      }
      setTimeout(() => setScanned(false), 800);
    }
  };

  const handleScanMore = () => {
    setShowConfirmation(false);
    setScanned(false);
  };

  const handleGoToCart = () => {
    setShowConfirmation(false);
    navigation.navigate('Cart');
  };

  /* =======================
     UI
  ======================= */
  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.appName}>Billify</Text>
          <Text style={styles.subtitle}>Scan products to add</Text>
        </View>

        <Pressable
          style={styles.cartBtn}
          onPress={() => navigation.navigate('Cart')}
        >
          <ShoppingCart color="#fff" size={22} />
          {items.length > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{items.length}</Text>
            </View>
          )}
        </Pressable>
      </View>

      {/* Location Header */}
      <LocationHeader />

      {/* Scan Area */}
      <View style={styles.scanArea}>
        <View style={styles.scanBox}>
          <CameraView
            style={StyleSheet.absoluteFillObject}
            onBarcodeScanned={handleScan}
            barcodeScannerSettings={{
              barcodeTypes: ['ean13', 'ean8', 'code128', 'upc_a'],
            }}
          />

          <View style={styles.frame}>
            <View style={styles.scanLine} />
            <ScanLine size={56} color="#4caf50" />
            <Text style={styles.scanTitle}>Scan product barcode</Text>
            <Text style={styles.scanHint}>
              Position the barcode within the frame
            </Text>
          </View>
        </View>
      </View>

      {/* DEV ONLY BUTTON */}
      <View style={styles.devWrapper}>
        <Pressable
          onPress={() => {
            const devItem = DEV_PRODUCT;
            addItem(devItem);
            setLastScannedItem({
              name: devItem.name,
              price: devItem.price,
            });
            setShowConfirmation(true);
          }}
          style={styles.devBtn}
        >
          <Text style={styles.devText}>➕ Add Test Item (DEV)</Text>
        </Pressable>
      </View>

      {/* Instructions */}
      <View style={styles.instructions}>
        <View style={styles.instructionsCard}>
          <Text style={styles.instructionsTitle}>How it works</Text>
          <Text style={styles.instructionsText}>• Scan each product</Text>
          <Text style={styles.instructionsText}>
            • Items added to cart automatically
          </Text>
          <Text style={styles.instructionsText}>
            • Review cart and checkout
          </Text>
        </View>
      </View>

      {/* Confirmation Modal */}
      <Modal visible={showConfirmation} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.confirmationCard}>
            <Pressable
              style={styles.closeBtn}
              onPress={() => {
                setShowConfirmation(false);
                setTimeout(() => setScanned(false), 300);
              }}
            >
              <X size={24} color="#6b7280" />
            </Pressable>

            <View style={styles.confirmationContent}>
              <View style={styles.checkmark}>
                <Text style={styles.checkmarkText}>✓</Text>
              </View>

              <Text style={styles.confirmationTitle}>Item Added to Cart</Text>

              <View style={styles.itemDetails}>
                <Text style={styles.itemName}>{lastScannedItem?.name}</Text>
                <Text style={styles.itemPrice}>₹{lastScannedItem?.price}</Text>
              </View>

              <View style={styles.confirmationButtons}>
                <Pressable
                  style={styles.scanMoreBtn}
                  onPress={handleScanMore}
                >
                  <Text style={styles.scanMoreText}>🔍 Scan More</Text>
                </Pressable>

                <Pressable
                  style={styles.goToCartBtn}
                  onPress={handleGoToCart}
                >
                  <Text style={styles.goToCartText}>🛒 Go To Cart</Text>
                </Pressable>
              </View>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

/* =======================
   STYLES
======================= */
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },

  permission: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  permissionText: {
    fontSize: 16,
    color: '#374151',
    marginBottom: 16,
    textAlign: 'center',
  },
  permissionBtn: {
    backgroundColor: '#4caf50',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 14,
  },
  permissionBtnText: {
    color: '#fff',
    fontWeight: '600',
  },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderColor: '#f3f4f6',
  },
  appName: { fontSize: 20, fontWeight: 'bold', color: '#1f2937' },
  subtitle: { fontSize: 12, color: '#6b7280', marginTop: 2 },

  cartBtn: {
    backgroundColor: '#4caf50',
    padding: 12,
    borderRadius: 16,
  },
  badge: {
    position: 'absolute',
    top: -6,
    right: -6,
    backgroundColor: '#ef4444',
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: { color: '#fff', fontSize: 12, fontWeight: '700' },

  scanArea: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  scanBox: {
    width: '100%',
    maxWidth: 330,
    aspectRatio: 1,
    borderRadius: 28,
    overflow: 'hidden',
  },
  frame: {
    ...StyleSheet.absoluteFillObject,
    borderWidth: 3,
    borderStyle: 'dashed',
    borderColor: '#d1d5db',
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scanLine: {
    position: 'absolute',
    top: '50%',
    width: '100%',
    height: 2,
    backgroundColor: '#4caf50',
    opacity: 0.7,
  },
  scanTitle: {
    marginTop: 12,
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
  },
  scanHint: {
    fontSize: 13,
    color: '#6b7280',
    marginTop: 4,
    textAlign: 'center',
  },

  devWrapper: {
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  devBtn: {
    backgroundColor: '#e5e7eb',
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
  },
  devText: {
    fontWeight: '600',
    color: '#111827',
  },

  instructions: {
    padding: 20,
    backgroundColor: '#f8f7f4',
  },
  instructionsCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 18,
  },
  instructionsTitle: {
    fontWeight: '600',
    marginBottom: 6,
    color: '#1f2937',
  },
  instructionsText: {
    fontSize: 13,
    color: '#4b5563',
    marginTop: 2,
  },

  /* Confirmation Modal Styles */
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  confirmationCard: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 16,
    paddingBottom: 20,
    paddingTop: 12,
    maxHeight: '80%',
  },
  closeBtn: {
    alignSelf: 'flex-end',
    padding: 4,
    marginRight: 8,
  },
  confirmationContent: {
    alignItems: 'center',
  },
  checkmark: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#22c55e',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 12,
  },
  checkmarkText: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#fff',
  },
  confirmationTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 12,
  },
  itemDetails: {
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    padding: 12,
    width: '100%',
    marginBottom: 16,
    alignItems: 'center',
  },
  itemName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
  },
  itemPrice: {
    fontSize: 16,
    fontWeight: '700',
    color: '#4caf50',
    marginTop: 6,
  },
  confirmationButtons: {
    width: '100%',
    gap: 10,
  },
  scanMoreBtn: {
    backgroundColor: '#f3f4f6',
    borderWidth: 2,
    borderColor: '#d1d5db',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  scanMoreText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
  },
  goToCartBtn: {
    backgroundColor: '#4caf50',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  goToCartText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
});
