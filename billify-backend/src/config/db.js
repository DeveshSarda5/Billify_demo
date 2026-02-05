const mongoose = require('mongoose');

const connectDB = async () => {
  console.log('👉 Trying to connect to MongoDB...');
  console.log('MONGO_URI =', process.env.MONGO_URI);

  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ MongoDB Connected');
  } catch (err) {
    console.error('❌ MongoDB Error FULL:', err);
    process.exit(1);
  }
};

module.exports = connectDB;
