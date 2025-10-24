// config/database.js - MongoDB database connection configuration

const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    // Default MongoDB connection string for local development
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/socketio_chat';
    
    const conn = await mongoose.connect(mongoURI);

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    console.log(`📂 Database Name: ${conn.connection.name}`);
    
    return conn;
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message);
    console.log('🔄 Server will continue without database. Install MongoDB to enable data persistence.');
    console.log('📖 See MONGODB_SETUP.md for installation instructions.');
    return null;
  }
};

// Handle connection events
mongoose.connection.on('connected', () => {
  console.log('Mongoose connected to MongoDB');
});

mongoose.connection.on('error', (err) => {
  console.error('Mongoose connection error:', err);
});

mongoose.connection.on('disconnected', () => {
  console.log('Mongoose disconnected from MongoDB');
});

// Graceful shutdown
process.on('SIGINT', async () => {
  await mongoose.connection.close();
  console.log('MongoDB connection closed through app termination');
  process.exit(0);
});

module.exports = connectDB;