import React, { useState, useEffect } from 'react';
import { FaTimes, FaFilePdf, FaUpload } from 'react-icons/fa';
import axios from 'axios';

const API_URL = 'https://legalvault-jm2n.onrender.com';

const AddFinancialModal = ({ open, onClose, onSave, editData }) => {
  const [formData, setFormData] = useState({
    financeName: '',
    financeType: '',
    period: '',
    amount: '',
    currency: 'INR',
    issueDate: '',
    reviewDate: '',
    expiryDate: '',
    status: 'Active',
    description: '',
    department: 'Finance',
    approvedBy: ''
  });

  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [pdfs, setPdfs] = useState([]);

  useEffect(() => {
    if (editData) {
      setFormData({
        financeName: editData.financeName || '',
        financeType: editData.financeType || '',
        period: editData.period || '',
        amount: editData.amount || '',
        currency: editData.currency || 'INR',
        issueDate: editData.issueDate ? editData.issueDate.split('T')[0] : '',
        reviewDate: editData.reviewDate ? editData.reviewDate.split('T')[0] : '',
        expiryDate: editData.expiryDate ? editData.expiryDate.split('T')[0] : '',
        status: editData.status || 'Active',
        description: editData.description || '',
        department: editData.department || 'Finance',
        approvedBy: editData.approvedBy || ''
      });
      setPdfs(editData.pdfs || []);
    } else {
      setFormData({
        financeName: '',
        financeType: '',
        period: '',
        amount: '',
        currency: 'INR',
        issueDate: '',
        reviewDate: '',
        expiryDate: '',
        status: 'Active',
        description: '',
        department: 'Finance',
        approvedBy: ''
      });
      setPdfs([]);
    }
  }, [editData, open]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const uploadPDF = async (file) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('Please login again');
        return null;
      }

      const formData = new FormData();
      formData.append('pdf', file);
      
      setUploading(true);
      const response = await axios.post(`${API_URL}/api/pdfs/pdf`, formData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      
      console.log('✅ PDF uploaded:', response.data);
      const uploadedUrl = response.data.url || response.data.urls?.[0] || response.data.fileUrl;
      return uploadedUrl;
    } catch (error) {
      console.error('❌ PDF upload error:', error);
      alert('Failed to upload PDF');
      return null;
    } finally {
      setUploading(false);
    }
  };

  const handlePDFUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      alert('Please upload a PDF file');
      return;
    }

    const url = await uploadPDF(file);
    if (url) {
      setPdfs(prev => [...prev, url]);
    }
    e.target.value = '';
  };

  const removePDF = (index) => {
    setPdfs(pdfs.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSave({ ...formData, pdfs });
      onClose();
    } catch (error) {
      console.error('Error saving Financial:', error);
      alert('Failed to save record');
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
          {editData ? '✏️ Edit Financial Record' : '➕ Add Financial Record'}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            {/* Finance Name */}
            <div className="md:col-span-2">
              <label className="block text-sm text-gray-400 mb-1">Finance Name *</label>
              <input
                type="text"
                name="financeName"
                value={formData.financeName}
                onChange={handleChange}
                required
                className="w-full glass-card p-3 outline-none focus:border-cyan-400/40 transition"
                placeholder="e.g., Annual Budget, Q1 Report"
              />
            </div>

            {/* Finance Type */}
            <div>
              <label className="block text-sm text-gray-400 mb-1">Finance Type *</label>
              <select
                name="financeType"
                value={formData.financeType}
                onChange={handleChange}
                required
                className="w-full glass-card p-3 outline-none focus:border-cyan-400/40 transition"
              >
                <option value="">Select Type</option>
                <option value="Balance Sheet">Balance Sheet</option>
                <option value="Income Statement">Income Statement</option>
                <option value="Budget">Budget</option>
                <option value="Cash Flow">Cash Flow</option>
                <option value="Audit Report">Audit Report</option>
                <option value="Tax Report">Tax Report</option>
                <option value="Other">Other</option>
              </select>
            </div>

            {/* Period */}
            <div>
              <label className="block text-sm text-gray-400 mb-1">Period</label>
              <input
                type="text"
                name="period"
                value={formData.period}
                onChange={handleChange}
                placeholder="Q1 2024, FY 2024-25"
                className="w-full glass-card p-3 outline-none focus:border-cyan-400/40 transition"
              />
            </div>

            {/* Amount */}
            <div>
              <label className="block text-sm text-gray-400 mb-1">Amount</label>
              <input
                type="number"
                name="amount"
                value={formData.amount}
                onChange={handleChange}
                placeholder="0.00"
                className="w-full glass-card p-3 outline-none focus:border-cyan-400/40 transition"
              />
            </div>

            {/* Currency */}
            <div>
              <label className="block text-sm text-gray-400 mb-1">Currency</label>
              <select
                name="currency"
                value={formData.currency}
                onChange={handleChange}
                className="w-full glass-card p-3 outline-none focus:border-cyan-400/40 transition"
              >
                <option value="INR">₹ INR</option>
                <option value="USD">$ USD</option>
                <option value="EUR">€ EUR</option>
                <option value="GBP">£ GBP</option>
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
                placeholder="Name of approver"
                className="w-full glass-card p-3 outline-none focus:border-cyan-400/40 transition"
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
              placeholder="Brief description..."
            />
          </div>

          {/* PDF Upload */}
          <div>
            <label className="block text-sm text-gray-400 mb-1">Upload PDF</label>
            <div className="flex items-center gap-3">
              <label className={`glass-card px-4 py-2 cursor-pointer hover:scale-105 transition text-sm flex items-center gap-2 ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}>
                <FaUpload size={14} />
                {uploading ? '⏳ Uploading...' : '📎 Choose PDF'}
                <input
                  type="file"
                  accept=".pdf"
                  onChange={handlePDFUpload}
                  disabled={uploading}
                  className="hidden"
                />
              </label>
              {pdfs.length > 0 && (
                <span className="text-sm text-gray-400">{pdfs.length} file(s) uploaded</span>
              )}
            </div>

            {pdfs.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {pdfs.map((url, idx) => (
                  <div key={idx} className="glass-card px-3 py-2 text-sm flex items-center gap-2">
                    <FaFilePdf className="text-red-400" />
                    <span className="truncate max-w-[150px]">Financial_{idx + 1}.pdf</span>
                    <button
                      type="button"
                      onClick={() => removePDF(idx)}
                      className="text-red-400 hover:text-red-300 transition ml-1"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="glass-card px-6 py-3 blue-glow hover:scale-105 transition disabled:opacity-50"
            >
              {loading ? '⏳ Saving...' : editData ? '💾 Update' : '➕ Add'}
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

export default AddFinancialModal;