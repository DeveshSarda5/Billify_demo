const express = require('express');
const router = express.Router();
const {
    getDashboardSummary,
    getAllUsers,
    getAllBills,
    getAllPayments,
    getAllTickets,
    respondToTicket,
    getAllProducts,
    updateProduct,
    deleteProduct,
    getAllOffers,
    getActiveOffers,
    createOffer,
    updateOffer,
    deleteOffer,
} = require('../controllers/admin.controller');
const { protect, adminOnly } = require('../middleware/auth.middleware');

router.use(protect, adminOnly);

// Admin dashboard and management endpoints.
router.get('/dashboard', getDashboardSummary);
router.get('/users', getAllUsers);
router.get('/bills', getAllBills);
router.get('/payments', getAllPayments);
router.get('/support', getAllTickets);
router.put('/support/:id', respondToTicket);
router.get('/products', getAllProducts);
router.put('/products/:id', updateProduct);
router.delete('/products/:id', deleteProduct);
router.get('/offers', getAllOffers);
router.get('/offers/active', getActiveOffers);
router.post('/offers', createOffer);
router.put('/offers/:id', updateOffer);
router.delete('/offers/:id', deleteOffer);

module.exports = router;