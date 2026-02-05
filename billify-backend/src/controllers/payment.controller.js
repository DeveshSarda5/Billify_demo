const Razorpay = require('razorpay');
const crypto = require('crypto');
const Payment = require('../models/Payment');

// Initialize Razorpay
// Note: In production, these keys should be in .env
const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_placeholder',
    key_secret: process.env.RAZORPAY_KEY_SECRET || 'secret_placeholder'
});

// @desc    Create Razorpay Order
// @route   POST /api/payments/create-order
// @access  Private
exports.createOrder = async (req, res) => {
    try {
        const { amount } = req.body;

        const options = {
            amount: amount * 100, // Amount in paise
            currency: 'INR',
            receipt: `receipt_${Date.now()}`,
        };

        const order = await razorpay.orders.create(options);

        res.json({
            success: true,
            order,
        });
    } catch (error) {
        console.error('Razorpay Order Error:', error);
        res.status(500).json({ message: error.message || 'Error creating payment order', details: error });
    }
};

// @desc    Verify Payment Signature
// @route   POST /api/payments/verify
// @access  Private
exports.verifyPayment = async (req, res) => {
    try {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature, amount } = req.body;

        // Construct the expected signature
        const body = razorpay_order_id + '|' + razorpay_payment_id;

        // Use the same key_secret as initialization
        const expectedSignature = crypto
            .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET || 'secret_placeholder')
            .update(body.toString())
            .digest('hex');

        if (expectedSignature === razorpay_signature) {
            // Payment is valid, save to DB
            const payment = new Payment({
                user: req.user._id,
                orderId: razorpay_order_id,
                paymentId: razorpay_payment_id,
                signature: razorpay_signature,
                amount: amount,
                status: 'completed',
                method: 'razorpay'
            });

            await payment.save();

            res.json({ success: true, message: 'Payment verified successfully' });
        } else {
            res.status(400).json({ success: false, message: 'Invalid payment signature' });
        }
    } catch (error) {
        console.error('Payment Verification Error:', error);
        res.status(500).json({ message: 'Error verifying payment' });
    }
};
