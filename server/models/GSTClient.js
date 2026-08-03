const mongoose = require('mongoose');

const GSTClientSchema = new mongoose.Schema({
  clientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Client', required: true },
  gstin: { type: String, required: true, unique: true },
  businessName: { type: String, required: true },
  businessType: { type: String, enum: ['proprietorship', 'partnership', 'company', 'llp'], default: 'company' },
  state: { type: String, required: true },
  registrationDate: { type: Date, default: Date.now },
  filingFrequency: { type: String, enum: ['monthly', 'quarterly'], default: 'monthly' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('GSTClient', GSTClientSchema);