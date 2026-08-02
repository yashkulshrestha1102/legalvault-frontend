const mongoose = require('mongoose');

const AutomationSchema = new mongoose.Schema({
  clientId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Client', 
    required: true 
  },
  stage: { 
    type: String, 
    enum: ['collection', 'sorting', 'data_entry', 'compliance'],
    default: 'collection' 
  },
  documents: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Document' 
  }],
  status: { 
    type: String, 
    enum: ['pending', 'processing', 'completed', 'failed'],
    default: 'pending' 
  },
  remindersSent: { 
    type: Number, 
    default: 0 
  },
  validationResults: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  extractedData: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  createdBy: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User' 
  },
  assignedTo: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User' 
  },
  completedAt: { 
    type: Date 
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  },
  updatedAt: { 
    type: Date, 
    default: Date.now 
  }
}, {
  timestamps: true // ✅ Auto update createdAt/updatedAt
});

// ✅ Indexes for faster queries
AutomationSchema.index({ clientId: 1 });
AutomationSchema.index({ stage: 1 });
AutomationSchema.index({ status: 1 });
AutomationSchema.index({ assignedTo: 1 });

module.exports = mongoose.model('Automation', AutomationSchema);