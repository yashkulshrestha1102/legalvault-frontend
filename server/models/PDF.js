const mongoose = require('mongoose');

const PDFSchema = new mongoose.Schema({
  filename: { type: String, required: true },
  contentType: { type: String, default: 'application/pdf' },
  size: { type: Number },
  uploadDate: { type: Date, default: Date.now },
  uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  clientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Client' },
  registrationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Registration' },
  fileId: { type: mongoose.Schema.Types.ObjectId, required: true }
});

module.exports = mongoose.model('PDF', PDFSchema);