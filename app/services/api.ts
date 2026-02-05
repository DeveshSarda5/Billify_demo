import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

const BASE_URL = 'http://192.168.137.68:5000/api'; // 👈 laptop IP (updated)

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

    async updateProfile(data: { name?: string; phone?: string; location?: string }) {
        const response = await fetch(`${BASE_URL}/auth/profile`, {
            method: 'PUT',
            headers: await getHeaders(),
            body: JSON.stringify(data),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Update failed');
        }

        return response.json();
    },

    async changePassword(data: { currentPassword: string; newPassword: string }) {
        const response = await fetch(`${BASE_URL}/auth/password`, {
            method: 'PUT',
            headers: await getHeaders(),
            body: JSON.stringify(data),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Password change failed');
        }

        return response.json();
    },
};

// Payment API
export const paymentAPI = {
    async createOrder(amount: number) {
        const response = await fetch(`${BASE_URL}/payments/create-order`, {
            method: 'POST',
            headers: await getHeaders(),
            body: JSON.stringify({ amount }),
        });

        if (!response.ok) {
            throw new Error('Failed to create payment order');
        }

        return response.json();
    },

    async verifyPayment(data: { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string; amount: number }) {
        const response = await fetch(`${BASE_URL}/payments/verify`, {
            method: 'POST',
            headers: await getHeaders(),
            body: JSON.stringify(data),
        });

        if (!response.ok) {
            throw new Error('Payment verification failed');
        }

        return response.json();
    },
};

// Support API
export const supportAPI = {
    async createTicket(data: { subject: string; message: string }) {
        const response = await fetch(`${BASE_URL}/support`, {
            method: 'POST',
            headers: await getHeaders(),
            body: JSON.stringify(data),
        });

        if (!response.ok) {
            throw new Error('Failed to submit ticket');
        }

        return response.json();
    },

    async getMyTickets() {
        const response = await fetch(`${BASE_URL}/support/my`, {
            method: 'GET',
            headers: await getHeaders(),
        });

        if (!response.ok) {
            throw new Error('Failed to fetch tickets');
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

    async deleteBill(id: string) {
        const response = await fetch(`${BASE_URL}/bills/${id}`, {
            method: 'DELETE',
            headers: await getHeaders(),
        });

        if (!response.ok) {
            throw new Error('Failed to delete bill');
        }

        return response.json();
    },
};
