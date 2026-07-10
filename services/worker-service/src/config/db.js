const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Worker service: MongoDB connected');
  } catch (error) {
    console.error('Worker service: MongoDB connection failed', error.message);
    process.exit(1);
  }
};

module.exports = connectDB;
