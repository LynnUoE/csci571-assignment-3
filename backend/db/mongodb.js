const { MongoClient } = require('mongodb');

let db = null;
let client = null;

async function connectDB() {
  try {
    if (db) {
      return db;
    }

    const uri = process.env.MONGODB_URI;
    
    if (!uri) {
      throw new Error('MONGODB_URI is not defined in environment variables');
    }

    client = new MongoClient(uri, {
      serverSelectionTimeoutMS: 5000,
    });

    await client.connect();
    console.log('✅ Connected to MongoDB Atlas');
    
    db = client.db('eventsDB'); // Database name
    return db;
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    throw error;
  }
}

async function getDB() {
  if (!db) {
    await connectDB();
  }
  return db;
}

async function closeDB() {
  if (client) {
    await client.close();
    db = null;
    client = null;
    console.log('MongoDB connection closed');
  }
}

module.exports = { connectDB, getDB, closeDB };