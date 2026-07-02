const { MongoClient } = require('mongodb');
const { GridFSBucket } = require('mongodb');

let gridFSBucket;
let mongoClient;

const initGridFS = async () => {
  try {
    const uri = process.env.MONGO_URI;
    if (!uri) {
      throw new Error('MONGO_URI is not defined in environment variables');
    }
    
    const client = new MongoClient(uri);
    await client.connect();
    
    const db = client.db('legalvault');
    gridFSBucket = new GridFSBucket(db, { bucketName: 'pdfs' });
    mongoClient = client;
    
    console.log('✅ GridFS initialized successfully');
    return gridFSBucket;
  } catch (error) {
    console.error('❌ GridFS initialization failed:', error);
    throw error;
  }
};

const getGridFS = () => {
  if (!gridFSBucket) {
    throw new Error('GridFS not initialized. Call initGridFS() first.');
  }
  return gridFSBucket;
};

const getMongoClient = () => {
  if (!mongoClient) {
    throw new Error('MongoDB client not initialized. Call initGridFS() first.');
  }
  return mongoClient;
};

module.exports = { initGridFS, getGridFS, getMongoClient };