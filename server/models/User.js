const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true }, // ✅ Yehi se index ban raha hai
  password: { type: String, required: true },
  role: { type: String, default: 'user' },
  department: { type: String, default: 'General' },
  phone: { type: String, default: '' },
  status: { 
    type: String, 
    enum: ['Active', 'Inactive'], 
    default: 'Active' 
  },
  folderPermissions: {
    type: [String],
    default: []
  },
  resetPasswordToken: { type: String },
  resetPasswordExpires: { type: Date },
  isDeleted: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

// ✅ Sirf extra indexes (jo unique:true se nahi ban rahe)
UserSchema.index({ role: 1 });
UserSchema.index({ status: 1 });
UserSchema.index({ isDeleted: 1 });

module.exports = mongoose.model('User', UserSchema);