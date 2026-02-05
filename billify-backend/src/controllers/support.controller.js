const SupportTicket = require('../models/SupportTicket');

// @desc    Create a support ticket
// @route   POST /api/support
// @access  Private
exports.createTicket = async (req, res) => {
    try {
        const { subject, message } = req.body;

        if (!subject || !message) {
            return res.status(400).json({ message: 'Please provide subject and message' });
        }

        const ticket = await SupportTicket.create({
            user: req.user._id,
            subject,
            message,
        });

        res.status(201).json({ success: true, ticket });
    } catch (error) {
        console.error('Create Ticket Error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Get my support tickets
// @route   GET /api/support/my
// @access  Private
exports.getMyTickets = async (req, res) => {
    try {
        const tickets = await SupportTicket.find({ user: req.user._id }).sort('-createdAt');
        res.json(tickets);
    } catch (error) {
        console.error('Get Tickets Error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};
