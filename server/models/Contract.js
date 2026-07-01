const mongoose = require('mongoose');

const ContractSchema = new mongoose.Schema({
  clientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Client', required: true },
  contractType: { type: String, required: true },
  contractName: { type: String, required: true },
  firstParty: { type: String, required: true },
  secondParty: { type: String, required: true },
  startDate: { type: String, required: true },
  endDate: { type: String, required: true },
  pdf: { type: String, default: '' },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Contract', ContractSchema);