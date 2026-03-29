import {
  ActivityIndicator,
  Alert,
  Animated,
  Easing,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useNavigation } from '@react-navigation/native';
import { useEffect, useRef, useState } from 'react';
import { ShoppingCart, X } from 'lucide-react-native';
import AppCard from '../components/ui/AppCard';
import AppButton from '../components/ui/AppButton';
import Screen from '../components/ui/Screen';
import { findProductByBarcode } from '../constants/storeInventory';
import { useCart } from '../context/CartContext';
import { useLocation } from '../context/LocationContext';
import { useAppTheme } from '../context/ThemeContext';
import { productsAPI } from '../services/api';
import { radius, shadows, spacing } from '../theme';

const DEV_PRODUCT = {
  barcode: 'DEV-001',
  name: 'Test Shampoo',
  price: 199,
};

export default function ScanScreen() {
  const { colors, isDark } = useAppTheme();
  const { items, addItem } = useCart();
  const { currentStore } = useLocation();
  const navigation = useNavigation<any>();

  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [lastScannedItem, setLastScannedItem] = useState<any>(null);
  const [frameHeight, setFrameHeight] = useState(220);

  const scanLineTranslate = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!permission?.granted || frameHeight <= 0) {
      return;
    }

    scanLineTranslate.setValue(0);
    const animation = Animated.loop(
      Animated.timing(scanLineTranslate, {
        toValue: Math.max(frameHeight - 8, 0),
        duration: 2200,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    );

    animation.start();

    return () => {
      animation.stop();
    };
  }, [frameHeight, permission?.granted, scanLineTranslate]);

  if (!permission) {
    return <Screen safeEdges={['top', 'bottom', 'left', 'right']} />;
  }

  const handleScan = async ({ data }: { data: string }) => {
    if (scanned) {
      return;
    }

    setScanned(true);

    try {
      if (currentStore?.id) {
        const storeProduct = findProductByBarcode(data, currentStore.id);

        if (storeProduct) {
          addItem({
            barcode: data,
            name: storeProduct.name,
            price: storeProduct.price,
          });

          setLastScannedItem({
            name: storeProduct.name,
            price: storeProduct.price,
          });
          setShowConfirmation(true);
          return;
        }
      }

      const product = await productsAPI.getProductByBarcode(data);
      addItem({
        barcode: data,
        name: product.name,
        price: product.price,
      });

      setLastScannedItem({
        name: product.name,
        price: product.price,
      });
      setShowConfirmation(true);
    } catch (err: any) {
      if (err.message === 'Product not found') {
        Alert.alert(
          'Product Not Found',
          `This product is not available in ${currentStore?.name || 'your store'}.`,
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

  if (!permission.granted) {
    return (
      <Screen safeEdges={['top', 'bottom', 'left', 'right']}>
        <View style={styles.permissionWrap}>
          <Text style={[styles.permissionTitle, { color: colors.text }]}>Camera access required</Text>
          <Text style={[styles.permissionText, { color: colors.textMuted }]}> 
            Billify needs camera access to scan barcodes and add products to your cart.
          </Text>
          <AppButton onPress={requestPermission}>Allow Camera</AppButton>
        </View>
      </Screen>
    );
  }

  return (
    <Screen padded={false} safeEdges={['top', 'bottom', 'left', 'right']}>
      <View style={styles.headerShell}>
        <View style={styles.headerRow}>
          <View style={styles.headerCopy}>
            <Text style={[styles.headerTitle, { color: colors.text }]}>Smart Scanner</Text>
            <Text style={[styles.headerSubtitle, { color: colors.textMuted }]}> 
              Keep the barcode inside the wide frame while the scan line sweeps from top to bottom.
            </Text>
          </View>
          <Pressable style={[styles.cartButton, { backgroundColor: colors.primary }]} onPress={() => navigation.navigate('Cart')}>
            <ShoppingCart size={22} color="#ffffff" />
            {items.length > 0 ? (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{items.length}</Text>
              </View>
            ) : null}
          </Pressable>
        </View>
      </View>

      <View style={styles.stage}>
        <View
          style={[
            styles.scanShell,
            {
              backgroundColor: isDark ? 'rgba(15, 23, 42, 0.65)' : 'rgba(15, 23, 42, 0.06)',
            },
            shadows[isDark ? 'dark' : 'light'],
          ]}
        >
          <View style={styles.scanBox}>
            <CameraView
              style={StyleSheet.absoluteFillObject}
              onBarcodeScanned={handleScan}
              barcodeScannerSettings={{
                barcodeTypes: ['ean13', 'ean8', 'code128', 'upc_a'],
              }}
            />

            <View style={styles.frameOverlay}>
              <View
                style={[
                  styles.frameWindow,
                  {
                    borderColor: scanned ? colors.primaryAlt : 'rgba(255,255,255,0.84)',
                  },
                ]}
                onLayout={(event) => setFrameHeight(event.nativeEvent.layout.height)}
              >
                <View style={[styles.corner, styles.cornerTopLeft, { borderColor: colors.primary }]} />
                <View style={[styles.corner, styles.cornerTopRight, { borderColor: colors.primary }]} />
                <View style={[styles.corner, styles.cornerBottomLeft, { borderColor: colors.primary }]} />
                <View style={[styles.corner, styles.cornerBottomRight, { borderColor: colors.primary }]} />

                <Animated.View
                  style={[
                    styles.scanLine,
                    {
                      backgroundColor: colors.primary,
                      shadowColor: colors.primary,
                      transform: [{ translateY: scanLineTranslate }],
                    },
                  ]}
                />
              </View>
            </View>
          </View>

        </View>
      </View>

      <View style={styles.bottomStack}>
        <Pressable
          onPress={() => {
            addItem(DEV_PRODUCT);
            setLastScannedItem({
              name: DEV_PRODUCT.name,
              price: DEV_PRODUCT.price,
            });
            setScanned(true);
            setShowConfirmation(true);
          }}
          style={[styles.devButton, { backgroundColor: colors.card, borderColor: colors.border }]}
        >
          <Text style={[styles.devButtonText, { color: colors.text }]}>+ Add Test Item (DEV)</Text>
        </Pressable>

        <AppCard>
          <Text style={[styles.instructionsTitle, { color: colors.text }]}>How it works</Text>
          <Text style={[styles.instructionsText, { color: colors.textMuted }]}>1. Aim the camera at the barcode.</Text>
          <Text style={[styles.instructionsText, { color: colors.textMuted }]}>2. Wait for the animated line to pass over it.</Text>
          <Text style={[styles.instructionsText, { color: colors.textMuted }]}>3. Review the cart after each successful scan.</Text>
        </AppCard>
      </View>

      <Modal visible={showConfirmation} transparent animationType="slide">
        <View style={[styles.modalOverlay, { backgroundColor: colors.overlay }]}> 
          <View style={[styles.confirmationCard, { backgroundColor: colors.card, borderColor: colors.border }]}> 
            <Pressable
              style={styles.closeButton}
              onPress={() => {
                setShowConfirmation(false);
                setTimeout(() => setScanned(false), 300);
              }}
            >
              <X size={22} color={colors.textSoft} />
            </Pressable>

            <Text style={[styles.confirmationTitle, { color: colors.text }]}>Item added to cart</Text>

            <View style={[styles.itemDetails, { backgroundColor: colors.cardAlt }]}> 
              <Text style={[styles.itemName, { color: colors.text }]}>{lastScannedItem?.name}</Text>
              <Text style={[styles.itemPrice, { color: colors.primary }]}>₹{lastScannedItem?.price}</Text>
            </View>

            <View style={styles.confirmationButtons}>
              <Pressable style={[styles.secondaryAction, { borderColor: colors.border, backgroundColor: colors.cardAlt }]} onPress={handleScanMore}>
                <Text style={[styles.secondaryActionText, { color: colors.text }]}>Scan More</Text>
              </Pressable>

              <Pressable style={[styles.primaryAction, { backgroundColor: colors.primary }]} onPress={handleGoToCart}>
                <Text style={styles.primaryActionText}>Go To Cart</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </Screen>
  );
}

const styles = StyleSheet.create({
  permissionWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.screenX,
  },
  permissionTitle: {
    fontSize: 22,
    fontWeight: '800',
    textAlign: 'center',
  },
  permissionText: {
    marginTop: 8,
    marginBottom: 18,
    fontSize: 14,
    lineHeight: 21,
    textAlign: 'center',
  },
  headerShell: {
    paddingHorizontal: spacing.screenX,
    paddingTop: spacing.screenY,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerCopy: {
    flex: 1,
    marginRight: 12,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '800',
  },
  headerSubtitle: {
    marginTop: 6,
    fontSize: 14,
    lineHeight: 20,
  },
  cartButton: {
    width: 54,
    height: 54,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -4,
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    paddingHorizontal: 5,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ef4444',
  },
  badgeText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '800',
  },
  stage: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: spacing.screenX,
    paddingVertical: spacing.screenY,
  },
  scanShell: {
    borderRadius: 30,
    padding: 16,
  },
  scanBox: {
    width: '100%',
    aspectRatio: 1.22,
    borderRadius: 24,
    overflow: 'hidden',
    backgroundColor: '#000000',
  },
  frameOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 18,
    paddingVertical: 26,
  },
  frameWindow: {
    width: '100%',
    height: '38%',
    minHeight: 120,
    borderRadius: 22,
    borderWidth: 1.5,
    position: 'relative',
    overflow: 'hidden',
  },
  corner: {
    position: 'absolute',
    width: 28,
    height: 28,
    borderWidth: 4,
  },
  cornerTopLeft: {
    top: 0,
    left: 0,
    borderRightWidth: 0,
    borderBottomWidth: 0,
    borderTopLeftRadius: 20,
  },
  cornerTopRight: {
    top: 0,
    right: 0,
    borderLeftWidth: 0,
    borderBottomWidth: 0,
    borderTopRightRadius: 20,
  },
  cornerBottomLeft: {
    left: 0,
    bottom: 0,
    borderRightWidth: 0,
    borderTopWidth: 0,
    borderBottomLeftRadius: 20,
  },
  cornerBottomRight: {
    right: 0,
    bottom: 0,
    borderLeftWidth: 0,
    borderTopWidth: 0,
    borderBottomRightRadius: 20,
  },
  scanLine: {
    position: 'absolute',
    left: '6%',
    right: '6%',
    top: 0,
    height: 4,
    borderRadius: 999,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 12,
    elevation: 10,
  },
  bottomStack: {
    paddingHorizontal: spacing.screenX,
    paddingBottom: 18,
  },
  devButton: {
    borderWidth: 1,
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 12,
  },
  devButtonText: {
    fontSize: 14,
    fontWeight: '700',
  },
  instructionsTitle: {
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 8,
  },
  instructionsText: {
    fontSize: 14,
    lineHeight: 21,
    marginTop: 4,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  confirmationCard: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderWidth: 1,
    paddingHorizontal: 18,
    paddingTop: 14,
    paddingBottom: 24,
  },
  closeButton: {
    alignSelf: 'flex-end',
    padding: 4,
  },
  confirmationTitle: {
    textAlign: 'center',
    fontSize: 20,
    fontWeight: '800',
    marginTop: 10,
  },
  itemDetails: {
    borderRadius: 18,
    padding: 16,
    marginTop: 16,
    alignItems: 'center',
  },
  itemName: {
    fontSize: 16,
    fontWeight: '800',
    textAlign: 'center',
  },
  itemPrice: {
    marginTop: 6,
    fontSize: 18,
    fontWeight: '800',
  },
  confirmationButtons: {
    marginTop: 16,
    gap: 10,
  },
  secondaryAction: {
    borderWidth: 1,
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: 'center',
  },
  secondaryActionText: {
    fontSize: 14,
    fontWeight: '700',
  },
  primaryAction: {
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: 'center',
  },
  primaryActionText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '800',
  },
});