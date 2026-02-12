const SupportTicket = require('../models/SupportTicket');

// @desc    Create a support ticket
// @route   POST /api/support
// @access  Private
exports.createTicket = async (req, res) => {
    try {
        const { title, description, category } = req.body;

        if (!title || !description) {
            return res.status(400).json({ message: 'Please provide title and description' });
        }

        const ticket = await SupportTicket.create({
            user: req.user._id,
            title,
            description,
            category: category || 'other',
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

// @desc    Get a single ticket
// @route   GET /api/support/:id
// @access  Private
exports.getTicket = async (req, res) => {
    try {
        const ticket = await SupportTicket.findById(req.params.id);

        if (!ticket) {
            return res.status(404).json({ message: 'Ticket not found' });
        }

        // Ensure user owns the ticket
        if (ticket.user.toString() !== req.user._id.toString()) {
            return res.status(401).json({ message: 'Not authorized' });
        }

        res.json(ticket);
    } catch (error) {
        console.error('Get Ticket Error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Close a ticket
// @route   PUT /api/support/:id/close
// @access  Private
exports.closeTicket = async (req, res) => {
    try {
        const ticket = await SupportTicket.findById(req.params.id);

        if (!ticket) {
            return res.status(404).json({ message: 'Ticket not found' });
        }

        // Ensure user owns the ticket
        if (ticket.user.toString() !== req.user._id.toString()) {
            return res.status(401).json({ message: 'Not authorized' });
        }

        ticket.status = 'closed';
        await ticket.save();

        res.json({ success: true, ticket });
    } catch (error) {
        console.error('Close Ticket Error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};
