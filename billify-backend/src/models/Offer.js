const mongoose = require('mongoose');

const OfferSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
        },
        couponCode: {
            type: String,
            required: true,
            trim: true,
            uppercase: true,
            unique: true,
        },
        discountType: {
            type: String,
            enum: ['percentage', 'fixed', 'bogo'],
            required: true,
        },
        discountValue: {
            type: Number,
            required: true,
            min: 0,
        },
        applicableProducts: {
            type: String,
            default: 'All Products',
        },
        startDate: {
            type: Date,
            required: true,
        },
        endDate: {
            type: Date,
            required: true,
        },
        status: {
            type: String,
            enum: ['Active', 'Scheduled', 'Expired'],
            default: 'Scheduled',
        },
        maxUsage: {
            type: Number,
            default: 1000,
            min: 1,
        },
        currentUsage: {
            type: Number,
            default: 0,
            min: 0,
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model('Offer', OfferSchema);
