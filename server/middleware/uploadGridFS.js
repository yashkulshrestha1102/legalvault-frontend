const multer = require('multer');
const path = require('path');

// ✅ Storage
const storage = multer.memoryStorage();

// ✅ File filter
const fileFilter = (req, file, cb) => {
  console.log('🔍 Multer - File received:', file.fieldname, file.originalname);
  const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type'), false);
  }
};

// ✅ Upload middleware — field name 'document'
const upload = multer({
  storage: storage,
  limits: { fileSize: 50 * 1024 * 1024 },
  fileFilter: fileFilter
});

// ✅ Export with field name 'document'
module.exports = upload;