// const express = require('express');
// const router = express.Router();
// const auth = require('../middleware/auth');
// const upload = require('../middleware/uploadGridFS');
// const { getGridFS } = require('../config/gridfs');
// const PDF = require('../models/PDF');
// // const GSTAutomation = require('../models/GSTAutomation'); // ✅ REMOVED
// const { ObjectId } = require('mongodb');
// const jwt = require('jsonwebtoken');

// // ✅ Upload Multiple PDFs
// router.post('/pdf', auth, upload.array('pdf', 10), async (req, res) => {
//   try {
//     console.log('📥 Upload request received - Files:', req.files?.length || 0);
    
//     if (!req.files || req.files.length === 0) {
//       return res.status(400).json({ message: 'No files uploaded' });
//     }

//     const bucket = getGridFS();
//     const { clientId, registrationId, automationId } = req.body;
//     const uploadedFiles = [];

//     for (const file of req.files) {
//       const uploadStream = bucket.openUploadStream(file.originalname, {
//         contentType: file.mimetype,
//         metadata: {
//           uploadedBy: req.user.id,
//           clientId: clientId || null,
//           registrationId: registrationId || null,
//           automationId: automationId || null,
//           uploadDate: new Date()
//         }
//       });

//       uploadStream.end(file.buffer);

//       await new Promise((resolve, reject) => {
//         uploadStream.on('finish', async () => {
//           const pdfDoc = new PDF({
//             filename: file.originalname,
//             contentType: file.mimetype,
//             size: file.size,
//             uploadedBy: req.user.id,
//             clientId: clientId || null,
//             registrationId: registrationId || null,
//             automationId: automationId || null,
//             fileId: uploadStream.id
//           });
//           await pdfDoc.save();

//           // ✅ Automation linking disabled - model removed
//           // if (automationId) {
//           //   await GSTAutomation.findByIdAndUpdate(automationId, {
//           //     $push: { documents: { fileId: pdfDoc._id, fileName: file.originalname, fileType: file.mimetype } }
//           //   });
//           // }

//           const host = req.get('host');
//           const protocol = 'https';
//           const url = `${protocol}://${host}/api/pdfs/${uploadStream.id}`;

//           uploadedFiles.push({
//             url: url,
//             fileId: uploadStream.id,
//             filename: file.originalname,
//             size: file.size,
//             contentType: file.mimetype
//           });

//           resolve();
//         });

//         uploadStream.on('error', (error) => {
//           console.error('Upload error:', error);
//           reject(error);
//         });
//       });
//     }

//     res.json({
//       message: 'PDFs uploaded successfully',
//       files: uploadedFiles,
//       urls: uploadedFiles.map(f => f.url)
//     });

//   } catch (error) {
//     console.error('Upload error:', error);
//     res.status(500).json({ message: error.message });
//   }
// });

// // ✅ Get PDF by ID
// router.get('/:id', async (req, res) => {
//   try {
//     let token = req.header('Authorization')?.replace('Bearer ', '');
//     if (!token) token = req.query.token;
    
//     console.log('🔑 PDF Access - Token received:', token ? '✅ Yes' : '❌ No');

//     if (!token) {
//       return res.status(401).json({ message: 'Access Denied. No token provided.' });
//     }

//     let decoded;
//     try {
//       decoded = jwt.verify(token, process.env.JWT_SECRET);
//       console.log('✅ PDF Access - User verified:', decoded.email);
//     } catch (error) {
//       console.error('❌ PDF Access - Token verification failed:', error.message);
//       return res.status(401).json({ message: 'Invalid token.' });
//     }

//     const fileId = new ObjectId(req.params.id);
//     const pdfDoc = await PDF.findOne({ fileId });
//     if (!pdfDoc) {
//       return res.status(404).json({ message: 'PDF not found' });
//     }

//     const bucket = getGridFS();
//     const downloadStream = bucket.openDownloadStream(fileId);

//     res.setHeader('Content-Type', pdfDoc.contentType);
//     res.setHeader('Content-Disposition', `inline; filename="${pdfDoc.filename}"`);
    
//     downloadStream.pipe(res);

//     downloadStream.on('error', (error) => {
//       console.error('Download error:', error);
//       res.status(500).json({ message: 'Error downloading file' });
//     });

//   } catch (error) {
//     console.error('PDF fetch error:', error);
//     res.status(500).json({ message: error.message });
//   }
// });

// // ✅ Upload for Automation (without GST linking)
// router.post('/automation-upload', auth, upload.single('document'), async (req, res) => {
//   try {
//     console.log('🚀 ===== UPLOAD STARTED =====');
//     console.log('📤 req.file:', req.file);
//     console.log('📦 req.body:', req.body);
//     console.log('👤 req.user:', req.user?.id);

//     if (!req.file) {
//       console.log('❌ No file in request');
//       return res.status(400).json({ message: 'No file uploaded' });
//     }

//     let bucket;
//     try {
//       bucket = getGridFS();
//       console.log('✅ GridFS bucket obtained');
//     } catch (gridFSError) {
//       console.error('❌ GridFS error:', gridFSError);
//       return res.status(500).json({ 
//         message: 'GridFS not initialized', 
//         error: gridFSError.message 
//       });
//     }

//     const { automationId } = req.body;
//     console.log('📎 automationId:', automationId);

//     // ✅ Upload to GridFS
//     console.log('📤 Starting GridFS upload...');
//     const uploadStream = bucket.openUploadStream(req.file.originalname, {
//       contentType: req.file.mimetype,
//       metadata: {
//         uploadedBy: req.user.id,
//         automationId: automationId || null,
//         uploadDate: new Date()
//       }
//     });

//     uploadStream.end(req.file.buffer);
//     console.log('✅ Buffer written to stream');

//     const fileId = await new Promise((resolve, reject) => {
//       uploadStream.on('finish', () => {
//         console.log('✅ GridFS upload complete, ID:', uploadStream.id);
//         resolve(uploadStream.id);
//       });
//       uploadStream.on('error', (error) => {
//         console.error('❌ GridFS stream error:', error);
//         reject(error);
//       });
//     });

//     console.log('📝 fileId:', fileId);

//     // ✅ Verify file exists in GridFS
//     const files = await bucket.find({ _id: fileId }).toArray();
//     console.log('🔍 GridFS files found:', files.length);
//     if (files.length === 0) {
//       console.error('❌ File not saved in GridFS!');
//       return res.status(500).json({ message: 'File upload failed - not saved in storage' });
//     }
//     console.log('✅ File verified in GridFS:', files[0].filename);

//     // ✅ Save to DB
//     console.log('💾 Saving to database...');
//     const pdfDoc = new PDF({
//       filename: req.file.originalname,
//       contentType: req.file.mimetype,
//       size: req.file.size,
//       uploadedBy: req.user.id,
//       automationId: automationId || null,
//       fileId: fileId
//     });

//     await pdfDoc.save();
//     console.log('✅ Document saved to DB, _id:', pdfDoc._id);

//     // ✅ Automation linking disabled - model removed
//     // if (automationId) {
//     //   await GSTAutomation.findByIdAndUpdate(automationId, {
//     //     $push: { documents: { fileId: pdfDoc._id, fileName: req.file.originalname, fileType: req.file.mimetype } }
//     //   });
//     //   console.log('✅ Document linked to automation:', automationId);
//     // }

//     res.status(201).json({
//       message: 'Document uploaded successfully',
//       _id: pdfDoc._id,
//       gridfsId: fileId,
//       name: req.file.originalname,
//       size: req.file.size,
//       type: req.file.mimetype,
//       createdAt: pdfDoc.createdAt
//     });

//   } catch (error) {
//     console.error('❌ ===== UPLOAD FAILED =====');
//     console.error('❌ Error name:', error.name);
//     console.error('❌ Error message:', error.message);
//     console.error('❌ Error stack:', error.stack);
    
//     res.status(500).json({ 
//       message: 'Upload failed', 
//       error: error.message,
//       name: error.name,
//       stack: error.stack
//     });
//   }
// });

// // ✅ Delete document
// router.delete('/:id', auth, async (req, res) => {
//   try {
//     const fileId = new ObjectId(req.params.id);
//     const pdfDoc = await PDF.findOne({ fileId });
//     if (!pdfDoc) {
//       return res.status(404).json({ message: 'Document not found' });
//     }

//     const bucket = getGridFS();
//     await bucket.delete(fileId);
//     await pdfDoc.deleteOne();

//     res.json({ message: 'Document deleted successfully' });
//   } catch (error) {
//     console.error('❌ Delete error:', error);
//     res.status(500).json({ message: error.message });
//   }
// });

// module.exports = router;





const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const multer = require('multer');
const { getGridFS } = require('../config/gridfs');
const PDF = require('../models/PDF');
const { ObjectId } = require('mongodb');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');

// ✅ Multer memory storage
const storage = multer.memoryStorage();
const upload = multer({ 
  storage: storage,
  limits: { fileSize: 100 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
    if (file.fieldname !== 'pdf' && file.fieldname !== 'document') {
      return cb(new Error('Unexpected field: ' + file.fieldname));
    }
    // ✅ Ab PDF ke alawa images bhi allow karega
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('File type not allowed: ' + file.mimetype));
    }
  }
});

// ✅ Upload Multiple PDFs
router.post('/pdf', auth, upload.array('pdf', 10), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: 'No files uploaded' });
    }

    const bucket = getGridFS();
    if (!bucket) return res.status(500).json({ message: 'GridFS not available' });

    const { clientId, registrationId, automationId } = req.body;
    const uploadedFiles = [];

    for (const file of req.files) {
      const uploadStream = bucket.openUploadStream(file.originalname, {
        contentType: file.mimetype,
        metadata: { uploadedBy: req.user.id, clientId, registrationId, automationId, uploadDate: new Date() }
      });
      uploadStream.write(file.buffer);
      uploadStream.end();

      const fileId = await new Promise((resolve, reject) => {
        uploadStream.on('finish', () => resolve(uploadStream.id));
        uploadStream.on('error', (err) => reject(err));
      });

      const pdfDoc = new PDF({
        filename: file.originalname, contentType: file.mimetype, size: file.size,
        uploadedBy: req.user.id, clientId, registrationId, automationId, fileId
      });
      await pdfDoc.save();

      const host = req.get('host');
      const url = `https://${host}/api/pdfs/${fileId}`;
      uploadedFiles.push({ url, fileId, filename: file.originalname, size: file.size, contentType: file.mimetype });
    }

    res.json({ message: 'PDFs uploaded successfully', files: uploadedFiles, urls: uploadedFiles.map(f => f.url) });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ message: error.message });
  }
});

// ✅ Get PDF by ID (Same as before)
router.get('/:id', async (req, res) => {
  try {
    let token = req.header('Authorization')?.replace('Bearer ', '') || req.query.token;
    if (!token) return res.status(401).json({ message: 'Access Denied' });
    try { jwt.verify(token, process.env.JWT_SECRET); } catch (error) { return res.status(401).json({ message: 'Invalid token' }); }

    const fileId = new ObjectId(req.params.id);
    const pdfDoc = await PDF.findOne({ fileId });
    if (!pdfDoc) return res.status(404).json({ message: 'PDF not found' });

    const bucket = getGridFS();
    if (!bucket) return res.status(500).json({ message: 'GridFS not available' });

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

// ✅ Delete document
router.delete('/:id', auth, async (req, res) => {
  try {
    const fileId = new ObjectId(req.params.id);
    const pdfDoc = await PDF.findOne({ fileId });
    if (!pdfDoc) return res.status(404).json({ message: 'Document not found' });

    const bucket = getGridFS();
    if (!bucket) return res.status(500).json({ message: 'GridFS not available' });

    await bucket.delete(fileId);
    await pdfDoc.deleteOne();
    res.json({ message: 'Document deleted successfully' });
  } catch (error) {
    console.error('Delete error:', error);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;