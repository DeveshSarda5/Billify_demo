const User = require('../models/User');
const Bill = require('../models/Bill');
const Product = require('../models/Product');
const Payment = require('../models/Payment');
const SupportTicket = require('../models/SupportTicket');
const Offer = require('../models/Offer');

exports.getDashboardSummary = async (req, res) => {
    try {
        const [usersCount, billsCount, productsCount, openTicketsCount, payments] = await Promise.all([
            User.countDocuments(),
            Bill.countDocuments(),
            Product.countDocuments(),
            SupportTicket.countDocuments({ status: { $ne: 'closed' } }),
            Payment.find().sort({ createdAt: -1 }).limit(200).lean(),
        ]);

        const revenue = payments
            .filter((payment) => payment.status === 'completed')
            .reduce((sum, payment) => sum + (payment.amount || 0), 0);

        res.json({
            usersCount,
            billsCount,
            productsCount,
            openTicketsCount,
            revenue,
        });
    } catch (error) {
        console.error('Admin dashboard summary error:', error);
        res.status(500).json({ message: 'Failed to load dashboard summary' });
    }
};

exports.getAllUsers = async (req, res) => {
    try {
        const users = await User.find().select('-password').sort({ createdAt: -1 });
        res.json(users);
    } catch (error) {
        console.error('Admin users fetch error:', error);
        res.status(500).json({ message: 'Failed to load users' });
    }
};

exports.getAllBills = async (req, res) => {
    try {
        const bills = await Bill.find()
            .populate('userId', 'name email phone role')
            .sort({ createdAt: -1 });
        res.json(bills);
    } catch (error) {
        console.error('Admin bills fetch error:', error);
        res.status(500).json({ message: 'Failed to load bills' });
    }
};

exports.getAllPayments = async (req, res) => {
    try {
        const payments = await Payment.find()
            .populate('user', 'name email phone role')
            .sort({ createdAt: -1 });
        res.json(payments);
    } catch (error) {
        console.error('Admin payments fetch error:', error);
        res.status(500).json({ message: 'Failed to load payments' });
    }
};

exports.getAllTickets = async (req, res) => {
    try {
        const tickets = await SupportTicket.find()
            .populate('user', 'name email phone role')
            .sort({ createdAt: -1 });
        res.json(tickets);
    } catch (error) {
        console.error('Admin tickets fetch error:', error);
        res.status(500).json({ message: 'Failed to load support tickets' });
    }
};

exports.respondToTicket = async (req, res) => {
    try {
        const update = { respondedAt: new Date() };
        if (req.body.status !== undefined) update.status = req.body.status;
        if (req.body.response !== undefined) update.response = req.body.response;

        const ticket = await SupportTicket.findByIdAndUpdate(
            req.params.id,
            { $set: update },
            { new: true, runValidators: true }
        ).populate('user', 'name email phone role');

        if (!ticket) {
            return res.status(404).json({ message: 'Ticket not found' });
        }

        res.json({ success: true, ticket });
    } catch (error) {
        console.error('Admin ticket update error:', error);
        res.status(500).json({ message: 'Failed to update support ticket' });
    }
};

exports.getAllProducts = async (req, res) => {
    try {
        const products = await Product.find().sort({ createdAt: -1 });
        res.json(products);
    } catch (error) {
        console.error('Admin products fetch error:', error);
        res.status(500).json({ message: 'Failed to load products' });
    }
};

exports.updateProduct = async (req, res) => {
    try {
        const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true,
        });

        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        res.json(product);
    } catch (error) {
        console.error('Admin product update error:', error);
        res.status(500).json({ message: 'Failed to update product' });
    }
};

exports.deleteProduct = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);

        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        await product.deleteOne();
        res.json({ success: true, message: 'Product deleted' });
    } catch (error) {
        console.error('Admin product delete error:', error);
        res.status(500).json({ message: 'Failed to delete product' });
    }
};

// ─── Offers / Discounts ───────────────────────────────────────────────────────

exports.getAllOffers = async (req, res) => {
    try {
        const offers = await Offer.find().sort({ createdAt: -1 });
        res.json(offers);
    } catch (error) {
        console.error('Admin offers fetch error:', error);
        res.status(500).json({ message: 'Failed to load offers' });
    }
};

exports.getActiveOffers = async (req, res) => {
    try {
        const now = new Date();
        const offers = await Offer.find({
            status: 'Active',
            startDate: { $lte: now },
            endDate: { $gte: now },
        });
        res.json(offers);
    } catch (error) {
        console.error('Active offers fetch error:', error);
        res.status(500).json({ message: 'Failed to load active offers' });
    }
};

exports.createOffer = async (req, res) => {
    try {
        const offer = await Offer.create(req.body);
        res.status(201).json(offer);
    } catch (error) {
        console.error('Admin offer create error:', error);
        if (error.code === 11000) {
            return res.status(400).json({ message: 'Coupon code already exists' });
        }
        res.status(500).json({ message: error.message || 'Failed to create offer' });
    }
};

exports.updateOffer = async (req, res) => {
    try {
        const offer = await Offer.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true,
        });
        if (!offer) {
            return res.status(404).json({ message: 'Offer not found' });
        }
        res.json(offer);
    } catch (error) {
        console.error('Admin offer update error:', error);
        if (error.code === 11000) {
            return res.status(400).json({ message: 'Coupon code already exists' });
        }
        res.status(500).json({ message: 'Failed to update offer' });
    }
};

exports.deleteOffer = async (req, res) => {
    try {
        const offer = await Offer.findByIdAndDelete(req.params.id);
        if (!offer) {
            return res.status(404).json({ message: 'Offer not found' });
        }
        res.json({ success: true, message: 'Offer deleted' });
    } catch (error) {
        console.error('Admin offer delete error:', error);
        res.status(500).json({ message: 'Failed to delete offer' });
    }
};