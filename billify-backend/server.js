require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./src/config/db');
const { validateEnvironment } = require('./src/config/env.validation');

const app = express();

// Validate environment variables
try {
  validateEnvironment();
} catch (error) {
  console.error('ENV ERROR:', error.message);
  process.exit(1);
}

// CORS
app.use(cors({
  origin: [
    'http://localhost:3000',
    'https://billify-demo.vercel.app'
  ],
  credentials: true
}));

// Body parser
app.use(express.json());

// Routes
app.use('/api/auth', require('./src/routes/auth.routes'));
app.use('/api/bills', require('./src/routes/bill.routes'));
app.use('/api/products', require('./src/routes/product.routes'));
app.use('/api/payments', require('./src/routes/payment.routes'));
app.use('/api/support', require('./src/routes/support.routes'));
app.use('/api/offers', require('./src/routes/offer.routes'));
app.use('/api/admin', require('./src/routes/admin.routes'));

// Health check
app.get('/', (req, res) => {
  res.send('API running');
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack || err);
  const status = err.status || err.statusCode || 500;
  res.status(status).json({ message: err.message || 'Internal Server Error' });
});

// Start server
const PORT = process.env.PORT || 5000;

connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('Failed to start server:', err.message);
    process.exit(1);
  });