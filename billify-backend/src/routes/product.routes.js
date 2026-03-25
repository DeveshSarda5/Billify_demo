const express = require('express');
const router = express.Router();
const { getProductByBarcode, createProduct, getAllProducts } = require('../controllers/product.controller');
const { protect, adminOnly } = require('../middleware/auth.middleware');

router.get('/', protect, adminOnly, getAllProducts);
router.get('/:barcode', protect, getProductByBarcode);
router.post('/', protect, adminOnly, createProduct);

module.exports = router;
