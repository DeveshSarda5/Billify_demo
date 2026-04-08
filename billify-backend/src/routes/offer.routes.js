const express = require('express');
const router = express.Router();
const Offer = require('../models/Offer');

// GET /api/offers/active — public endpoint for active offers
router.get('/active', async (req, res) => {
    try {
        const now = new Date();
        const offers = await Offer.find({
            status: 'Active',
            startDate: { $lte: now },
            endDate: { $gte: now },
        });
        res.json(offers);
    } catch (error) {
        console.error('Public active offers fetch error:', error);
        res.status(500).json({ message: 'Failed to load active offers' });
    }
});

module.exports = router;
