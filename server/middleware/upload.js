const multer = require('multer');
const cloudinary = require('../config/cloudinary');
const { CloudinaryStorage } = require('multer-storage-cloudinary');

// ✅ CloudinaryStorage with upload preset
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'legalvault/pdfs',
    resource_type: 'auto',  // ✅ 'raw' ki jagah 'auto' (kyunki preset public hai)
    format: async (req, file) => 'pdf',
    public_id: (req, file) => `${Date.now()}-${file.originalname.split('.')[0]}`,
    // ✅ Upload preset use karo jo public hai
    upload_preset: 'mycloud'  // ✅ Tumhara preset name
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