import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';

/**
 * Centralized API Configuration
 * This file consolidates all API-related configuration and utilities
 */

const constantsData = Constants as any;

function normalizeApiBaseUrl(value?: string | null) {
  const trimmed = value?.trim();
  return trimmed ? trimmed.replace(/\/+$/, '') : null;
}

function getUrlHostname(value: string) {
  try {
    return new URL(value).hostname.toLowerCase();
  } catch {
    return '';
  }
}

function isPrivateIpHostname(hostname: string) {
  return (
    hostname.startsWith('10.') ||
    hostname.startsWith('192.168.') ||
    /^172\.(1[6-9]|2\d|3[0-1])\./.test(hostname)
  );
}

function shouldUseDerivedLocalFallback(configuredUrl: string | null) {
  if (!configuredUrl) {
    return true;
  }

  const hostname = getUrlHostname(configuredUrl);
  if (!hostname) {
    return false;
  }

  return (
    hostname === 'localhost' ||
    hostname === '127.0.0.1' ||
    hostname === '0.0.0.0' ||
    hostname.endsWith('.local') ||
    hostname.includes('ngrok') ||
    isPrivateIpHostname(hostname)
  );
}

function getDerivedExpoApiBaseUrl() {
  const hostCandidates = [
    constantsData.expoGoConfig?.debuggerHost,
    constantsData.manifest2?.extra?.expoClient?.debuggerHost,
    constantsData.manifest2?.extra?.expoClient?.hostUri,
    constantsData.expoConfig?.hostUri,
  ];

  const rawHost = hostCandidates.find(
    (candidate: unknown) => typeof candidate === 'string' && candidate.trim().length > 0,
  );

  if (!rawHost || typeof rawHost !== 'string') {
    return null;
  }

  const normalizedHost = rawHost.replace(/^https?:\/\//, '').split(':')[0]?.trim();
  if (!normalizedHost) {
    return null;
  }

  return `http://${normalizedHost}:5000/api`;
}

const configuredApiBaseUrl = normalizeApiBaseUrl(process.env.EXPO_PUBLIC_API_BASE_URL);
const derivedExpoApiBaseUrl = normalizeApiBaseUrl(getDerivedExpoApiBaseUrl());
const apiBaseUrlCandidates = Array.from(
  new Set(
    [
      configuredApiBaseUrl,
      shouldUseDerivedLocalFallback(configuredApiBaseUrl) ? derivedExpoApiBaseUrl : null,
    ].filter(Boolean) as string[],
  ),
);

if (apiBaseUrlCandidates.length === 0) {
  throw new Error(
    'Missing EXPO_PUBLIC_API_BASE_URL and could not derive a local Expo host. Set .env.development to your backend URL ending with /api.',
  );
}

let activeApiBaseUrl = apiBaseUrlCandidates[0];

export const API_BASE_URL = activeApiBaseUrl;

export function getApiBaseUrl() {
  return activeApiBaseUrl;
}

function setActiveApiBaseUrl(url: string) {
  if (activeApiBaseUrl === url) {
    return;
  }

  activeApiBaseUrl = url;
  apiLogger.info('Switched API base URL', { activeApiBaseUrl, apiBaseUrlCandidates });
}

console.log('[API] Base URL candidates:', apiBaseUrlCandidates);
console.log('[API] Active Base URL:', activeApiBaseUrl);

// Disable verbose per-request logging (major perf hit on RN bridge)
export const DEBUG_MODE = false;

function shouldRetryWithFallback(status: number, baseUrl: string) {
  return status === 404 && /ngrok/i.test(baseUrl);
}

const FETCH_TIMEOUT_MS = 30000;

function fetchWithTimeout(url: string, options: RequestInit, timeoutMs = FETCH_TIMEOUT_MS): Promise<Response> {
  return new Promise((resolve, reject) => {
    const controller = new AbortController();
    const timer = setTimeout(() => {
      controller.abort();
      reject(new TypeError(`Request timed out after ${timeoutMs}ms: ${url}`));
    }, timeoutMs);

    fetch(url, { ...options, signal: controller.signal })
      .then(resolve, reject)
      .finally(() => clearTimeout(timer));
  });
}

async function clearStoredAuthSession(reason: string) {
  try {
    await AsyncStorage.multiRemove(['token', 'user']);
  } catch (error) {
    apiLogger.warn('Failed clearing stored auth session', {
      reason,
      error: error instanceof Error ? error.message : String(error),
    });
  } finally {
    setCachedToken(null);
  }
}

function isUnauthorizedTokenError(error: unknown) {
  const status = typeof error === 'object' && error && 'status' in error
    ? Number((error as { status?: number }).status)
    : undefined;
  const message = error instanceof Error ? error.message : String(error);

  return status === 401 && /token failed|no token|jwt/i.test(message);
}

async function performApiRequest<T>(
  baseUrl: string,
  endpoint: string,
  fetchOptions: RequestInit,
  includeAuth: boolean,
): Promise<T> {
  const url = `${baseUrl}${endpoint}`;

  const headers = await getApiHeaders(includeAuth);
  const mergedHeaders: Record<string, string> = { ...headers };
  if (fetchOptions.headers) {
    const extra = fetchOptions.headers as Record<string, string>;
    Object.assign(mergedHeaders, extra);
  }
  console.log(`[API] ${fetchOptions.method || 'GET'} ${url}`, 'Auth:', mergedHeaders['Authorization'] ? 'present' : 'missing');
  const response = await fetchWithTimeout(url, {
    ...fetchOptions,
    headers: mergedHeaders,
  });

  if (!response.ok) {
    let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
    try {
      const errorData = await response.json();
      errorMessage = errorData.message || errorMessage;
    } catch {
      // Response is not JSON, use default error message
    }

    const requestError = new Error(errorMessage) as Error & { status?: number; url?: string };
    requestError.status = response.status;
    requestError.url = url;
    throw requestError;
  }

  setActiveApiBaseUrl(baseUrl);
  return response.json();
}

async function tryApiBaseUrls<T>(
  endpoint: string,
  fetchOptions: RequestInit,
  includeAuth: boolean,
): Promise<T> {
  // Fast-path: try the currently active URL first (skip stale candidates)
  if (activeApiBaseUrl) {
    try {
      return await performApiRequest<T>(activeApiBaseUrl, endpoint, fetchOptions, includeAuth);
    } catch (error) {
      const status = typeof error === 'object' && error && 'status' in error
        ? Number((error as { status?: number }).status)
        : undefined;
      // Only fall through to other candidates on network-level errors
      if (!(error instanceof TypeError) && !shouldRetryWithFallback(status || 0, activeApiBaseUrl)) {
        throw error;
      }
    }
  }

  let lastError: unknown;
  for (const baseUrl of apiBaseUrlCandidates) {
    if (baseUrl === activeApiBaseUrl) continue; // already tried
    try {
      return await performApiRequest<T>(baseUrl, endpoint, fetchOptions, includeAuth);
    } catch (error) {
      lastError = error;
      const status = typeof error === 'object' && error && 'status' in error
        ? Number((error as { status?: number }).status)
        : undefined;
      const isLastCandidate = baseUrl === apiBaseUrlCandidates[apiBaseUrlCandidates.length - 1];
      if (!isLastCandidate && (error instanceof TypeError || shouldRetryWithFallback(status || 0, baseUrl))) {
        continue;
      }
      throw error;
    }
  }

  throw lastError instanceof Error ? lastError : new Error('API request failed');
}

/**
 * Log helper for API debugging
 */
export const apiLogger = {
  debug: (message: string, data?: any) => {
    if (DEBUG_MODE) {
      console.log(`[API Debug] ${message}`, data || '');
    }
  },
  error: (message: string, error?: any) => {
    console.error(`[API Error] ${message}`, error || '');
  },
  warn: (message: string, data?: any) => {
    console.warn(`[API Warning] ${message}`, data || '');
  },
  info: (message: string, data?: any) => {
    console.info(`[API Info] ${message}`, data || '');
  },
};

// In-memory token cache to avoid async bridge calls on every request
// Use `undefined` to mean "not yet resolved" vs `null` for "no token"
let _cachedToken: string | null | undefined = undefined;

export function setCachedToken(token: string | null) {
  _cachedToken = token ?? null;
  console.log('[API] setCachedToken:', token ? `${token.substring(0, 20)}...` : 'null');
}

async function resolveToken(): Promise<string | null> {
  // Already resolved (either a token string or explicit null)
  if (_cachedToken !== undefined) {
    console.log('[API] resolveToken (cached):', _cachedToken ? 'present' : 'null');
    return _cachedToken;
  }
  try {
    const stored = await AsyncStorage.getItem('token');
    _cachedToken = stored ?? null;
    console.log('[API] resolveToken (AsyncStorage):', _cachedToken ? 'present' : 'null');
  } catch {
    _cachedToken = null;
    console.log('[API] resolveToken: AsyncStorage read failed');
  }
  return _cachedToken;
}

/**
 * Get headers for API requests
 * Includes Authorization Bearer token if user is authenticated
 */
export async function getApiHeaders(includeAuth = true): Promise<Record<string, string>> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (includeAuth) {
    const token = await resolveToken();
    console.log('TOKEN:', token);
    if (token && token.trim().length > 0) {
      headers['Authorization'] = `Bearer ${token}`;
    } else {
      console.warn('[API] No auth token available for authenticated request');
    }
  }

  return headers;
}

/**
 * Make an HTTP request with proper error handling and logging
 */
export async function apiRequest<T>(
  endpoint: string,
  options: RequestInit & { includeAuth?: boolean } = {},
): Promise<T> {
  const { includeAuth = true, ...fetchOptions } = options;

  try {
    return await tryApiBaseUrls<T>(endpoint, fetchOptions, includeAuth);
  } catch (error) {
    if (includeAuth && isUnauthorizedTokenError(error)) {
      await clearStoredAuthSession(
        error instanceof Error ? error.message : 'Unauthorized token error',
      );
    }

    if (error instanceof TypeError) {
      const errorMsg = error.message || 'Unknown network error';
      apiLogger.error(
        'Network request failed - Backend might be unreachable',
        {
          endpoint,
          error: errorMsg,
          baseURL: getApiBaseUrl(),
          apiBaseUrlCandidates,
          timeoutMs: FETCH_TIMEOUT_MS,
        },
      );
      throw new Error(
        `Network Error: Cannot reach backend. Tried: ${apiBaseUrlCandidates.join(', ')}. Make sure:\n1. Backend server is running\n2. EXPO_PUBLIC_API_BASE_URL points to your active backend URL\n3. Hosted backends may need extra cold-start time\n\nError: ${errorMsg}`,
      );
    }

    if (error instanceof Error && error.message.includes('Network Error')) {
      throw error;
    }

    apiLogger.error('API request failed', {
      endpoint,
      baseURL: getApiBaseUrl(),
      error: error instanceof Error ? error.message : String(error),
    });

    throw error;
  }
}

/**
 * Test backend connectivity
 * Call this to verify backend is reachable
 */
export async function testBackendConnection(): Promise<boolean> {
  apiLogger.info('Testing backend connectivity...', { apiBaseUrlCandidates });

  for (const baseUrl of apiBaseUrlCandidates) {
    try {
      const testUrl = `${baseUrl.replace('/api', '')}/api/test`;
      apiLogger.debug('Test URL:', testUrl);

      const response = await fetch(testUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setActiveApiBaseUrl(baseUrl);
        apiLogger.info('Backend is reachable!', { baseUrl, data });
        return true;
      }

      apiLogger.warn('Backend test failed with status', {
        baseUrl,
        status: response.status,
      });
    } catch (error) {
      apiLogger.warn('Backend connection test failed for candidate', {
        baseUrl,
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  apiLogger.error('Backend connection test failed', {
    apiBaseUrlCandidates,
    baseURL: getApiBaseUrl(),
  });
  return false;
}

/**
 * POST request helper
 */
export async function apiPost<T>(
  endpoint: string,
  data?: any,
  includeAuth?: boolean,
): Promise<T> {
  return apiRequest<T>(endpoint, {
    method: 'POST',
    includeAuth: includeAuth ?? true,
    body: data ? JSON.stringify(data) : undefined,
  });
}

/**
 * GET request helper
 */
export async function apiGet<T>(
  endpoint: string,
  includeAuth?: boolean,
): Promise<T> {
  return apiRequest<T>(endpoint, {
    method: 'GET',
    includeAuth: includeAuth ?? true,
  });
}

/**
 * PUT request helper
 */
export async function apiPut<T>(
  endpoint: string,
  data?: any,
  includeAuth?: boolean,
): Promise<T> {
  return apiRequest<T>(endpoint, {
    method: 'PUT',
    includeAuth: includeAuth ?? true,
    body: data ? JSON.stringify(data) : undefined,
  });
}

/**
 * DELETE request helper
 */
export async function apiDelete<T>(
  endpoint: string,
  includeAuth?: boolean,
): Promise<T> {
  return apiRequest<T>(endpoint, {
    method: 'DELETE',
    includeAuth: includeAuth ?? true,
  });
}
