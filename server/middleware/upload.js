const multer = require('multer');
const cloudinary = require('../config/cloudinary');
const { CloudinaryStorage } = require('multer-storage-cloudinary');

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'legalvault/pdfs',
    resource_type: 'raw',  // ✅ 'raw' explicitly set karo
    format: async (req, file) => 'pdf',
    public_id: (req, file) => `${Date.now()}-${file.originalname.split('.')[0]}`,
    upload_preset: 'mycloud'
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed'), false);
    }
  }
});

module.exports = upload;