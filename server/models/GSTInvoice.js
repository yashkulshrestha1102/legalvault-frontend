const mongoose = require('mongoose');

const GSTInvoiceSchema = new mongoose.Schema({
  invoiceNumber: { type: String, required: true },
  invoiceDate: { type: Date, required: true },
  clientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Client', required: true },
  gstin: { type: String, required: true },
  
  // ✅ Financial details
  taxableValue: { type: Number, default: 0 },
  cgst: { type: Number, default: 0 },
  sgst: { type: Number, default: 0 },
  igst: { type: Number, default: 0 },
  totalAmount: { type: Number, default: 0 },
  
  // ✅ Type
  type: { type: String, enum: ['sale', 'purchase', 'credit_note', 'debit_note'], default: 'sale' },
  
  // ✅ Status
  status: { type: String, enum: ['pending', 'processed', 'filed'], default: 'pending' },
  
  // ✅ Automation reference
  automationId: { type: mongoose.Schema.Types.ObjectId, ref: 'GSTAutomation' },
  fileId: { type: mongoose.Schema.Types.ObjectId, ref: 'PDF' },
  
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('GSTInvoice', GSTInvoiceSchema);