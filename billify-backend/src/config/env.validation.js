/**
 * Environment Variables Validation
 * Ensures all required secrets and configuration are present at startup
 */

const requiredEnvVars = {
  // Database
  MONGO_URI: {
    required: true,
    description: 'MongoDB connection string',
    example: 'mongodb://localhost:27017/billify',
  },

  // Authentication
  JWT_SECRET: {
    required: true,
    description: 'JWT signing secret (min 32 chars)',
    example: 'your_long_random_secret_key_here',
  },

  // Payment Gateway
  RAZORPAY_KEY_ID: {
    required: false,
    description: 'Razorpay API Key ID',
    example: 'rzp_test_xxx or rzp_live_xxx',
  },

  RAZORPAY_KEY_SECRET: {
    required: false,
    description: 'Razorpay API Key Secret',
    example: 'your_razorpay_secret_key',
  },

  // Server
  PORT: {
    required: false,
    description: 'Server port (default: 5000)',
    example: '5000',
  },

  NODE_ENV: {
    required: false,
    description: 'Environment (development, production)',
    example: 'development',
  },

  SERVER_IP: {
    required: false,
    description: 'Override auto-detected local IP for server startup logs and debug route',
    example: '192.168.1.50',
  },
};

/**
 * Validate environment variables at startup
 * @throws {Error} If required variables are missing
 */
function validateEnvironment() {
  const missing = [];
  const configured = [];
  const warnings = [];

  Object.entries(requiredEnvVars).forEach(([varName, config]) => {
    const value = process.env[varName];

    if (!value) {
      if (config.required) {
        missing.push(`${varName} - ${config.description}`);
      } else {
        warnings.push(`${varName} (optional) - ${config.description}`);
      }
    } else {
      configured.push(varName);
    }
  });

  // Razorpay pair validation (if one is set, both must be set)
  const razorpayKeyId = (process.env.RAZORPAY_KEY_ID || '').trim();
  const razorpayKeySecret = (process.env.RAZORPAY_KEY_SECRET || '').trim();

  if (razorpayKeyId || razorpayKeySecret) {
    if (!razorpayKeyId || !razorpayKeySecret) {
      missing.push('RAZORPAY_KEY_ID + RAZORPAY_KEY_SECRET - both are required together for payments');
    }

    if (razorpayKeyId && !/^rzp_(test|live)_/.test(razorpayKeyId)) {
      missing.push('RAZORPAY_KEY_ID - must start with rzp_test_ or rzp_live_');
    }
  }

  // Print startup report
  console.log('\n🔐 ENVIRONMENT VALIDATION REPORT');
  console.log('═'.repeat(50));

  if (configured.length > 0) {
    console.log('\n✅ Configured Variables:');
    configured.forEach(varName => {
      const config = requiredEnvVars[varName];
      console.log(`   • ${varName} - ${config.description}`);
    });
  }

  if (warnings.length > 0) {
    console.log('\n⚠️  Optional Variables (not set):');
    warnings.forEach(warning => {
      console.log(`   • ${warning}`);
    });
  }

  if (missing.length > 0) {
    console.log('\n❌ MISSING REQUIRED VARIABLES:');
    missing.forEach(varName => {
      console.log(`   • ${varName}`);
    });

    console.log('\n📋 Setup Instructions:');
    console.log('   1. Copy .env.example to .env');
    console.log('      $ cp .env.example .env');
    console.log('   2. Edit .env with your actual values');
    console.log('      $ nano .env');
    console.log('   3. Do NOT commit .env to git');
    console.log('   4. Restart the server');
    console.log('      $ npm start');
    console.log('');

    throw new Error(
      `Missing required environment variables:\n   ${missing.map(m => '• ' + m).join('\n   ')}`
    );
  }

  console.log('\n✅ All required variables are configured!');
  console.log('═'.repeat(50) + '\n');
}

module.exports = { validateEnvironment, requiredEnvVars };
