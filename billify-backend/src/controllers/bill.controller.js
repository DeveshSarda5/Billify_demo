const Bill = require('../models/Bill');

exports.createBill = async (req, res) => {
    try {
        const { items } = req.body;
        const userId = req.user;

        if (!items || items.length === 0) {
            return res.status(400).json({ message: 'No items in bill' });
        }

        let subtotal = 0;
        items.forEach(item => {
            subtotal += item.price * item.quantity;
        });

        const tax = subtotal * 0.05;
        const totalAmount = subtotal + tax;

        const bill = new Bill({
            userId,
            items,
            subtotal,
            tax,
            totalAmount,
            paymentStatus: 'paid', // 🔥 set paid for now
        });

        const savedBill = await bill.save();

        // ✅ ALWAYS RETURN JSON
        return res.status(201).json({
            success: true,
            bill: savedBill,
        });

    } catch (err) {
        console.error(err);
        return res.status(500).json({
            success: false,
            message: 'Server Error',
        });
    }
};

exports.getMyBills = async (req, res) => {
    try {
        const bills = await Bill.find({ userId: req.user }).sort({ createdAt: -1 });
        return res.json(bills);
    } catch (err) {
        console.error(err);
        return res.status(500).json({
            message: 'Server Error',
        });
    }
};
