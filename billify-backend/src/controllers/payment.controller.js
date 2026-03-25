const Razorpay = require('razorpay');
const crypto = require('crypto');
const Payment = require('../models/Payment');
const Bill = require('../models/Bill');
const STORE_LOCATIONS = require('../config/storeLocations');
const { calculateDistance } = require('../utils/distanceUtils');

const razorpayKeyId = (process.env.RAZORPAY_KEY_ID || '').trim();
const razorpayKeySecret = (process.env.RAZORPAY_KEY_SECRET || '').trim();

const razorpay = razorpayKeyId && razorpayKeySecret
    ? new Razorpay({
        key_id: razorpayKeyId,
        key_secret: razorpayKeySecret,
    })
    : null;

function getMaskedKey(keyId) {
    if (!keyId) {
        return 'missing';
    }

    return `${keyId.slice(0, 12)}...${keyId.slice(-4)}`;
}

function ensureRazorpayReady() {
    if (!razorpay || !razorpayKeyId || !razorpayKeySecret) {
        throw new Error('Razorpay keys missing in .env');
    }

    if (!razorpayKeyId.startsWith('rzp_test_')) {
        throw new Error('Razorpay test key required. Configure RAZORPAY_KEY_ID with an rzp_test_* key.');
    }
}

function escapeHtml(value) {
    return String(value)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

// @desc Create Order
exports.createOrder = async (req, res) => {
    try {
        ensureRazorpayReady();

        const { amount } = req.body;

        if (!amount || isNaN(amount) || amount <= 0) {
            return res.status(400).json({
                success: false,
                message: 'Invalid amount',
            });
        }

        const amountInPaise = Math.round(amount * 100);
        const receipt = `receipt_${Date.now()}`;

        console.log('Creating Razorpay order', {
            amountRupees: Number(amount),
            amountPaise: amountInPaise,
            currency: 'INR',
            receipt,
            keyId: razorpayKeyId,
        });

        const order = await razorpay.orders.create({
            amount: amountInPaise,
            currency: 'INR',
            receipt,
        });

        console.log('Razorpay order created', {
            orderId: order.id,
            amount: order.amount,
            currency: order.currency,
            keyId: razorpayKeyId,
        });

        res.json({
            success: true,
            id: order.id,
            order_id: order.id,
            amount: order.amount,
            currency: order.currency,
            key: razorpayKeyId,
        });

    } catch (error) {
        console.error('Razorpay order creation failed:', error);

        if (error?.statusCode === 401) {
            return res.status(502).json({
                success: false,
                message: `Razorpay authentication failed for key ${getMaskedKey(razorpayKeyId)}. Check backend .env test key pair.`,
            });
        }

        res.status(500).json({
            success: false,
            message: error.message || 'Order creation failed',
        });
    }
};

// @desc Verify Payment
exports.verifyPayment = async (req, res) => {
    try {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature, amount } = req.body;

        const key_secret = (process.env.RAZORPAY_KEY_SECRET || '').trim();

        const body = razorpay_order_id + "|" + razorpay_payment_id;

        const expectedSignature = crypto
            .createHmac("sha256", key_secret)
            .update(body)
            .digest("hex");

        if (expectedSignature === razorpay_signature) {
            const payment = new Payment({
                user: req.user._id,
                orderId: razorpay_order_id,
                paymentId: razorpay_payment_id,
                signature: razorpay_signature,
                amount,
                status: 'completed',
                method: 'razorpay'
            });

            await payment.save();

            res.json({ success: true });
        } else {
            res.status(400).json({ success: false, message: 'Invalid signature' });
        }

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Verification failed' });
    }
};

// @desc Hosted Razorpay checkout page for external browser flow
// @route GET /api/payments/checkout
// @access Public
exports.hostedCheckoutPage = async (req, res) => {
    ensureRazorpayReady();

        const {
                keyId,
                orderId,
                amount,
                currency = 'INR',
                requestId,
                callbackUrl,
                name = '',
                email = '',
                phone = '',
        } = req.query;

            const effectiveKeyId = String(keyId || razorpayKeyId);

            if (!orderId || !amount || !requestId || !callbackUrl) {
                return res.status(400).send('Missing checkout parameters');
        }

            if (keyId && String(keyId) !== razorpayKeyId) {
                console.warn('Hosted checkout received mismatched Razorpay key. Using backend test key instead.', {
                    receivedKeyId: String(keyId),
                    backendKeyId: razorpayKeyId,
                    orderId: String(orderId),
                });
            }

        const options = {
                key: effectiveKeyId,
                amount: Number(amount),
                currency: String(currency),
                name: 'Billify',
            description: 'Test Payment',
                order_id: String(orderId),
                prefill: {
                        name: String(name),
                        email: String(email),
                        contact: String(phone),
                },
            theme: { color: '#3399cc' },
        };

        console.log('Serving hosted Razorpay checkout', {
            orderId: String(orderId),
            amount: Number(amount),
            currency: String(currency),
            requestId: String(requestId),
            keyId: effectiveKeyId,
        });

        const html = `
            <!DOCTYPE html>
            <html>
                <head>
                    <meta charset="utf-8" />
                    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0" />
                    <title>Billify Payment</title>
                    <style>
                        body {
                            margin: 0;
                            min-height: 100vh;
                            display: flex;
                            align-items: center;
                            justify-content: center;
                            background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%);
                            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
                            color: #14532d;
                        }
                        .card {
                            width: calc(100% - 32px);
                            max-width: 420px;
                            background: #ffffff;
                            border-radius: 20px;
                            padding: 24px;
                            box-shadow: 0 20px 60px rgba(20, 83, 45, 0.12);
                        }
                        h1 {
                            margin: 0 0 10px;
                            font-size: 26px;
                            color: #166534;
                        }
                        p {
                            margin: 0;
                            line-height: 1.6;
                            color: #3f3f46;
                        }
                        .hint {
                            margin-top: 14px;
                            padding: 12px;
                            border-radius: 12px;
                            background: #fffbeb;
                            color: #92400e;
                            font-size: 13px;
                        }
                    </style>
                </head>
                <body>
                    <div class="card">
                        <h1>Opening secure payment</h1>
                        <p>Billify is launching Razorpay in your browser.</p>
                        <p class="hint">Use Razorpay test mode only. For card testing use 4111 1111 1111 1111, any future expiry, CVV 123, OTP 1234.</p>
                    </div>
                    <script src="https://checkout.razorpay.com/v1/checkout.js"></script>
                    <script>
                        const callbackBase = ${JSON.stringify(String(callbackUrl))};
                        const activeRequestId = ${JSON.stringify(String(requestId))};
                        const options = ${JSON.stringify(options)};

                        console.log('Billify Razorpay checkout init', {
                            key: options.key,
                            order_id: options.order_id,
                            amount: options.amount,
                            currency: options.currency,
                        });

                        function redirectToApp(status, payload) {
                            const params = new URLSearchParams({
                                status,
                                requestId: activeRequestId,
                            });

                            Object.entries(payload || {}).forEach(([key, value]) => {
                                if (value !== undefined && value !== null && value !== '') {
                                    params.set(key, String(value));
                                }
                            });

                            const separator = callbackBase.includes('?') ? '&' : '?';
                            window.location.replace(callbackBase + separator + params.toString());
                        }

                        options.handler = function (response) {
                            redirectToApp('success', response || {});
                        };

                        options.modal = {
                            ondismiss: function () {
                                redirectToApp('cancelled', { description: 'Payment was cancelled' });
                            },
                        };

                        const razorpay = new Razorpay(options);

                        razorpay.on('payment.failed', function (response) {
                            const error = response && response.error ? response.error : {};
                            redirectToApp('failed', {
                                code: error.code || '',
                                description: error.description || error.reason || 'Payment failed',
                            });
                        });

                        window.onload = function () {
                            setTimeout(function () {
                                try {
                                    razorpay.open();
                                } catch (error) {
                                    redirectToApp('failed', { description: error && error.message ? error.message : 'Could not open Razorpay checkout' });
                                }
                            }, 250);
                        };
                    </script>
                </body>
            </html>
        `;

        res.setHeader('Content-Type', 'text/html; charset=utf-8');
        res.send(html.replace('Billify', escapeHtml('Billify')));
};

// KEEP YOUR verifyBill and testDistance SAME (no change needed)

// @desc    Verify Bill at Exit Gate with GPS Location
// @route   POST /api/payments/verify-bill
// @access  Private
exports.verifyBill = async (req, res) => {
    try {
        const { billId, userLatitude, userLongitude } = req.body;

        // Validate input
        if (!billId || userLatitude === undefined || userLongitude === undefined) {
            return res.status(400).json({
                success: false,
                message: 'Bill ID and GPS coordinates required',
            });
        }

        // Get the bill
        const bill = await Bill.findById(billId);
        if (!bill) {
            return res.status(404).json({
                success: false,
                message: 'Bill not found',
            });
        }

        // Prevent QR reuse - Check if bill is already verified
        if (bill.status === 'verified') {
            return res.status(400).json({
                success: false,
                message: 'Bill already verified',
            });
        }

        // Calculate distance to all stores
        let nearestStore = null;
        let nearestDistance = Infinity;

        STORE_LOCATIONS.forEach((store) => {
            const distance = calculateDistance(
                userLatitude,
                userLongitude,
                store.latitude,
                store.longitude
            );

            // Log each store calculation
            console.log(`[Distance Calculation] ${store.name}:`, {
                userCoordinates: {
                    latitude: userLatitude,
                    longitude: userLongitude,
                },
                storeCoordinates: {
                    latitude: store.latitude,
                    longitude: store.longitude,
                },
                calculatedDistanceMeters: distance,
            });

            if (distance < nearestDistance) {
                nearestDistance = distance;
                nearestStore = store;
            }
        });

        // Check if user is within threshold of nearest store
        // 500 meters (0.5 km) is the verification radius
        const LOCATION_THRESHOLD = 500; // meters
        
        console.log(`[Verification Check] Nearest Store:`, {
            userLatitude,
            userLongitude,
            nearestStoreName: nearestStore.name,
            nearestStoreLatitude: nearestStore.latitude,
            nearestStoreLongitude: nearestStore.longitude,
            calculatedDistanceMeters: nearestDistance,
            thresholdMeters: LOCATION_THRESHOLD,
            isWithinThreshold: nearestDistance <= LOCATION_THRESHOLD,
        });

        if (nearestDistance > LOCATION_THRESHOLD) {
            console.log(`[Verification Failed] User too far from store:`, {
                userLatitude,
                userLongitude,
                nearestStore: nearestStore.name,
                distanceInMeters: nearestDistance,
                threshold: LOCATION_THRESHOLD,
                message: 'User not within 500m radius'
            });

            return res.status(400).json({
                success: false,
                message: 'User not near store location',
                nearestStoreName: nearestStore.name,
                distanceInMeters: nearestDistance,
            });
        }

        // Update bill with verification details
        bill.status = 'verified';
        bill.verifiedAt = new Date();
        bill.verifiedStoreName = nearestStore.name;
        bill.verifiedDistance = nearestDistance;

        await bill.save();

        // Log successful verification
        console.log(`[Verification Successful] Bill verified:`, {
            billId: bill._id,
            userLatitude,
            userLongitude,
            nearestStoreName: nearestStore.name,
            nearestStoreLatitude: nearestStore.latitude,
            nearestStoreLongitude: nearestStore.longitude,
            distanceInMeters: nearestDistance,
            threshold: LOCATION_THRESHOLD,
            status: 'verified',
            verifiedAt: bill.verifiedAt,
        });

        res.json({
            success: true,
            message: 'Bill verified successfully',
            bill,
            nearestStoreName: nearestStore.name,
            distanceInMeters: nearestDistance,
        });
    } catch (error) {
        console.error('Bill Verification Error:', error);
        res.status(500).json({
            success: false,
            message: 'Error verifying bill',
        });
    }
};

// @desc    Debug endpoint to test distance calculation
// @route   POST /api/payments/test-distance
// @access  Public (for testing only)
exports.testDistance = async (req, res) => {
    try {
        const { userLatitude, userLongitude } = req.body;

        if (userLatitude === undefined || userLongitude === undefined) {
            return res.status(400).json({
                success: false,
                message: 'GPS coordinates required',
            });
        }

        // Calculate distance to all stores
        const storeDistances = STORE_LOCATIONS.map((store) => {
            const distance = calculateDistance(
                userLatitude,
                userLongitude,
                store.latitude,
                store.longitude
            );
            return {
                storeName: store.name,
                storeCoords: {
                    latitude: store.latitude,
                    longitude: store.longitude,
                },
                distanceInMeters: distance,
                withinThreshold: distance <= 500,
            };
        });

        // Sort by distance
        storeDistances.sort((a, b) => a.distanceInMeters - b.distanceInMeters);

        res.json({
            success: true,
            userCoordinates: {
                latitude: userLatitude,
                longitude: userLongitude,
            },
            nearestStore: storeDistances[0],
            allStores: storeDistances,
            threshold: 500,
        });
    } catch (error) {
        console.error('Test Distance Error:', error);
        res.status(500).json({
            success: false,
            message: 'Error calculating distance',
        });
    }
};
