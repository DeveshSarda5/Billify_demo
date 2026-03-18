const mongoose = require('mongoose');

const connectDB = async () => {
  // Validate that MONGO_URI is set
  if (!process.env.MONGO_URI) {
    console.error('❌ FATAL ERROR: MONGO_URI environment variable is not set');
    console.error('   Please create a .env file with your MongoDB connection string');
    console.error('   See .env.example for the required format');
    process.exit(1);
  }

  try {
    console.log('👉 Attempting to connect to MongoDB...');
    
    await mongoose.connect(process.env.MONGO_URI);
    
    console.log('✅ MongoDB Connected Successfully');
  } catch (err) {
    console.error('❌ MongoDB Connection Failed:');
    console.error('   Error:', err.message);
    console.error('');
    console.error('   Troubleshooting:');
    console.error('   1. Verify MONGO_URI is correct in .env file');
    console.error('   2. For MongoDB Atlas: Check username/password');
    console.error('   3. For MongoDB Atlas: Whitelist your IP address');
    console.error('   4. Test connection: mongosh <your-connection-string>');
    console.error('');
    process.exit(1);
  }
};

module.exports = connectDB;
