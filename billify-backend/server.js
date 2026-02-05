require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./src/config/db');

// Connect to Database
connectDB();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', require('./src/routes/auth.routes'));
app.use('/api/bills', require('./src/routes/bill.routes'));
app.use('/api/products', require('./src/routes/product.routes'));

app.get('/', (req, res) => {
    res.send('Billify API is running...');
});

// Error Handler
app.use((err, req, res, next) => {
    console.error('🔥 Error Caught By Handler:', err);
    res.status(500).json({
        message: err.message,
        stack: process.env.NODE_ENV === 'production' ? null : err.stack,
    });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});
