const mongoose = require('mongoose');

const ClientSchema = new mongoose.Schema({
  name: { type: String, required: true },
  company: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String, required: true },
  status: { type: String, enum: ['Active', 'Inactive'], default: 'Active' },
  contactPerson: { type: String, default: '' },
  onboardingDate: { type: String, default: '' },
  // ✅ New fields for access control
  assignedTo: {
    type: [mongoose.Schema.Types.ObjectId],
    ref: 'User',
    default: []
  },
  folderPermissions: {
    type: [String],
    default: []
  },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  isDeleted: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

// ✅ Indexes
ClientSchema.index({ email: 1 }, { unique: true });
ClientSchema.index({ status: 1 });
ClientSchema.index({ isDeleted: 1 });
ClientSchema.index({ assignedTo: 1 });

module.exports = mongoose.model('Client', ClientSchema);