/**
 * ✅ EXAMPLE: Safe Environment Variable Access in Node.js/Express
 * 
 * This file demonstrates the correct way to use environment variables
 * for sensitive configuration like database URIs, API keys, and secrets.
 */

// ============================================================================
// ✅ GOOD: Config Module Pattern (Recommended)
// ============================================================================

// src/config/environment.js
class Environment {
  constructor() {
    this.validateRequiredVariables();
  }

  validateRequiredVariables() {
    const required = [
      'MONGO_URI',
      'JWT_SECRET',
      'RAZORPAY_KEY_ID',
      'RAZORPAY_KEY_SECRET'
    ];

    const missing = required.filter(variable => !process.env[variable]);
    
    if (missing.length > 0) {
      console.error(`❌ Missing environment variables: ${missing.join(', ')}`);
      console.error('📋 Make sure to create a .env file with all required variables');
      process.exit(1);
    }
  }

  // Database
  get mongoUri() {
    return process.env.MONGO_URI;
  }

  // Authentication
  get jwtSecret() {
    return process.env.JWT_SECRET;
  }

  get jwtExpiresIn() {
    return process.env.JWT_EXPIRES_IN || '7d';
  }

  // Razorpay Payment Gateway
  get razorpayKeyId() {
    return process.env.RAZORPAY_KEY_ID;
  }

  get razorpayKeySecret() {
    return process.env.RAZORPAY_KEY_SECRET;
  }

  // Server
  get port() {
    return process.env.PORT || 5000;
  }

  get nodeEnv() {
    return process.env.NODE_ENV || 'development';
  }

  get isProduction() {
    return this.nodeEnv === 'production';
  }

  // Optional: Email service variables if added later
  get smtpHost() {
    return process.env.SMTP_HOST;
  }

  get smtpPort() {
    return parseInt(process.env.SMTP_PORT || '587', 10);
  }

  get smtpUser() {
    return process.env.SMTP_USER;
  }

  get smtpPassword() {
    return process.env.SMTP_PASSWORD;
  }
}

// Export singleton instance
module.exports = new Environment();


// ============================================================================
// ✅ GOOD: Usage in Controllers/Middleware
// ============================================================================

// src/middleware/auth.middleware.js
const jwt = require('jsonwebtoken');
const env = require('../config/environment');

const verifyToken = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({ 
        message: 'No authorization token provided',
        success: false 
      });
    }

    // ✅ GOOD: Access from config module
    const decoded = jwt.verify(token, env.jwtSecret);
    req.user = decoded;
    next();

  } catch (error) {
    console.error('❌ Token verification failed:', error.message);
    return res.status(401).json({ 
      message: 'Invalid or expired token',
      success: false 
    });
  }
};

module.exports = verifyToken;


// ============================================================================
// ✅ GOOD: Usage in Authentication Services
// ============================================================================

// src/services/auth.service.js
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const env = require('../config/environment');

class AuthService {
  /**
   * Generate JWT token for user
   * @param {string} userId - User ID from database
   * @returns {string} JWT token
   */
  generateToken(userId) {
    try {
      return jwt.sign(
        { userId, iat: Math.floor(Date.now() / 1000) },
        env.jwtSecret, // ✅ From environment
        { expiresIn: env.jwtExpiresIn }
      );
    } catch (error) {
      console.error('❌ Error generating token:', error.message);
      throw new Error('Failed to generate authentication token');
    }
  }

  /**
   * Verify JWT token
   * @param {string} token - JWT token to verify
   * @returns {object} Decoded token payload
   */
  verifyToken(token) {
    try {
      return jwt.verify(token, env.jwtSecret); // ✅ From environment
    } catch (error) {
      console.error('❌ Token verification failed:', error.message);
      throw new Error('Invalid or expired token');
    }
  }

  /**
   * Hash password
   * @param {string} password - Password to hash
   * @returns {string} Hashed password
   */
  async hashPassword(password) {
    const salt = await bcrypt.genSalt(10);
    return bcrypt.hash(password, salt);
  }

  /**
   * Compare password
   * @param {string} password - Plain password
   * @param {string} hash - Hashed password
   * @returns {boolean} Passwords match
   */
  async comparePassword(password, hash) {
    return bcrypt.compare(password, hash);
  }
}

module.exports = new AuthService();


// ============================================================================
// ✅ GOOD: Usage in Payment Services
// ============================================================================

// src/services/payment.service.js
const axios = require('axios');
const env = require('../config/environment');

class PaymentService {
  constructor() {
    // ✅ GOOD: Initialize Razorpay client with secrets from environment
    this.razorpayKeyId = env.razorpayKeyId;
    this.razorpayKeySecret = env.razorpayKeySecret;
  }

  /**
   * Create Razorpay order
   * @param {number} amount - Amount in paise (e.g., 10000 for ₹100)
   * @param {string} currency - Currency code (default: INR)
   * @returns {object} Razorpay order response
   */
  async createOrder(amount, currency = 'INR') {
    try {
      const auth = Buffer.from(
        `${this.razorpayKeyId}:${this.razorpayKeySecret}` // ✅ From environment
      ).toString('base64');

      const response = await axios.post(
        'https://api.razorpay.com/v1/orders',
        { amount, currency },
        {
          headers: {
            'Authorization': `Basic ${auth}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return response.data;
    } catch (error) {
      console.error('❌ Razorpay order creation failed:', error.message);
      throw new Error('Failed to create payment order');
    }
  }

  /**
   * Verify payment signature
   * @param {object} paymentData - Razorpay payment data
   * @returns {boolean} Signature is valid
   */
  verifyPaymentSignature(paymentData) {
    const crypto = require('crypto');
    const { orderId, paymentId, signature } = paymentData;

    const expectedSignature = crypto
      .createHmac('sha256', this.razorpayKeySecret) // ✅ From environment
      .update(`${orderId}|${paymentId}`)
      .digest('hex');

    return expectedSignature === signature;
  }
}

module.exports = new PaymentService();


// ============================================================================
// ✅ GOOD: Usage in Database Connection
// ============================================================================

// src/config/db.js
const mongoose = require('mongoose');
const env = require('./environment');

const connectDB = async () => {
  try {
    console.log('📡 Connecting to MongoDB...');
    
    // ✅ GOOD: Connection string from environment
    await mongoose.connect(env.mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('✅ MongoDB connected successfully');
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message);
    process.exit(1);
  }
};

module.exports = connectDB;


// ============================================================================
// ✅ GOOD: Server Startup with Environment Validation
// ============================================================================

// server.js
require('dotenv').config(); // Load .env file

const express = require('express');
const cors = require('cors');
const env = require('./src/config/environment'); // Validates on import
const connectDB = require('./src/config/db');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Connect to database
connectDB();

// Routes
app.use('/api/auth', require('./src/routes/auth.routes'));
app.use('/api/payments', require('./src/routes/payment.routes'));

// Error handler
app.use((err, req, res, next) => {
  console.error('🔥 Error:', err.message);
  
  // ✅ GOOD: Don't expose stack traces in production
  res.status(500).json({
    message: 'Internal server error',
    stack: env.isProduction ? undefined : err.stack
  });
});

// ✅ GOOD: Start server with environment-based port
const PORT = env.port;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT} (${env.nodeEnv})`);
  console.log(`🔐 Environment: ${env.isProduction ? 'PRODUCTION' : 'DEVELOPMENT'}`);
});


// ============================================================================
// ❌ BAD EXAMPLES (Never Do This!)
// ============================================================================

/*
// ❌ BAD: Hardcoded secrets
const jwtSecret = 'my_secret_key_123';
const mongoUri = 'mongodb://localhost:27017/billify';
const razorpayKey = 'rzp_test_key_123';

// ❌ BAD: Logging sensitive data
console.log('JWT_SECRET:', process.env.JWT_SECRET);
console.log('Database URI:', process.env.MONGO_URI);

// ❌ BAD: Committing .env files
// .env file in git repository

// ❌ BAD: Using same secret for prod and dev
if (process.env.NODE_ENV === 'production') {
  // Using same secret - BAD!
  const secret = 'same_secret_for_all_environments';
}

// ❌ BAD: Trying to access missing environment variables without validation
const secret = process.env.MISSING_VAR; // Could be undefined!

// ❌ BAD: Exposing error messages that reveal secrets
catch (error) {
  res.json({
    message: error.message, // Could contain DB URI, API keys, etc
    stack: error.stack // NEVER in production!
  });
}
*/
