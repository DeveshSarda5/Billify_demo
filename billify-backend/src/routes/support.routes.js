const express = require('express');
const router = express.Router();
const { createTicket, getMyTickets } = require('../controllers/support.controller');
const { protect } = require('../middleware/auth.middleware');

router.post('/', protect, createTicket);
router.get('/my', protect, getMyTickets);

module.exports = router;
