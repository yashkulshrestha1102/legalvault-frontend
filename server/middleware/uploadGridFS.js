const multer = require('multer');
const path = require('path');

// ✅ Storage
const storage = multer.memoryStorage();

// ✅ File filter — accept both 'pdf' and 'document'
const fileFilter = (req, file, cb) => {
  console.log('🔍 Multer - File received:', file.fieldname, file.originalname);
  
  // ✅ Accept both 'pdf' and 'document' field names
  if (file.fieldname === 'pdf' || file.fieldname === 'document') {
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only PDF, JPEG, PNG allowed.'), false);
    }
  } else {
    return cb(new Error(`Unexpected field: ${file.fieldname}`), false);
  }
};

// ✅ Upload middleware
const upload = multer({
  storage: storage,
  limits: { fileSize: 50 * 1024 * 1024 },
  fileFilter: fileFilter
});

module.exports = upload;