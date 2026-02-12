const express = require('express');
const router = express.Router();
const { createTicket, getMyTickets, getTicket, closeTicket } = require('../controllers/support.controller');
const { protect } = require('../middleware/auth.middleware');

router.post('/', protect, createTicket);
router.get('/my', protect, getMyTickets);
router.get('/:id', protect, getTicket);
router.put('/:id/close', protect, closeTicket);

module.exports = router;
