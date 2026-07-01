const multer = require('multer');
const cloudinary = require('../config/cloudinary');
const { CloudinaryStorage } = require('multer-storage-cloudinary');

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'legalvault/pdfs',
    resource_type: 'raw',  // ✅ raw hi rakho
    format: async (req, file) => 'pdf',
    public_id: (req, file) => `${Date.now()}-${file.originalname.split('.')[0]}`,
    // ✅ PDF ko inline view karne ke liye
    transformation: [{ flags: 'attachment' }]
  }
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype === 'application/pdf') {
    cb(null, true);
  } else {
    cb(new Error('Only PDF files are allowed'), false);
  }
};

const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: fileFilter
});

module.exports = upload;