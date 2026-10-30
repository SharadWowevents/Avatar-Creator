const mongoose = require('mongoose');

let isConnected = false;

const connectDB = async () => {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/avatar-app';
  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 3000, // Quick timeout if Mongo isn't running locally
    });
    isConnected = true;
    console.log(`[MongoDB] Connected successfully: ${conn.connection.host}`);
  } catch (err) {
    isConnected = false;
    console.warn(`[MongoDB] Connection failed: ${err.message}`);
    console.warn('[MongoDB] Falling back to memory/file storage mode for avatars.');
  }
};

const getStatus = () => isConnected;

module.exports = { connectDB, getStatus };

