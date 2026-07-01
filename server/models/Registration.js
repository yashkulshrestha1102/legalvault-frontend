const mongoose = require('mongoose');

const RegistrationSchema = new mongoose.Schema({
  clientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Client', required: true },
  category: { type: String, required: true },
  registrationName: { type: String, required: true },
  startDate: { type: String, required: true },
  endDate: { type: String, required: true },
  pdf: { type: String, default: '' },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Registration', RegistrationSchema);