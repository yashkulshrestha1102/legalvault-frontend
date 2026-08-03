const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const upload = require('../middleware/uploadGridFS');
const { getGridFS } = require('../config/gridfs');
const PDF = require('../models/PDF');
const Automation = require('../models/Automation');

// ✅ Upload for Automation
router.post('/upload', auth, upload.single('document'), async (req, res) => {
  try {
    console.log('📤 Automation Upload - File:', req.file?.originalname);
    console.log('📦 req.body:', req.body);

    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const bucket = getGridFS();
    if (!bucket) {
      return res.status(500).json({ message: 'GridFS not initialized' });
    }

    const { automationId } = req.body;

    const uploadStream = bucket.openUploadStream(req.file.originalname, {
      contentType: req.file.mimetype,
      metadata: {
        uploadedBy: req.user.id,
        automationId: automationId || null,
        uploadDate: new Date()
      }
    });

    uploadStream.end(req.file.buffer);

    const fileId = await new Promise((resolve, reject) => {
      uploadStream.on('finish', () => {
        console.log('✅ GridFS upload complete, ID:', uploadStream.id);
        resolve(uploadStream.id);
      });
      uploadStream.on('error', (error) => {
        console.error('❌ GridFS upload error:', error);
        reject(error);
      });
    });

    const pdfDoc = new PDF({
      filename: req.file.originalname,
      contentType: req.file.mimetype,
      size: req.file.size,
      uploadedBy: req.user.id,
      automationId: automationId || null,
      fileId: fileId
    });

    await pdfDoc.save();
    console.log('✅ Document saved to DB:', pdfDoc._id);

    if (automationId) {
      await Automation.findByIdAndUpdate(automationId, {
        $push: { documents: pdfDoc._id }
      });
      console.log('✅ Document linked to automation:', automationId);
    }

    res.status(201).json({
      message: 'Document uploaded successfully',
      _id: pdfDoc._id,
      gridfsId: fileId,
      name: req.file.originalname,
      size: req.file.size,
      type: req.file.mimetype,
      createdAt: pdfDoc.createdAt
    });

  } catch (error) {
    console.error('❌ Upload error:', error);
    res.status(500).json({ 
      message: 'Upload failed', 
      error: error.message,
      stack: error.stack
    });
  }
});

module.exports = router;