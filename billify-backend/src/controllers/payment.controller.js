const Razorpay = require('razorpay');
const crypto = require('crypto');
const path = require('path');
const dotenv = require('dotenv');
const Payment = require('../models/Payment');
const Bill = require('../models/Bill');
const STORE_LOCATIONS = require('../config/storeLocations');
const { calculateDistance } = require('../utils/distanceUtils');

// Function to always get fresh env values
const getRazorpayInstance = () => {
    // Reload .env at request time so updated keys are picked up without process restarts.
    dotenv.config({ path: path.resolve(__dirname, '../../.env'), override: true });

    const key_id = (process.env.RAZORPAY_KEY_ID || '').trim();
    const key_secret = (process.env.RAZORPAY_KEY_SECRET || '').trim();

    const maskedKey = key_id ? `${key_id.slice(0, 10)}...${key_id.slice(-4)}` : '❌ Missing';
    console.log("🔑 Razorpay Key:", maskedKey);
    console.log("🔐 Secret Loaded:", key_secret ? "✅ Yes" : "❌ No");

    if (!key_id || !key_secret) {
        throw new Error('Razorpay keys missing in .env');
    }

    return new Razorpay({ key_id, key_secret });
};

// @desc Create Order
exports.createOrder = async (req, res) => {
    try {
        const razorpay = getRazorpayInstance(); // ✅ fresh instance

        const { amount } = req.body;

        if (!amount || isNaN(amount) || amount <= 0) {
            return res.status(400).json({
                success: false,
                message: 'Invalid amount',
            });
        }

        const amountInPaise = Math.round(amount * 100);

        const order = await razorpay.orders.create({
            amount: amountInPaise,
            currency: 'INR',
            receipt: `receipt_${Date.now()}`,
        });

        console.log('✅ Razorpay order created:', { orderId: order.id, amount: order.amount });

        res.json({
            success: true,
            id: order.id,
            amount: order.amount,
            currency: order.currency,
        });

    } catch (error) {
        console.error("❌ Razorpay Error:", error);

        if (error?.statusCode === 401) {
            const currentKey = (process.env.RAZORPAY_KEY_ID || '').trim();
            return res.status(502).json({
                success: false,
                message: `Razorpay authentication failed for key ${currentKey ? `${currentKey.slice(0, 10)}...${currentKey.slice(-4)}` : 'missing'}. Check backend .env key pair`,
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
