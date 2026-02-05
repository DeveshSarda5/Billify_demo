import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

const BASE_URL = 'http://10.10.36.126:5000/api'; // 👈 laptop IP

async function getHeaders(includeAuth = true): Promise<HeadersInit> {
    const headers: HeadersInit = {
        'Content-Type': 'application/json',
    };

    if (includeAuth) {
        const token = await AsyncStorage.getItem('token');
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }
    }

    return headers;
}

// Auth API
export const authAPI = {
    async signup(data: { name: string; email: string; phone: string; password: string }) {
        const response = await fetch(`${BASE_URL}/auth/signup`, {
            method: 'POST',
            headers: await getHeaders(false),
            body: JSON.stringify(data),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Signup failed');
        }

        return response.json();
    },

    async login(data: { email: string; password: string }) {
        const response = await fetch(`${BASE_URL}/auth/login`, {
            method: 'POST',
            headers: await getHeaders(false),
            body: JSON.stringify(data),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Login failed');
        }

        return response.json();
    },
};

// Products API
export const productsAPI = {
    async getProductByBarcode(barcode: string) {
        const response = await fetch(`${BASE_URL}/products/${barcode}`, {
            method: 'GET',
            headers: await getHeaders(),
        });

        if (!response.ok) {
            if (response.status === 404) {
                throw new Error('Product not found');
            }
            throw new Error('Failed to fetch product');
        }

        return response.json();
    },
};

// Bills API
export const billsAPI = {
    async createBill(data: { items: Array<{ productId: string; name: string; price: number; quantity: number }> }) {
        const response = await fetch(`${BASE_URL}/bills/create`, {
            method: 'POST',
            headers: await getHeaders(),
            body: JSON.stringify(data),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to create bill');
        }

        return response.json();
    },

    async getMyBills() {
        const response = await fetch(`${BASE_URL}/bills/my`, {
            method: 'GET',
            headers: await getHeaders(),
        });

        if (!response.ok) {
            throw new Error('Failed to fetch bills');
        }

        return response.json();
    },
};
