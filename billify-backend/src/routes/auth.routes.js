const express = require('express');
const router = express.Router();
const { signup, login, getMe, updateProfile, changePassword, sendOTP, verifyOTP, checkPhoneVerification } = require('../controllers/auth.controller');
const { protect } = require('../middleware/auth.middleware');

router.post('/signup', signup);
router.post('/login', login);
router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfile);
router.put('/password', protect, changePassword);

// OTP Routes (for signup verification)
router.post('/send-otp', sendOTP);
router.post('/verify-otp', verifyOTP);
router.get('/check-phone-verification', checkPhoneVerification);

module.exports = router;
