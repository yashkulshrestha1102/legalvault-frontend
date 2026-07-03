const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const upload = require('../middleware/uploadGridFS');
const { getGridFS } = require('../config/gridfs');
const Document = require('../models/Document');
const { ObjectId } = require('mongodb');
const jwt = require('jsonwebtoken');

// ✅ Test route - Check if router is working
router.get('/test', (req, res) => {
  res.json({ message: 'PDF routes are working!' });
});

// ✅ Upload Multiple Documents
router.post('/documents', auth, upload.array('documents', 10), async (req, res) => {
  try {
    console.log('📥 Documents upload request received');
    
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: 'No files uploaded' });
    }

    const bucket = getGridFS();
    const { registrationId, contractId, clientId } = req.body;
    const uploadedFiles = [];

    for (const file of req.files) {
      const uploadStream = bucket.openUploadStream(file.originalname, {
        contentType: file.mimetype,
        metadata: {
          uploadedBy: req.user.id,
          registrationId: registrationId || null,
          contractId: contractId || null,
          clientId: clientId || null,
          uploadDate: new Date()
        }
      });

      uploadStream.end(file.buffer);

      const fileId = await new Promise((resolve, reject) => {
        uploadStream.on('finish', () => resolve(uploadStream.id));
        uploadStream.on('error', reject);
      });

      const fileType = file.mimetype === 'application/pdf' ? 'pdf' : 'image';
      const fileUrl = `https://${req.get('host')}/api/documents/${fileId}`;

      const doc = new Document({
        registrationId: registrationId || null,
        contractId: contractId || null,
        clientId: clientId || null,
        filename: file.originalname,
        fileType: fileType,
        fileUrl: fileUrl,
        fileId: fileId,
        uploadedBy: req.user.id
      });

      await doc.save();

      uploadedFiles.push({
        id: doc._id,
        filename: file.originalname,
        fileType: fileType,
        url: fileUrl
      });
    }

    res.json({
      message: 'Documents uploaded successfully',
      files: uploadedFiles
    });

  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ message: error.message });
  }
});

// ✅ Get Document by ID
router.get('/documents/:id', async (req, res) => {
  try {
    let token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) token = req.query.token;
    
    if (!token) {
      return res.status(401).json({ message: 'Access Denied. No token provided.' });
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
      return res.status(401).json({ message: 'Invalid token.' });
    }

    const fileId = new ObjectId(req.params.id);
    const doc = await Document.findOne({ fileId });
    if (!doc) {
      return res.status(404).json({ message: 'Document not found' });
    }

    const bucket = getGridFS();
    const downloadStream = bucket.openDownloadStream(fileId);

    const contentType = doc.fileType === 'pdf' ? 'application/pdf' : 'image/jpeg';
    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Disposition', `inline; filename="${doc.filename}"`);
    
    downloadStream.pipe(res);
  } catch (error) {
    console.error('Document fetch error:', error);
    res.status(500).json({ message: error.message });
  }
});

// ✅ Get documents for registration
router.get('/registration/:registrationId', auth, async (req, res) => {
  try {
    const documents = await Document.find({ registrationId: req.params.registrationId })
      .populate('uploadedBy', 'name email');
    res.json(documents);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ✅ Get documents for contract
router.get('/contract/:contractId', auth, async (req, res) => {
  try {
    const documents = await Document.find({ contractId: req.params.contractId })
      .populate('uploadedBy', 'name email');
    res.json(documents);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;