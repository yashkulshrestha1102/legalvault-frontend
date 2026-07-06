const mongoose = require('mongoose');

const ClientSchema = new mongoose.Schema({
  name: { type: String, required: true },
  company: { type: String, required: true },
  email: { type: String, required: true, unique: true }, // ✅ Yehi se index ban raha hai
  phone: { type: String, required: true },
  status: { type: String, enum: ['Active', 'Inactive'], default: 'Active' },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  isDeleted: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

// ✅ Sirf extra indexes (jo unique:true se nahi ban rahe)
ClientSchema.index({ status: 1 });
ClientSchema.index({ isDeleted: 1 });
ClientSchema.index({ name: 'text', company: 'text' });

module.exports = mongoose.model('Client', ClientSchema);