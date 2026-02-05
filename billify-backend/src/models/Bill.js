const mongoose = require('mongoose');

const BillSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },

        items: [
            {
                productId: {
                    type: String, // ✅ FIXED
                    required: true,
                },
                name: {
                    type: String,
                    required: true,
                },
                price: {
                    type: Number,
                    required: true,
                },
                quantity: {
                    type: Number,
                    required: true,
                },
            },
        ],

        subtotal: Number,
        tax: Number,
        totalAmount: Number,

        paymentStatus: {
            type: String,
            enum: ['pending', 'paid'],
            default: 'pending',
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model('Bill', BillSchema);
