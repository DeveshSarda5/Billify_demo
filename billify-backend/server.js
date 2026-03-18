require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./src/config/db');
const { validateEnvironment } = require('./src/config/env.validation');

// Validate environment variables before starting
try {
  validateEnvironment();
} catch (error) {
  console.error('\n🔴 STARTUP FAILED - Environment Configuration Error');
  console.error(error.message);
  process.exit(1);
}

// Connect to Database
connectDB();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Request logger
app.use((req, res, next) => {
    console.log(`📡 ${req.method} ${req.url}`);
    next();
});

// Routes
app.use('/api/auth', require('./src/routes/auth.routes'));
app.use('/api/bills', require('./src/routes/bill.routes'));
app.use('/api/products', require('./src/routes/product.routes'));
app.use('/api/payments', require('./src/routes/payment.routes'));
app.use('/api/support', require('./src/routes/support.routes'));

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

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
