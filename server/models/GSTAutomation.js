const mongoose = require('mongoose');

const GSTAutomationSchema = new mongoose.Schema({
  clientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Client', required: true },
  gstin: { type: String, required: true },
  month: { type: String, required: true }, // Format: YYYY-MM
  
  // ✅ Stage 1: Document Collection
  documents: [{
    fileId: { type: mongoose.Schema.Types.ObjectId, ref: 'PDF' },
    fileName: String,
    fileType: String,
    uploadedAt: { type: Date, default: Date.now }
  }],
  
  // ✅ Stage 2: Auto-Sort
  sortedDocuments: {
    saleInvoices: [{ type: mongoose.Schema.Types.ObjectId, ref: 'PDF' }],
    purchaseInvoices: [{ type: mongoose.Schema.Types.ObjectId, ref: 'PDF' }],
    bankStatements: [{ type: mongoose.Schema.Types.ObjectId, ref: 'PDF' }],
    ledgers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'PDF' }]
  },
  
  // ✅ Stage 3: Data Entry
  extractedData: {
    totalSales: { type: Number, default: 0 },
    totalPurchases: { type: Number, default: 0 },
    totalGstCollected: { type: Number, default: 0 },
    totalGstPaid: { type: Number, default: 0 },
    netGstLiability: { type: Number, default: 0 },
    invoiceCount: { type: Number, default: 0 },
    purchaseCount: { type: Number, default: 0 },
    gstr1Data: { type: mongoose.Schema.Types.Mixed, default: {} },
    gstr3bData: { type: mongoose.Schema.Types.Mixed, default: {} }
  },
  
  // ✅ Stage 4: GST Filing
  gstFiling: {
    gstr1: { 
      status: { type: String, enum: ['pending', 'processing', 'filed', 'failed'], default: 'pending' },
      filedAt: Date,
      error: String
    },
    gstr3b: { 
      status: { type: String, enum: ['pending', 'processing', 'filed', 'failed'], default: 'pending' },
      filedAt: Date,
      error: String
    },
    payment: {
      status: { type: String, enum: ['pending', 'paid', 'failed'], default: 'pending' },
      amount: Number,
      paidAt: Date
    }
  },
  
  // ✅ Validations (30+ checks)
  validations: {
    totalChecks: { type: Number, default: 30 },
    passed: { type: Number, default: 0 },
    failed: { type: Number, default: 0 },
    results: { type: mongoose.Schema.Types.Mixed, default: {} }
  },
  
  // ✅ Status
  stage: { type: String, enum: ['collection', 'sorting', 'data_entry', 'filing'], default: 'collection' },
  status: { type: String, enum: ['pending', 'processing', 'completed', 'failed'], default: 'pending' },
  
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('GSTAutomation', GSTAutomationSchema);