import React, { useState, useEffect } from 'react';
import { FaTimes } from 'react-icons/fa';

const AddPolicyModal = ({ open, onClose, onSave, editData }) => {
  const [formData, setFormData] = useState({
    policyName: '',
    policyType: '',
    category: 'Internal',
    issueDate: '',
    reviewDate: '',
    expiryDate: '',
    status: 'Active',
    description: '',
    department: 'General',
    approvedBy: ''
  });

  const [loading, setLoading] = useState(false);
  const [pdfs, setPdfs] = useState([]);

  useEffect(() => {
    if (editData) {
      setFormData({
        policyName: editData.policyName || '',
        policyType: editData.policyType || '',
        category: editData.category || 'Internal',
        issueDate: editData.issueDate ? editData.issueDate.split('T')[0] : '',
        reviewDate: editData.reviewDate ? editData.reviewDate.split('T')[0] : '',
        expiryDate: editData.expiryDate ? editData.expiryDate.split('T')[0] : '',
        status: editData.status || 'Active',
        description: editData.description || '',
        department: editData.department || 'General',
        approvedBy: editData.approvedBy || ''
      });
      setPdfs(editData.pdfs || []);
    } else {
      setFormData({
        policyName: '',
        policyType: '',
        category: 'Internal',
        issueDate: '',
        reviewDate: '',
        expiryDate: '',
        status: 'Active',
        description: '',
        department: 'General',
        approvedBy: ''
      });
      setPdfs([]);
    }
  }, [editData, open]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSave({ ...formData, pdfs });
      onClose();
    } catch (error) {
      console.error('Error saving policy:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="glass w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 rounded-2xl relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white transition">
          <FaTimes size={22} />
        </button>

        <h2 className="text-2xl font-bold mb-6">
          {editData ? '✏️ Edit Policy' : '➕ Add New Policy'}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            {/* Policy Name */}
            <div className="md:col-span-2">
              <label className="block text-sm text-gray-400 mb-1">Policy Name *</label>
              <input
                type="text"
                name="policyName"
                value={formData.policyName}
                onChange={handleChange}
                required
                className="w-full glass-card p-3 outline-none focus:border-cyan-400/40 transition"
                placeholder="Enter policy name"
              />
            </div>

            {/* Policy Type */}
            <div>
              <label className="block text-sm text-gray-400 mb-1">Policy Type *</label>
              <select
                name="policyType"
                value={formData.policyType}
                onChange={handleChange}
                required
                className="w-full glass-card p-3 outline-none focus:border-cyan-400/40 transition"
              >
                <option value="">Select Type</option>
                <option value="HR Policy">HR Policy</option>
                <option value="Compliance">Compliance</option>
                <option value="Data Privacy">Data Privacy</option>
                <option value="Security">Security</option>
                <option value="Financial">Financial</option>
                <option value="Quality">Quality</option>
                <option value="Other">Other</option>
              </select>
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm text-gray-400 mb-1">Category</label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full glass-card p-3 outline-none focus:border-cyan-400/40 transition"
              >
                <option value="Internal">Internal</option>
                <option value="External">External</option>
                <option value="Client">Client</option>
                <option value="Vendor">Vendor</option>
              </select>
            </div>

            {/* Issue Date */}
            <div>
              <label className="block text-sm text-gray-400 mb-1">Issue Date *</label>
              <input
                type="date"
                name="issueDate"
                value={formData.issueDate}
                onChange={handleChange}
                required
                className="w-full glass-card p-3 outline-none focus:border-cyan-400/40 transition"
              />
            </div>

            {/* Review Date */}
            <div>
              <label className="block text-sm text-gray-400 mb-1">Review Date</label>
              <input
                type="date"
                name="reviewDate"
                value={formData.reviewDate}
                onChange={handleChange}
                className="w-full glass-card p-3 outline-none focus:border-cyan-400/40 transition"
              />
            </div>

            {/* Expiry Date */}
            <div>
              <label className="block text-sm text-gray-400 mb-1">Expiry Date</label>
              <input
                type="date"
                name="expiryDate"
                value={formData.expiryDate}
                onChange={handleChange}
                className="w-full glass-card p-3 outline-none focus:border-cyan-400/40 transition"
              />
            </div>

            {/* Status */}
            <div>
              <label className="block text-sm text-gray-400 mb-1">Status *</label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                required
                className="w-full glass-card p-3 outline-none focus:border-cyan-400/40 transition"
              >
                <option value="Active">✅ Active</option>
                <option value="Draft">📝 Draft</option>
                <option value="Under Review">🔍 Under Review</option>
                <option value="Expired">⛔ Expired</option>
              </select>
            </div>

            {/* Department */}
            <div>
              <label className="block text-sm text-gray-400 mb-1">Department</label>
              <input
                type="text"
                name="department"
                value={formData.department}
                onChange={handleChange}
                className="w-full glass-card p-3 outline-none focus:border-cyan-400/40 transition"
                placeholder="e.g., Legal, HR, IT"
              />
            </div>

            {/* Approved By */}
            <div>
              <label className="block text-sm text-gray-400 mb-1">Approved By</label>
              <input
                type="text"
                name="approvedBy"
                value={formData.approvedBy}
                onChange={handleChange}
                className="w-full glass-card p-3 outline-none focus:border-cyan-400/40 transition"
                placeholder="Name of approver"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm text-gray-400 mb-1">Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="3"
              className="w-full glass-card p-3 outline-none focus:border-cyan-400/40 transition resize-none"
              placeholder="Brief description of the policy..."
            />
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="glass-card px-6 py-3 blue-glow hover:scale-105 transition disabled:opacity-50"
            >
              {loading ? '⏳ Saving...' : editData ? '💾 Update Policy' : '➕ Add Policy'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="glass-card px-6 py-3 hover:scale-105 transition"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddPolicyModal;