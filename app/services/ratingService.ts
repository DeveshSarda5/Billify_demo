/**
 * Store rating service
 * Manages ratings stored in AsyncStorage
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

export interface StoreRating {
  storeId: string;
  ratings: number[]; // Array of star ratings (1-5)
}

const RATINGS_KEY = '@billify_store_ratings';

/**
 * Add a rating for a store
 */
export const addStoreRating = async (storeId: string, rating: number): Promise<void> => {
  try {
    if (rating < 1 || rating > 5) {
      throw new Error('Rating must be between 1 and 5');
    }

    const ratingsJSON = await AsyncStorage.getItem(RATINGS_KEY);
    const ratings = ratingsJSON ? JSON.parse(ratingsJSON) : {};

    if (!ratings[storeId]) {
      ratings[storeId] = [];
    }

    ratings[storeId].push(rating);
    await AsyncStorage.setItem(RATINGS_KEY, JSON.stringify(ratings));
  } catch (error) {
    console.error('Error adding rating:', error);
    throw error;
  }
};

/**
 * Get average rating for a store
 */
export const getStoreRating = async (storeId: string): Promise<number> => {
  try {
    const ratingsJSON = await AsyncStorage.getItem(RATINGS_KEY);
    if (!ratingsJSON) return 0;

    const ratings = JSON.parse(ratingsJSON);
    const storeRatings = ratings[storeId] || [];

    if (storeRatings.length === 0) return 0;

    const sum = storeRatings.reduce((acc: number, rating: number) => acc + rating, 0);
    return Math.round((sum / storeRatings.length) * 10) / 10; // Round to 1 decimal place
  } catch (error) {
    console.error('Error getting rating:', error);
    return 0;
  }
};

/**
 * Get all store ratings
 */
export const getAllStoreRatings = async (): Promise<{ [key: string]: number }> => {
  try {
    const ratingsJSON = await AsyncStorage.getItem(RATINGS_KEY);
    if (!ratingsJSON) return {};

    const ratings = JSON.parse(ratingsJSON);
    const averages: { [key: string]: number } = {};

    for (const [storeId, storeRatings] of Object.entries(ratings) as [string, number[]][]) {
      if (storeRatings.length > 0) {
        const sum = storeRatings.reduce((acc, rating) => acc + rating, 0);
        averages[storeId] = Math.round((sum / storeRatings.length) * 10) / 10;
      }
    }

    return averages;
  } catch (error) {
    console.error('Error getting ratings:', error);
    return {};
  }
};

/**
 * Get count of ratings for a store
 */
export const getStoreRatingCount = async (storeId: string): Promise<number> => {
  try {
    const ratingsJSON = await AsyncStorage.getItem(RATINGS_KEY);
    if (!ratingsJSON) return 0;

    const ratings = JSON.parse(ratingsJSON);
    return (ratings[storeId] || []).length;
  } catch (error) {
    console.error('Error getting rating count:', error);
    return 0;
  }
};

/**
 * Clear all ratings (for testing)
 */
export const clearAllRatings = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(RATINGS_KEY);
  } catch (error) {
    console.error('Error clearing ratings:', error);
    throw error;
  }
};
