const express = require('express');
const router = express.Router();
const { getProductByBarcode, createProduct } = require('../controllers/product.controller');
const { protect } = require('../middleware/auth.middleware');

router.get('/:barcode', protect, getProductByBarcode);
router.post('/', protect, createProduct); // Admin only in real world

module.exports = router;
