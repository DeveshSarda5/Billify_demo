/**
 * RatingModal - Show rating prompt after successful checkout
 */

import { View, Text, StyleSheet, Pressable, Modal, ActivityIndicator } from 'react-native';
import { useState } from 'react';
import { Star } from 'lucide-react-native';
import { addStoreRating } from '../services/ratingService';

interface RatingModalProps {
  visible: boolean;
  storeId: string;
  storeName: string;
  onClose: () => void;
}

export default function RatingModal({
  visible,
  storeId,
  storeName,
  onClose,
}: RatingModalProps) {
  const [selectedRating, setSelectedRating] = useState(0);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmitRating = async () => {
    if (selectedRating === 0) return;

    setLoading(true);
    try {
      await addStoreRating(storeId, selectedRating);
      setSubmitted(true);

      // Auto close after 2 seconds
      setTimeout(() => {
        handleClose();
      }, 2000);
    } catch (error) {
      console.error('Error submitting rating:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setSelectedRating(0);
    setSubmitted(false);
    onClose();
  };

  if (submitted) {
    return (
      <Modal visible={visible} transparent animationType="fade">
        <View style={styles.overlay}>
          <View style={styles.modal}>
            <View style={styles.successContainer}>
              <Text style={styles.successIcon}>✓</Text>
              <Text style={styles.successTitle}>Thank You!</Text>
              <Text style={styles.successMessage}>
                Your rating for {storeName} has been recorded.
              </Text>
            </View>
          </View>
        </View>
      </Modal>
    );
  }

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.overlay}>
        <View style={styles.modal}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Rate your experience</Text>
            <Pressable onPress={handleClose} disabled={loading}>
              <Text style={styles.closeBtn}>✕</Text>
            </Pressable>
          </View>

          {/* Content */}
          <View style={styles.content}>
            <Text style={styles.storeName}>{storeName}</Text>

            {/* Stars */}
            <View style={styles.starsContainer}>
              {[1, 2, 3, 4, 5].map((star) => (
                <Pressable
                  key={star}
                  onPress={() => setSelectedRating(star)}
                  disabled={loading}
                  style={styles.starBtn}
                >
                  <Star
                    size={48}
                    color={star <= selectedRating ? '#fbbf24' : '#d1d5db'}
                    fill={star <= selectedRating ? '#fbbf24' : 'none'}
                  />
                </Pressable>
              ))}
            </View>

            {/* Rating Text */}
            {selectedRating > 0 && (
              <Text style={styles.ratingText}>
                {selectedRating === 1 && 'Poor'}
                {selectedRating === 2 && 'Fair'}
                {selectedRating === 3 && 'Good'}
                {selectedRating === 4 && 'Very Good'}
                {selectedRating === 5 && 'Excellent'}
              </Text>
            )}

            {/* Button */}
            <Pressable
              style={[
                styles.submitBtn,
                selectedRating === 0 && styles.disabledBtn,
              ]}
              onPress={handleSubmitRating}
              disabled={selectedRating === 0 || loading}
            >
              {loading ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.submitBtnText}>Submit Rating</Text>
              )}
            </Pressable>

            {/* Skip Button */}
            <Pressable onPress={handleClose} disabled={loading}>
              <Text style={styles.skipBtn}>Skip for now</Text>
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
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
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
  content: {
    paddingHorizontal: 16,
    paddingVertical: 24,
    alignItems: 'center',
  },
  storeName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4caf50',
    marginBottom: 24,
  },
  starsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
    marginBottom: 20,
  },
  starBtn: {
    padding: 8,
  },
  ratingText: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 24,
    textAlign: 'center',
  },
  submitBtn: {
    backgroundColor: '#4caf50',
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 12,
    width: '100%',
  },
  disabledBtn: {
    opacity: 0.5,
  },
  submitBtnText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  skipBtn: {
    fontSize: 14,
    color: '#9ca3af',
    textAlign: 'center',
  },
  successContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  successIcon: {
    fontSize: 48,
    color: '#4caf50',
    marginBottom: 12,
  },
  successTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 8,
  },
  successMessage: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    paddingHorizontal: 16,
  },
});
