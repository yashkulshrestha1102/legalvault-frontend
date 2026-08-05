const { GridFSBucket } = require('mongodb');

let gridFSBucket;

const initGridFS = () => {
  try {
    const db = require('mongoose').connection.db;
    gridFSBucket = new GridFSBucket(db, { bucketName: 'uploads' });
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