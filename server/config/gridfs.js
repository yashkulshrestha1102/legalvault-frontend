const { MongoClient } = require('mongodb');
const { GridFSBucket } = require('mongodb');

let gridFSBucket;

const initGridFS = async () => {
  try {
    const uri = process.env.MONGO_URI;
    if (!uri) {
      throw new Error('MONGO_URI is not defined');
    }
    
    const client = new MongoClient(uri);
    await client.connect();
    
    const db = client.db('legalvault');
    gridFSBucket = new GridFSBucket(db, { bucketName: 'pdfs' });
    
    console.log('✅ GridFS initialized successfully');
    return gridFSBucket;
  } catch (error) {
    console.error('❌ GridFS init failed:', error);
    throw error;
  }
};

const getGridFS = () => {
  if (!gridFSBucket) {
    throw new Error('GridFS not initialized');
  }
  return gridFSBucket;
};

module.exports = { initGridFS, getGridFS };