const mongoose = require('mongoose');

const PaymentSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        orderId: {
            type: String,
            required: true,
        },
        paymentId: {
            type: String,
        },
        signature: {
            type: String,
        },
        amount: {
            type: Number,
            required: true,
        },
        status: {
            type: String,
            enum: ['pending', 'completed', 'failed'],
            default: 'pending',
        },
        method: {
            type: String,
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model('Payment', PaymentSchema);
