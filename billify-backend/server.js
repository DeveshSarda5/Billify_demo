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
/local area connection*/i,
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

```
addresses.forEach(addressInfo => {
  const isIPv4 = addressInfo.family === 'IPv4' || addressInfo.family === 4;
  if (!isIPv4 || addressInfo.internal) return;

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
```

});

return preferredIPs[0] || secondaryIPs[0] || fallbackIPs[0] || '127.0.0.1';
}

// ✅ Validate env
try {
validateEnvironment();
} catch (error) {
console.error('\n🔴 STARTUP FAILED - Environment Configuration Error');
console.error(error.message);
process.exit(1);
}

const app = express();

// 🔥 FIXED CORS (SIMPLE + WORKING)
app.use(cors({
origin: [
"http://localhost:3000",
"https://billify-demo.vercel.app"
],
credentials: true
}));

// 🔥 HANDLE PREFLIGHT REQUESTS
app.options(cors());

// Middleware
app.use(express.json());

// Debug logger
app.use((req, res, next) => {
console.log(`📡 ${req.method} ${req.url} from ${req.ip}`);
next();
});

// Routes
app.use('/api/auth', require('./src/routes/auth.routes'));
app.use('/api/bills', require('./src/routes/bill.routes'));
app.use('/api/products', require('./src/routes/product.routes'));
app.use('/api/payments', require('./src/routes/payment.routes'));
app.use('/api/payment', require('./src/routes/payment.routes'));
app.use('/api/support', require('./src/routes/support.routes'));
app.use('/api/admin', require('./src/routes/admin.routes'));

const { getActiveOffers } = require('./src/controllers/admin.controller');
app.get('/api/offers/active', getActiveOffers);

// Health check
app.get('/', (req, res) => {
res.send('Billify API is running...');
});

// Test route
app.get('/api/test', (req, res) => {
res.json({ message: 'API working' });
});

// Error handler
app.use((err, req, res, next) => {
console.error('🔥 Error:', err);
res.status(500).json({
message: err.message,
stack: process.env.NODE_ENV === 'production' ? null : err.stack,
});
});

const PORT = process.env.PORT || 5000;

async function startServer() {
await connectDB();

app.listen(PORT, '0.0.0.0', () => {
console.log(`🚀 Server running on port ${PORT}`);
});
}

startServer().catch((error) => {
console.error('🔴 STARTUP FAILED');
console.error(error);
process.exit(1);
});
