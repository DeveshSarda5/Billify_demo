const express = require('express');
const router = express.Router();
const { createBill, getMyBills, deleteBill, markBillPaid } = require('../controllers/bill.controller');
const { protect } = require('../middleware/auth.middleware');

router.post('/create', protect, createBill);
router.get('/my', protect, getMyBills);
router.put('/:id/mark-paid', protect, markBillPaid);
router.delete('/:id', protect, deleteBill);

module.exports = router;
