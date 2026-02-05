declare module 'react-native-razorpay' {
    export interface RazorpayOptions {
        description?: string;
        image?: string;
        currency?: string;
        key: string;
        amount: string | number;
        name?: string;
        order_id?: string;
        prefill?: {
            email?: string;
            contact?: string;
            name?: string;
        };
        theme?: {
            color?: string;
        };
    }

    export interface RazorpaySuccessData {
        razorpay_payment_id: string;
        razorpay_order_id: string;
        razorpay_signature: string;
    }

    export interface RazorpayErrorData {
        code: number;
        description: string;
        source: string;
        step: string;
        reason: string;
        metadata: any;
    }

    const RazorpayCheckout: {
        open(options: RazorpayOptions): Promise<RazorpaySuccessData>;
        onExternalWalletSelection(callback: (data: any) => void): void;
    };

    export default RazorpayCheckout;
}
