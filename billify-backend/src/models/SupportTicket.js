const mongoose = require('mongoose');

const SupportTicketSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        title: {
            type: String,
            required: true,
        },
        description: {
            type: String,
            required: true,
        },
        category: {
            type: String,
            enum: ['billing-issue', 'payment-failure', 'refund-request', 'technical-problem', 'account-issue', 'other'],
            default: 'other',
        },
        status: {
            type: String,
            enum: ['open', 'in-progress', 'closed'],
            default: 'open',
        },
        response: {
            type: String,
            default: null,
        },
        respondedAt: {
            type: Date,
            default: null,
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model('SupportTicket', SupportTicketSchema);
