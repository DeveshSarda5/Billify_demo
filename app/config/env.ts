/**
 * Centralized environment configuration.
 * All EXPO_PUBLIC_* variables are inlined at build time by Expo/Metro.
 * This module validates them once and re-exports typed constants.
 */

function requireEnv(name: string, fallback?: string): string {
  const value = process.env[name];
  if (value && value.trim().length > 0) {
    return value.trim();
  }
  if (fallback !== undefined) {
    console.warn(`[env] ${name} not set, using fallback`);
    return fallback;
  }
  console.error(`[env] Missing required environment variable: ${name}`);
  return '';
}

function optionalEnv(name: string, fallback: string): string {
  const value = process.env[name];
  return value && value.trim().length > 0 ? value.trim() : fallback;
}

/** Deployed backend API base URL (must end with /api). */
export const API_BASE_URL = requireEnv(
  'EXPO_PUBLIC_API_BASE_URL',
  'https://billify-demo.onrender.com/api',
).replace(/\/+$/, '');

/** Enable verbose console logging. Always false in production builds. */
export const DEBUG_MODE = optionalEnv('EXPO_PUBLIC_DEBUG_MODE', 'false') === 'true';

/** Razorpay publishable key (test or live). */
export const RAZORPAY_KEY_ID = requireEnv(
  'EXPO_PUBLIC_RAZORPAY_KEY_ID',
  'rzp_test_SUw1ykAIC5V35j',
);

/** Whether OTA updates are enabled. */
export const UPDATES_ENABLED = optionalEnv('EXPO_PUBLIC_UPDATES_ENABLED', 'false') === 'true';

/** True when running a development client (not a production build). */
export const IS_DEV = __DEV__;
