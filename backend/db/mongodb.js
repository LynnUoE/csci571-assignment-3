const { MongoClient } = require('mongodb');

let client;
let db;

async function connectDB() {
  if (db) return db;
  
  try {
    client = new MongoClient(process.env.MONGODB_URI);
    await client.connect();
    db = client.db('eventsDB');
    console.log('✅ Connected to MongoDB');
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

module.exports = { connectDB, getDB };