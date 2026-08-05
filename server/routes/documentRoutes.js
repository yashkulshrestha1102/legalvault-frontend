const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const upload = require('../middleware/uploadGridFS'); // ✅ GridFS upload
const { getGridFS } = require('../config/gridfs');
const Document = require('../models/Document');
const { ObjectId } = require('mongodb');
const jwt = require('jsonwebtoken');

// ✅ Upload multiple documents (GridFS)
router.post('/upload', auth, upload.array('documents', 50), async (req, res) => {
  try {
    console.log('📥 Upload request - Files:', req.files?.length || 0);
        console.log('📥 Body:', req.body);

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: 'No files uploaded' });
    }

    const bucket = getGridFS();
    const { clientId } = req.body;
    const uploadedFiles = [];

    for (const file of req.files) {
      const uploadStream = bucket.openUploadStream(file.originalname, {
        contentType: file.mimetype,
        metadata: {
          uploadedBy: req.user.id,
          clientId: clientId || null,
          uploadDate: new Date()
        }
      });

      uploadStream.end(file.buffer);

      await new Promise((resolve, reject) => {
        uploadStream.on('finish', async () => {
          const host = req.get('host');
          const protocol = req.protocol === 'https' ? 'https' : 'http';
          const url = `${protocol}://${host}/api/documents/${uploadStream.id}`;

          const doc = new Document({
            clientId: clientId,
            filename: file.originalname,
            originalName: file.originalname,
            fileType: file.mimetype.startsWith('image/') ? 'image' : 
                     file.mimetype === 'application/pdf' ? 'pdf' : 'document',
            fileSize: file.size,
            fileUrl: url,
            fileId: uploadStream.id,
            mimeType: file.mimetype,
            uploadedBy: req.user.id
          });
          await doc.save();

          uploadedFiles.push({
            id: doc._id,
            url: url,
            fileId: uploadStream.id,
            filename: file.originalname,
            size: file.size,
            mimeType: file.mimetype
          });

          resolve();
        });

        uploadStream.on('error', (error) => {
          console.error('Upload error:', error);
          reject(error);
        });
      });
    }

    res.json({
      message: `${uploadedFiles.length} files uploaded successfully`,
      files: uploadedFiles
    });

  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ message: error.message });
  }
});

// ✅ Rename document
router.put('/:id/rename', auth, async (req, res) => {
  try {
    const { newName } = req.body;
    if (!newName || newName.trim() === '') {
      return res.status(400).json({ message: 'New name is required' });
    }

    const doc = await Document.findOneAndUpdate(
      { _id: req.params.id, isDeleted: false },
      { 
        $set: { 
          filename: newName.trim(),
          originalName: newName.trim()
        } 
      },
      { new: true }
    );
    
    if (!doc) {
      return res.status(404).json({ message: 'Document not found' });
    }
    
    res.json({ 
      message: 'Document renamed successfully', 
      document: doc 
    });
  } catch (error) {
    console.error('Rename error:', error);
    res.status(500).json({ message: error.message });
  }
});

// ✅ Get all documents for a client
router.get('/client/:clientId', auth, async (req, res) => {
  try {
    const documents = await Document.find({ 
      clientId: req.params.clientId,
      isDeleted: false 
    }).sort({ createdAt: -1 });
    res.json(documents);
  } catch (error) {
    console.error('Error fetching documents:', error);
    res.status(500).json({ message: error.message });
  }
});

// ✅ Delete document (Soft delete)
router.delete('/:id', auth, async (req, res) => {
  try {
    const doc = await Document.findOneAndUpdate(
      { _id: req.params.id, isDeleted: false },
      { isDeleted: true },
      { new: true }
    );
    if (!doc) {
      return res.status(404).json({ message: 'Document not found' });
    }
    res.json({ message: 'Document deleted successfully' });
  } catch (error) {
    console.error('Delete error:', error);
    res.status(500).json({ message: error.message });
  }
});

// ✅ Get document by ID (GridFS)
router.get('/:id', async (req, res) => {
  try {
    let token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) {
      token = req.query.token;
    }
    
    if (!token) {
      return res.status(401).json({ message: 'Access Denied. No token provided.' });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
      return res.status(401).json({ message: 'Invalid token.' });
    }

    const fileId = new ObjectId(req.params.id);
    const doc = await Document.findOne({ fileId, isDeleted: false });
    if (!doc) {
      return res.status(404).json({ message: 'Document not found' });
    }

    const bucket = getGridFS();
    const downloadStream = bucket.openDownloadStream(fileId);

    res.setHeader('Content-Type', doc.mimeType);
    res.setHeader('Content-Disposition', `inline; filename="${doc.filename}"`);
    
    downloadStream.pipe(res);

    downloadStream.on('error', (error) => {
      console.error('Download error:', error);
      res.status(500).json({ message: 'Error downloading file' });
    });

  } catch (error) {
    console.error('Document fetch error:', error);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;