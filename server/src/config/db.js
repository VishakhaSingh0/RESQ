
const mongoose = require('mongoose');

async function connectDB() {
  const mongoURI = process.env.MONGODB_URI;

  if (!mongoURI) {
    console.warn(
      'MONGODB_URI is missing. Database connection skipped.'
    );
    return false;
  }

  try {
    await mongoose.connect(mongoURI);
    console.log('RESQ connected to MongoDB');
    return true;
  } catch (error) {
    console.error('MongoDB connection failed:', error.message);
    return false;
  }
}

module.exports = connectDB;


