const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Analytics service: MongoDB connected (read-only)');
  } catch (error) {
    console.error('Analytics service: MongoDB connection failed', error.message);
    process.exit(1);
  }
};

module.exports = connectDB;
