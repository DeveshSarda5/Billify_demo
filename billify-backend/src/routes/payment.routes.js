const express = require('express');
const router = express.Router();
const { createOrder, verifyPayment, verifyBill, testDistance, hostedCheckoutPage } = require('../controllers/payment.controller');
const { protect } = require('../middleware/auth.middleware');

router.get('/checkout', hostedCheckoutPage);
router.post('/create-order', protect, createOrder);
router.post('/verify', protect, verifyPayment);
router.post('/verify-bill', protect, verifyBill);
router.post('/test-distance', testDistance); // For debugging only

module.exports = router;
