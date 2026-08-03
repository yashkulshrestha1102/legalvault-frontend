const multer = require('multer');

// ✅ Simple memory storage
const storage = multer.memoryStorage();

// ✅ File filter
const fileFilter = (req, file, cb) => {
  console.log('🔍 Multer - File:', file.fieldname, file.originalname);
  
  if (file.fieldname === 'document') {
    cb(null, true);
  } else {
    cb(new Error(`Unexpected field: ${file.fieldname}`), false);
  }
};

// ✅ Single upload middleware
const upload = multer({
  storage: storage,
  limits: { fileSize: 50 * 1024 * 1024 },
  fileFilter: fileFilter
});

module.exports = upload;