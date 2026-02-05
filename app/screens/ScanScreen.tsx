import { View, Text, StyleSheet, Pressable, Alert } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { ShoppingCart, ScanLine } from 'lucide-react-native';
import { useCart } from '../context/CartContext';
import { useNavigation } from '@react-navigation/native';
import { useState } from 'react';
import { productsAPI } from '../services/api';

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
  const navigation = useNavigation<any>();

  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);

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
      const product = await productsAPI.getProductByBarcode(data);

      addItem({
        barcode: data,
        name: product.name,
        price: product.price,
      });

      Alert.alert('✓ Added to Cart', `${product.name} - ₹${product.price}`);
    } catch (err: any) {
      if (err.message === 'Product not found') {
        Alert.alert('Product Not Found', 'This product is not in our database.');
      } else {
        Alert.alert('Error', 'Failed to fetch product. Please try again.');
      }
    } finally {
      setTimeout(() => setScanned(false), 1200);
    }
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
            addItem(DEV_PRODUCT);
            Alert.alert(
              'DEV Item Added',
              `${DEV_PRODUCT.name} - ₹${DEV_PRODUCT.price}`
            );
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
});
