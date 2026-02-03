import { View, Text, StyleSheet, Pressable } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { ShoppingCart, ScanLine } from 'lucide-react-native';
import { useCart } from '../context/CartContext';
import { useNavigation } from '@react-navigation/native';
import { useState } from 'react';

/* Mock product DB (same as before) */
const PRODUCT_CATALOG: Record<string, { name: string; price: number }> = {
  '8901234567890': { name: 'Organic Milk 1L', price: 65 },
  '8901234567891': { name: 'Whole Wheat Bread', price: 45 },
  '8901234567892': { name: 'Fresh Apple 1kg', price: 120 },
  '8901234567893': { name: 'Basmati Rice 5kg', price: 450 },
  '8901234567894': { name: 'Extra Virgin Olive Oil', price: 650 },
};

export default function ScanScreen() {
  const { items, addItem } = useCart();
  const navigation = useNavigation<any>();

  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);

  /* --- Permission handling --- */
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

  /* --- Barcode handler --- */
  const handleScan = ({ data }: { data: string }) => {
    if (scanned) return;

    console.log('SCANNED:', data);

    const product = PRODUCT_CATALOG[data] ?? {
      name: 'Unknown Item',
      price: 99,
    };

    addItem({
      barcode: data,
      name: product.name,
      price: product.price,
    });

    setScanned(true);
    setTimeout(() => setScanned(false), 1200);
  };

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
          {/* LIVE CAMERA */}
          <CameraView
            style={StyleSheet.absoluteFillObject}
            onBarcodeScanned={handleScan}
            barcodeScannerSettings={{
              barcodeTypes: ['ean13', 'ean8', 'code128', 'upc_a'],
            }}
          />

          {/* UI FRAME (non-blocking) */}
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

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },

  /* Permission */
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

  /* Header */
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

  /* Scan */
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

  /* Instructions */
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