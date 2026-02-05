const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
    barcode: {
        type: String,
        required: true,
        unique: true,
    },
    name: {
        type: String,
        required: true,
    },
    price: {
        type: Number,
        required: true,
    },
    category: String,
    stock: {
        type: Number,
        default: 100,
    }
}, { timestamps: true });

module.exports = mongoose.model('Product', ProductSchema);
