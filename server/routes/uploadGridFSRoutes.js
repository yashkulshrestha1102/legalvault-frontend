const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const upload = require('../middleware/uploadGridFS');
const { getGridFS } = require('../config/gridfs');
const PDF = require('../models/PDF');
const { ObjectId } = require('mongodb');

// ✅ Upload PDF
router.post('/pdf', auth, upload.single('pdf'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });

    const bucket = getGridFS();
    const { clientId, registrationId } = req.body;

    const uploadStream = bucket.openUploadStream(req.file.originalname, {
      contentType: req.file.mimetype,
      metadata: { uploadedBy: req.user.id, clientId, registrationId }
    });

    uploadStream.end(req.file.buffer);

    uploadStream.on('finish', async () => {
      const pdfDoc = new PDF({
        filename: req.file.originalname,
        contentType: req.file.mimetype,
        size: req.file.size,
        uploadedBy: req.user.id,
        clientId,
        registrationId,
        fileId: uploadStream.id
      });
      await pdfDoc.save();

      res.json({
        message: 'PDF uploaded',
        url: `${req.protocol}://${req.get('host')}/api/pdfs/${uploadStream.id}`,
        fileId: uploadStream.id
      });
    });

    uploadStream.on('error', () => res.status(500).json({ message: 'Upload failed' }));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ✅ Get PDF by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const fileId = new ObjectId(req.params.id);
    const pdfDoc = await PDF.findOne({ fileId });
    if (!pdfDoc) return res.status(404).json({ message: 'PDF not found' });

    const bucket = getGridFS();
    const downloadStream = bucket.openDownloadStream(fileId);

    res.setHeader('Content-Type', pdfDoc.contentType);
    res.setHeader('Content-Disposition', `inline; filename="${pdfDoc.filename}"`);
    downloadStream.pipe(res);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;