const mongoose = require('mongoose');

const AuditLogSchema = new mongoose.Schema({
  user: {
    id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true },
    email: { type: String, required: true },
    role: { type: String, required: true }
  },
  action: {
    type: String,
    enum: ['CREATE', 'UPDATE', 'DELETE', 'LOGIN', 'LOGOUT', 'VIEW'],
    required: true
  },
  entity: {
    type: String,
    enum: ['CLIENT', 'REGISTRATION', 'CONTRACT', 'USER', 'DOCUMENT'],
    required: true
  },
  entityId: { type: mongoose.Schema.Types.ObjectId },
  entityName: { type: String },
  changes: { type: mongoose.Schema.Types.Mixed, default: {} },
  ipAddress: { type: String },
  userAgent: { type: String },
  timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model('AuditLog', AuditLogSchema);