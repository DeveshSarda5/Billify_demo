const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

let memoryServer;

function isLocalMongoUri(uri) {
  return /^mongodb:\/\/(localhost|127\.0\.0\.1|\[::1\])(?::\d+)?\//i.test(uri);
}

async function connectWithUri(uri) {
  await mongoose.connect(uri);
}

async function startInMemoryMongo() {
  console.warn('⚠️  Local MongoDB is unavailable. Falling back to an in-memory MongoDB instance for development.');
  memoryServer = await MongoMemoryServer.create({
    instance: {
      dbName: 'billify',
    },
  });

  const inMemoryUri = memoryServer.getUri();
  await connectWithUri(inMemoryUri);
  process.env.MONGO_URI = inMemoryUri;
  console.log('✅ In-memory MongoDB started for development');
}

async function stopInMemoryMongo() {
  if (!memoryServer) {
    return;
  }

  await memoryServer.stop();
  memoryServer = null;
}

process.once('SIGINT', () => {
  stopInMemoryMongo().finally(() => process.exit(0));
});

process.once('SIGTERM', () => {
  stopInMemoryMongo().finally(() => process.exit(0));
});

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
    await connectWithUri(process.env.MONGO_URI);
    
    console.log('✅ MongoDB Connected Successfully');
  } catch (err) {
    const mongoUri = process.env.MONGO_URI || '';
    const allowFallback = process.env.NODE_ENV !== 'production' && isLocalMongoUri(mongoUri);

    if (allowFallback) {
      try {
        await startInMemoryMongo();
        return;
      } catch (memoryError) {
        console.error('❌ MongoDB Connection Failed:');
        console.error('   Primary Error:', err.message);
        console.error('   Fallback Error:', memoryError.message);
        console.error('');
        process.exit(1);
      }
    }

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
