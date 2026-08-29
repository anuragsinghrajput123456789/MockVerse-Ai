import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    const connUri = process.env.MONGODB_URI || process.env.DATABASE_URL || 'mongodb://127.0.0.1:27017/mockverse';

    const conn = await mongoose.connect(connUri, {
      serverSelectionTimeoutMS: 10000, // Fail fast if no server found within 10s
      socketTimeoutMS: 45000,          // Close sockets after 45s of inactivity
      heartbeatFrequencyMS: 10000,     // Check server health every 10s
    });

    // Log only host — never log the full URI (may contain credentials)
    console.log(`MongoDB Connected: ${conn.connection.host}`);

    // Connection event listeners for observability
    mongoose.connection.on('disconnected', () => {
      console.warn('MongoDB disconnected. Attempting to reconnect...');
    });

    mongoose.connection.on('error', (err) => {
      console.error('MongoDB connection error:', err.message);
    });

    mongoose.connection.on('reconnected', () => {
      console.log('MongoDB reconnected successfully.');
    });
  } catch (error) {
    console.error(`MongoDB Connection Error: ${error.message}`);
    process.exit(1);
  }
};

export default connectDB;
export { mongoose };
