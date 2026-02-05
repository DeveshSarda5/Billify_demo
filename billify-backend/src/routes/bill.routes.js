const express = require('express');
const router = express.Router();
const { createBill, getMyBills } = require('../controllers/bill.controller');
const { protect } = require('../middleware/auth.middleware');

router.post('/create', protect, createBill);
router.get('/my', protect, getMyBills);

module.exports = router;
