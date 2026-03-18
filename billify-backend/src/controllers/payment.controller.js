const Razorpay = require('razorpay');
const crypto = require('crypto');
const Payment = require('../models/Payment');
const Bill = require('../models/Bill');
const STORE_LOCATIONS = require('../config/storeLocations');
const { calculateDistance } = require('../utils/distanceUtils');

// Initialize Razorpay with environment variables
// Keys must be set in .env file (validated at server startup)
const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET
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
