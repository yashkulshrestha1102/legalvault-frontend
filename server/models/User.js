const mongoose = require('mongoose');

// ✅ 8 Folders List (Sirf reference ke liye)
const FOLDER_PERMISSIONS = [
  'registrations', 'contracts', 'policies', 'corporate-secretariat',
  'hr', 'gst', 'income-tax', 'financials'
];

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, default: 'user' },
  department: { type: String, default: 'General' },
  phone: { type: String, default: '' },
  status: { type: String, enum: ['Active', 'Inactive'], default: 'Active' },
  // ✅ Folder Permissions - Bina enum validation ke
  folderPermissions: {
    type: [String],
    default: []
  },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', UserSchema);