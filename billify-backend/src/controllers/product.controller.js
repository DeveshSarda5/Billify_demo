const Product = require('../models/Product');

exports.getProductByBarcode = async (req, res) => {
    try {
        const { barcode } = req.params;
        const product = await Product.findOne({ barcode });

        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        res.json(product);
    } catch (err) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// Admin route to seed products
exports.createProduct = async (req, res) => {
    try {
        const product = await Product.create(req.body);
        res.status(201).json(product);
    } catch (err) {
        res.status(500).json({ message: 'Server Error' });
    }
};
