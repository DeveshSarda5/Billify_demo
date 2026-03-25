import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Centralized API Configuration
 * This file consolidates all API-related configuration and utilities
 */

const envApiBaseUrl = process.env.EXPO_PUBLIC_API_BASE_URL?.trim();

if (!envApiBaseUrl) {
  throw new Error(
    'Missing EXPO_PUBLIC_API_BASE_URL. Set it in your Expo environment (e.g. .env.development) to your ngrok URL ending with /api.',
  );
}

// Remove trailing slash so endpoint concatenation remains stable.
export const API_BASE_URL = envApiBaseUrl.replace(/\/+$/, '');

// Log the active URL on app startup (development only)
console.log('[API] Base URL:', API_BASE_URL);

// For development/debugging purposes
export const DEBUG_MODE = true;

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

/**
 * Get headers for API requests
 * Includes Authorization Bearer token if user is authenticated
 */
export async function getApiHeaders(includeAuth = true): Promise<HeadersInit> {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };

  if (includeAuth) {
    try {
      const token = await AsyncStorage.getItem('token');
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
        apiLogger.debug('Authorization header added', 'Token found');
      } else {
        apiLogger.debug('No token found for authorization');
      }
    } catch (error) {
      apiLogger.error('Failed to retrieve token from AsyncStorage', error);
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
  const url = `${API_BASE_URL}${endpoint}`;

  try {
    const method = fetchOptions.method || 'GET';
    apiLogger.debug(`Starting ${method} request`, url);

    const headers = await getApiHeaders(includeAuth);
    const requestStartTime = Date.now();
    
    const response = await fetch(url, {
      ...fetchOptions,
      headers: {
        ...headers,
        ...fetchOptions.headers,
      },
    });

    const responseTime = Date.now() - requestStartTime;
    apiLogger.debug(`Response received (${responseTime}ms)`, {
      status: response.status,
      statusText: response.statusText,
      url,
    });

    if (!response.ok) {
      let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorMessage;
      } catch {
        // Response is not JSON, use default error message
      }

      apiLogger.error(`Request failed with status ${response.status}`, {
        url,
        error: errorMessage,
      });

      throw new Error(errorMessage);
    }

    const responseData: T = await response.json();
    apiLogger.debug('Response parsed successfully', endpoint);
    return responseData;
  } catch (error) {
    if (error instanceof TypeError) {
      // Network error
      const errorMsg = error.message || 'Unknown network error';
      apiLogger.error(
        'Network request failed - Backend might be unreachable',
        {
          url,
          endpoint,
          error: errorMsg,
          baseURL: API_BASE_URL,
        },
      );
      throw new Error(
        `Network Error: Cannot reach backend at ${API_BASE_URL}. Make sure:\n1. Backend server is running\n2. EXPO_PUBLIC_API_BASE_URL points to your active ngrok URL\n3. ngrok tunnel is running and forwarding to port 5000\n\nError: ${errorMsg}`,
      );
    }

    if (error instanceof Error && error.message.includes('Network Error')) {
      // Re-throw our custom network errors
      throw error;
    }

    apiLogger.error('API request failed', {
      url,
      endpoint,
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
  try {
    apiLogger.info('Testing backend connectivity...');
    const testUrl = `${API_BASE_URL.replace('/api', '')}/api/test`;
    apiLogger.debug('Test URL:', testUrl);

    const response = await fetch(testUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (response.ok) {
      const data = await response.json();
      apiLogger.info('Backend is reachable!', data);
      return true;
    } else {
      apiLogger.error('Backend test failed with status', response.status);
      return false;
    }
  } catch (error) {
    apiLogger.error('Backend connection test failed', {
      error: error instanceof Error ? error.message : String(error),
      baseURL: API_BASE_URL,
    });
    return false;
  }
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
