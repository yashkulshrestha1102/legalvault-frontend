const mongoose = require('mongoose');

const DocumentSchema = new mongoose.Schema({
  registrationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Registration' },
  contractId: { type: mongoose.Schema.Types.ObjectId, ref: 'Contract' },
  clientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Client' },
  filename: { type: String, required: true },
  fileType: { type: String, enum: ['pdf', 'image'], required: true },
  fileUrl: { type: String, required: true },
  fileId: { type: mongoose.Schema.Types.ObjectId, required: true },
  uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  uploadedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Document', DocumentSchema);