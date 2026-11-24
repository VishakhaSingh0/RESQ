
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
    console.log('MongoDB connected:', mongoose.connection.readyState);

mongoose.connection.on('disconnected', () => {
  console.log('MongoDB DISCONNECTED event detected');
});
    console.log('NEXORA connected to MongoDB');
    return true;
  } catch (error) {
  console.error('MongoDB connection failed:', error.message);
  console.error('Detailed server errors:');
  console.dir(error.reason, { depth: 5 });
  return false;
}
}

module.exports = connectDB;


