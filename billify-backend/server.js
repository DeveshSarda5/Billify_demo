require('dotenv').config();
const express = require('express');
const cors = require('cors');
const os = require('os');
const connectDB = require('./src/config/db');
const { validateEnvironment } = require('./src/config/env.validation');

function getLocalIPv4Address() {
  const interfaces = os.networkInterfaces();

  const excludedInterfacePatterns = [
    /loopback/i,
    /virtual/i,
    /wi-fi direct/i,
    /local area connection\*/i,
    /vmware/i,
    /hyper-v/i,
    /vbox/i,
    /docker/i,
    /vEthernet/i,
    /tun/i,
    /tap/i,
    /vpn/i,
    /bluetooth/i,
  ];

  const preferredIPs = [];
  const secondaryIPs = [];
  const fallbackIPs = [];

  Object.entries(interfaces).forEach(([interfaceName, addresses]) => {
    if (!addresses || excludedInterfacePatterns.some(pattern => pattern.test(interfaceName))) {
      return;
    }

    addresses.forEach(addressInfo => {
      const isIPv4 = addressInfo.family === 'IPv4' || addressInfo.family === 4;
      if (!isIPv4 || addressInfo.internal) {
        return;
      }

      const ip = addressInfo.address;
      const isPreferredInterface = /(wi[- ]?fi|wlan|ethernet)/i.test(interfaceName);

      if (ip.startsWith('192.168.') && isPreferredInterface) {
        preferredIPs.push(ip);
      } else if ((ip.startsWith('10.') || ip.startsWith('172.') || ip.startsWith('192.168.')) && isPreferredInterface) {
        secondaryIPs.push(ip);
      } else {
        fallbackIPs.push(ip);
      }
    });
  });

  return preferredIPs[0] || secondaryIPs[0] || fallbackIPs[0] || '127.0.0.1';
}

// Validate environment variables before starting
try {
  validateEnvironment();
} catch (error) {
  console.error('\n🔴 STARTUP FAILED - Environment Configuration Error');
  console.error(error.message);
  process.exit(1);
}

const app = express();

const detectedIP = process.env.SERVER_IP || getLocalIPv4Address();


const allowedOrigins = [
  /^http:\/\/localhost:\d+$/,
  /^http:\/\/127\.0\.0\.1:\d+$/,
  /^http:\/\/192\.168\.\d{1,3}\.\d{1,3}:\d+$/,
  /^http:\/\/10\.\d{1,3}\.\d{1,3}\.\d{1,3}:\d+$/,
  /^http:\/\/172\.(1[6-9]|2\d|3[0-1])\.\d{1,3}\.\d{1,3}:\d+$/,
  /^https?:\/\/[a-z0-9-]+\.ngrok(?:-free)?\.(?:app|dev)$/,
  /^exp:\/\//,
  /^http:\/\/.*:8081$/,
];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) {
      return callback(null, true);
    }

    const isAllowed = allowedOrigins.some((pattern) => pattern.test(origin));
    if (isAllowed) {
      return callback(null, true);
    }

    return callback(new Error(`CORS blocked for origin: ${origin}`));
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));


// Middleware
app.use(express.json());


// ✅ Request logger (helps debugging)
app.use((req, res, next) => {
  console.log(`📡 ${req.method} ${req.url} from ${req.ip}`);
  next();
});


// Routes
app.use('/api/auth', require('./src/routes/auth.routes'));
app.use('/api/bills', require('./src/routes/bill.routes'));
app.use('/api/products', require('./src/routes/product.routes'));
app.use('/api/payments', require('./src/routes/payment.routes'));
// Alias requested by mobile integration docs: /api/payment/create-order
app.use('/api/payment', require('./src/routes/payment.routes'));
app.use('/api/support', require('./src/routes/support.routes'));
app.use('/api/admin', require('./src/routes/admin.routes'));

// Public route for active offers (used by the mobile app — no auth required)
const { getActiveOffers } = require('./src/controllers/admin.controller');
app.get('/api/offers/active', getActiveOffers);


// Health check route (VERY IMPORTANT for testing)
app.get('/', (req, res) => {
  res.send('Billify API is running...');
});


// ✅ Additional test route
app.get('/api/test', (req, res) => {
  res.json({
    message: 'API working',
    ip: detectedIP,
  });
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


async function startServer() {
  await connectDB();

  app.listen(PORT, '0.0.0.0', () => {
    console.log('🚀 Server running at:');
    console.log(`http://${detectedIP}:${PORT}`);
    console.log(`http://localhost:${PORT}`);
  });
}

startServer().catch((error) => {
  console.error('🔴 STARTUP FAILED - Server could not start');
  console.error(error);
  process.exit(1);
});