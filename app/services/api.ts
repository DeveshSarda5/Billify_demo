import { apiGet, apiPost, apiPut, apiDelete, apiLogger } from '../config/apiConfig';

// Type definitions for API responses
export type User = {
    id: string;
    name: string;
    email: string;
    phone: string;
    location?: string;
};

export type AuthResponse = {
    token: string;
    user: User;
};

export type ProfileResponse = {
    token: string;
    user: {
        id: string;
        name: string;
        email: string;
        phone: string;
        location?: string;
    };
};

export type PaymentOrderResponse = {
    id: string;
    order_id: string;
    amount: number;
    currency: string;
};

export type SupportTicketResponse = {
    id: string;
    subject: string;
    message: string;
    status: string;
    createdAt: string;
};

export type ProductResponse = {
    id: string;
    barcode: string;
    name: string;
    price: number;
    quantity: number;
};

export type BillResponse = {
    id: string;
    _id?: string;
    items: Array<{
        productId: string;
        name: string;
        price: number;
        quantity: number;
    }>;
    subtotal: number;
    tax: number;
    totalAmount: number;
    paymentStatus: 'pending' | 'paid';
    status?: 'pending' | 'paid' | 'verified';
    exitPass?: string | null;
    verifiedAt?: string;
    verifiedStoreName?: string;
    verifiedDistance?: number;
    createdAt: string;
};

// Auth API
export const authAPI = {
    async signup(data: { name: string; email: string; phone: string; password: string }) {
        try {
            return await apiPost<AuthResponse>('/auth/signup', data, false);
        } catch (error) {
            apiLogger.error('Signup failed', error);
            throw error;
        }
    },

    async login(data: { email: string; password: string }) {
        try {
            return await apiPost<AuthResponse>('/auth/login', data, false);
        } catch (error) {
            apiLogger.error('Login failed', error);
            throw error;
        }
    },

    async verifyEmail(token: string) {
        try {
            return await apiPost('/auth/verify-email', { token }, false);
        } catch (error) {
            apiLogger.error('Email verification failed', error);
            throw error;
        }
    },

    async resendVerificationEmail(email: string) {
        try {
            return await apiPost('/auth/resend-verification', { email }, false);
        } catch (error) {
            apiLogger.error('Failed to resend verification email', error);
            throw error;
        }
    },

    async updateProfile(data: { name?: string; phone?: string; location?: string }) {
        try {
            return await apiPut<ProfileResponse>('/auth/profile', data);
        } catch (error) {
            apiLogger.error('Profile update failed', error);
            throw error;
        }
    },

    async getMe() {
        try {
            return await apiGet<User>('/auth/me');
        } catch (error) {
            apiLogger.error('Failed to fetch profile', error);
            throw error;
        }
    },

    async changePassword(data: { currentPassword: string; newPassword: string }) {
        try {
            return await apiPut<{ message: string }>('/auth/password', data);
        } catch (error) {
            apiLogger.error('Password change failed', error);
            throw error;
        }
    },
};

// Payment API
export const paymentAPI = {
    async createOrder(amount: number) {
        try {
            return await apiPost<PaymentOrderResponse>('/payments/create-order', { amount });
        } catch (error) {
            apiLogger.error('Payment order creation failed', error);
            throw error;
        }
    },

    async verifyPayment(data: { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string; amount: number }) {
        try {
            return await apiPost<{ verified: boolean; message: string }>('/payments/verify', data);
        } catch (error) {
            apiLogger.error('Payment verification failed', error);
            throw error;
        }
    },

    async verifyBill(data: { billId: string; userLatitude: number; userLongitude: number }) {
        try {
            return await apiPost<{ success: boolean; message: string; nearestStoreName: string; distanceInMeters: number }>('/payments/verify-bill', data);
        } catch (error) {
            apiLogger.error('Bill verification failed', error);
            throw error;
        }
    },
};

// Support API
export const supportAPI = {
    async createTicket(data: { title: string; description: string; category: string }) {
        try {
            return await apiPost('/support', data);
        } catch (error) {
            apiLogger.error('Support ticket creation failed', error);
            throw error;
        }
    },

    async getMyTickets() {
        try {
            return await apiGet('/support/my');
        } catch (error) {
            apiLogger.error('Failed to fetch tickets', error);
            throw error;
        }
    },

    async getTicket(ticketId: string) {
        try {
            return await apiGet(`/support/${ticketId}`);
        } catch (error) {
            apiLogger.error('Failed to fetch ticket', error);
            throw error;
        }
    },

    async closeTicket(ticketId: string) {
        try {
            return await apiPut(`/support/${ticketId}/close`, {});
        } catch (error) {
            apiLogger.error('Failed to close ticket', error);
            throw error;
        }
    },
};

// Products API
export const productsAPI = {
    async getProductByBarcode(barcode: string) {
        try {
            return await apiGet<ProductResponse>(`/products/${barcode}`);
        } catch (error) {
            apiLogger.error(`Failed to fetch product with barcode: ${barcode}`, error);
            throw error;
        }
    },
};

// Bills API
export const billsAPI = {
    async createBill(data: { items: Array<{ productId: string; name: string; price: number; quantity: number }> }) {
        try {
            return await apiPost<BillResponse>('/bills/create', data);
        } catch (error) {
            apiLogger.error('Bill creation failed', error);
            throw error;
        }
    },

    async getMyBills() {
        try {
            return await apiGet<BillResponse[]>('/bills/my');
        } catch (error) {
            apiLogger.error('Failed to fetch bills', error);
            throw error;
        }
    },

    async deleteBill(id: string) {
        try {
            return await apiDelete<{ message: string }>(`/bills/${id}`);
        } catch (error) {
            apiLogger.error(`Failed to delete bill with ID: ${id}`, error);
            throw error;
        }
    },
};
