const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const upload = require('../middleware/uploadGridFS');
const { getGridFS } = require('../config/gridfs');
const PDF = require('../models/PDF');
const { ObjectId } = require('mongodb');
const jwt = require('jsonwebtoken');

// ✅ Upload PDF
router.post('/pdf', auth, upload.single('pdf'), async (req, res) => {
  try {
    console.log('📥 Upload request received');
    
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const bucket = getGridFS();
    const { clientId, registrationId } = req.body;

    const uploadStream = bucket.openUploadStream(req.file.originalname, {
      contentType: req.file.mimetype,
      metadata: {
        uploadedBy: req.user.id,
        clientId: clientId || null,
        registrationId: registrationId || null,
        uploadDate: new Date()
      }
    });

    uploadStream.end(req.file.buffer);

    uploadStream.on('finish', async () => {
      const pdfDoc = new PDF({
        filename: req.file.originalname,
        contentType: req.file.mimetype,
        size: req.file.size,
        uploadedBy: req.user.id,
        clientId: clientId || null,
        registrationId: registrationId || null,
        fileId: uploadStream.id
      });

      await pdfDoc.save();

      const host = req.get('host');
      const protocol = 'https';
      const url = `${protocol}://${host}/api/pdfs/${uploadStream.id}`;

      res.json({
        message: 'PDF uploaded successfully',
        url: url,
        fileId: uploadStream.id
      });
    });

    uploadStream.on('error', (error) => {
      console.error('Upload error:', error);
      res.status(500).json({ message: 'Upload failed' });
    });

  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ message: error.message });
  }
});

// ✅ Get PDF by ID (with query param token support) - ADD THIS ROUTE
router.get('/:id', async (req, res) => {
  try {
    let token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) {
      token = req.query.token;
    }
    
    console.log('🔑 PDF Access - Token received:', token ? '✅ Yes' : '❌ No');

    if (!token) {
      return res.status(401).json({ message: 'Access Denied. No token provided.' });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log('✅ PDF Access - User verified:', decoded.email);
    } catch (error) {
      console.error('❌ PDF Access - Token verification failed:', error.message);
      return res.status(401).json({ message: 'Invalid token.' });
    }

    const fileId = new ObjectId(req.params.id);
    const pdfDoc = await PDF.findOne({ fileId });
    if (!pdfDoc) {
      return res.status(404).json({ message: 'PDF not found' });
    }

    const bucket = getGridFS();
    const downloadStream = bucket.openDownloadStream(fileId);

    res.setHeader('Content-Type', pdfDoc.contentType);
    res.setHeader('Content-Disposition', `inline; filename="${pdfDoc.filename}"`);
    
    downloadStream.pipe(res);

    downloadStream.on('error', (error) => {
      console.error('Download error:', error);
      res.status(500).json({ message: 'Error downloading file' });
    });

  } catch (error) {
    console.error('PDF fetch error:', error);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;