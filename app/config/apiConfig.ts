import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Centralized API Configuration
 * This file consolidates all API-related configuration and utilities
 */

// ============================================================================
// API BASE URL - CRITICAL: Update this IP when backend location changes
// ============================================================================
export const API_BASE_URL = 'http://192.168.1.9:5000/api';

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
    apiLogger.debug(`Starting ${fetchOptions.method || 'GET'} request`, url);

    const headers = await getApiHeaders(includeAuth);
    const response = await fetch(url, {
      ...fetchOptions,
      headers: {
        ...headers,
        ...fetchOptions.headers,
      },
    });

    apiLogger.debug(`Response received`, {
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
      apiLogger.error(
        'Network request failed - Backend might be unreachable',
        {
          url,
          endpoint,
          error: error.message,
        },
      );
      throw new Error(
        `Network Error: ${error.message}. Backend at ${API_BASE_URL} may be unreachable.`,
      );
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
