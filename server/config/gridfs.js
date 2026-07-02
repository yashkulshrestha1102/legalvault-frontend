const { MongoClient } = require('mongodb');
const { GridFSBucket } = require('mongodb');

let gridFSBucket;
let mongoClient;

const initGridFS = async () => {
  try {
    const uri = process.env.MONGO_URI;
    const client = new MongoClient(uri);
    await client.connect();
    
    const db = client.db('legalvault');
    gridFSBucket = new GridFSBucket(db, { bucketName: 'pdfs' });
    mongoClient = client;
    
    console.log('✅ GridFS initialized');
    return gridFSBucket;
  } catch (error) {
    console.error('❌ GridFS init failed:', error);
    throw error;
  }
};

const getGridFS = () => {
  if (!gridFSBucket) throw new Error('GridFS not initialized');
  return gridFSBucket;
};

module.exports = { initGridFS, getGridFS };