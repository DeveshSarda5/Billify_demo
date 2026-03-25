/**
 * LocationSelector - Modal component for manual location selection
 * Provides fallback location selection for demo purposes
 */

import { View, Text, StyleSheet, Pressable, Modal, FlatList } from 'react-native';
import { useState } from 'react';
import { ChevronRight } from 'lucide-react-native';
import { getAllStores } from '../utils/locationUtils';
import { useLocation } from '../context/LocationContext';

interface LocationSelectorProps {
  visible: boolean;
  onClose: () => void;
}

export default function LocationSelector({ visible, onClose }: LocationSelectorProps) {
  const { setCurrentStore, currentStore } = useLocation();
  const stores = getAllStores();

  const handleSelectStore = (storeId: string, storeName: string) => {
    setCurrentStore({
      id: storeId,
      name: storeName,
    });
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modal}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Select Location</Text>
            <Pressable onPress={onClose}>
              <Text style={styles.closeBtn}>x</Text>
            </Pressable>
          </View>

          {/* Store List */}
          <FlatList
            data={stores}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContent}
            renderItem={({ item }) => (
              <Pressable
                style={[
                  styles.storeCard,
                  currentStore?.id === item.id && styles.selectedCard,
                ]}
                onPress={() => handleSelectStore(item.id, item.name)}
              >
                <View style={styles.storeInfo}>
                  <Text style={styles.storeName}>{item.name}</Text>
                  <Text style={styles.storeCoords}>
                    {item.latitude.toFixed(4)}, {item.longitude.toFixed(4)}
                  </Text>
                  <Text style={styles.storeRadius}>Radius: {item.radius}m</Text>
                </View>
                <ChevronRight
                  size={20}
                  color={currentStore?.id === item.id ? '#4caf50' : '#ccc'}
                />
              </Pressable>
            )}
          />

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>
              Select a location for demo purposes. Automatic detection will resume on app restart.
            </Text>
            <Pressable style={styles.closeButton} onPress={onClose}>
              <Text style={styles.closeButtonText}>Close</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modal: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    maxHeight: '80%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
  },
  closeBtn: {
    fontSize: 24,
    color: '#9ca3af',
  },
  listContent: {
    padding: 12,
  },
  storeCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 12,
    marginVertical: 6,
    borderRadius: 8,
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  selectedCard: {
    backgroundColor: '#ecfdf5',
    borderColor: '#4caf50',
  },
  storeInfo: {
    flex: 1,
  },
  storeName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },
  storeCoords: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 2,
  },
  storeRadius: {
    fontSize: 12,
    color: '#9ca3af',
  },
  footer: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  footerText: {
    fontSize: 13,
    color: '#6b7280',
    lineHeight: 18,
    marginBottom: 12,
  },
  closeButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    backgroundColor: '#4caf50',
    borderRadius: 6,
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
});
