import { useState, useEffect } from 'react';
import MainLayout from '../layouts/MainLayout';
import api from '../utils/api';
import {
  FaPlus, FaEdit, FaTrash, FaPaperPlane, FaCalendarAlt,
  FaEnvelope, FaTimes, FaSync, FaUpload, FaEye, FaDownload
} from 'react-icons/fa';
import Select from 'react-select';
import SmartFileViewer from '../components/SmartFileViewer';

const TYPES = ['GSTR-1', 'GSTR-3B', 'TDS', 'TCS', 'ITR', 'Advance Tax', 'GSTR-9', 'Custom'];

function ComplianceCalendar() {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editData, setEditData] = useState(null);
  const [sending, setSending] = useState(null);

  const [companySuggestions, setCompanySuggestions] = useState([]);
  const [allUsers, setAllUsers] = useState([]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await api.get('/api/compliance');
      setList(res.data);
    } catch (err) {
      console.error(err);
      alert('Failed to load compliance list');
    } finally {
      setLoading(false);
    }
  };

  const fetchDropdownData = async () => {
    try {
      const [companiesRes, usersRes] = await Promise.all([
        api.get('/api/compliance/companies'),
        api.get('/api/users/dropdown/all')
      ]);
      setCompanySuggestions(companiesRes.data);
      setAllUsers(usersRes.data);
    } catch (err) {
      console.error('Dropdown data fetch error:', err);
    }
  };

  useEffect(() => { 
    fetchData(); 
    fetchDropdownData(); 
  }, []);

  const handleManualSend = async (item) => {
    if (item.status === 'Filed' || item.status === 'Overdue') {
      return alert(`Cannot send. Status is already ${item.status}.`);
    }
    if (!window.confirm(`Send reminder now for "${item.complianceType === 'Custom' ? item.customName : item.complianceType}"?`)) return;
    try {
      setSending(item._id);
      const res = await api.post(`/api/compliance/${item._id}/send-now`);
      alert(`✅ Sent! Days left: ${res.data.daysLeft}`);
      fetchData();
    } catch (err) {
      alert('Failed: ' + (err.response?.data?.message || err.message));
    } finally {
      setSending(null);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this compliance?')) return;
    try {
      await api.delete(`/api/compliance/${id}`);
      fetchData();
    } catch (err) {
      alert('Delete failed');
    }
  };

  const daysLeft = (due) => {
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const d = new Date(due); d.setHours(0, 0, 0, 0);
    return Math.ceil((d - today) / (1000 * 60 * 60 * 24));
  };

  return (
    <MainLayout>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <FaCalendarAlt className="text-cyan-400" /> Compliance Calendar
        </h1>
        <div className="flex gap-3">
          <button onClick={fetchData} className="glass-card px-4 py-2 flex items-center gap-2">
            <FaSync /> Refresh
          </button>
          <button onClick={() => { setEditData(null); setShowModal(true); }} className="glass-card px-4 py-2 blue-glow flex items-center gap-2">
            <FaPlus /> Add Compliance
          </button>
        </div>
      </div>

      {loading ? (
        <div className="glass-card p-8 text-center text-gray-400">Loading...</div>
      ) : list.length === 0 ? (
        <div className="glass-card p-8 text-center text-gray-400">
          No compliance entries yet. Click "Add Compliance" to start.
        </div>
      ) : (
        <div className="glass-card p-4 overflow-x-auto">
          <table className="w-full text-sm whitespace-nowrap">
            <thead>
              <tr className="border-b border-white/10">
                <th className="p-3 text-left">Company</th>
                <th className="p-3 text-left">Type</th>
                <th className="p-3 text-left">Due Date</th>
                <th className="p-3 text-left">Status</th>
                <th className="p-3 text-left">Invoices</th>
                <th className="p-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {list.map((item) => {
                const dl = daysLeft(item.dueDate);
                const color = dl < 0 ? 'text-red-400' : dl <= 5 ? 'text-yellow-400' : 'text-green-400';
                const isClosed = item.status === 'Filed' || item.status === 'Overdue';
                
                // ✅ Purane single attachment aur naye array dono ko handle karega
                const files = item.attachmentUrls?.length > 0 
                  ? item.attachmentUrls 
                  : (item.attachmentUrl ? [item.attachmentUrl] : []);

                return (
                  <tr key={item._id} className="border-b border-white/5 hover:bg-white/5">
                    <td className="p-3 font-medium">{item.companyName}</td>
                    <td className="p-3">
                      {item.complianceType === 'Custom' ? item.customName : item.complianceType}
                    </td>
                    <td className="p-3">{new Date(item.dueDate).toLocaleDateString('en-IN')}</td>
                    <td className="p-3">
                      <span className={`px-2 py-1 rounded text-xs ${
                        item.status === 'Filed' ? 'bg-green-500/20 text-green-400' :
                        item.status === 'Overdue' ? 'bg-red-500/20 text-red-400' : 'bg-yellow-500/20 text-yellow-400'
                      }`}>
                        {item.status}
                      </span>
                    </td>
                    
                    {/* ✅ Multiple Files Display */}
                    <td className="p-3">
                      {files.length > 0 ? (
                        <div className="flex flex-col gap-1">
                          {files.map((url, idx) => (
                            <SmartFileViewer 
                              key={idx}
                              fileUrl={url} 
                              fileName={`Invoice_${item.companyName}_${idx + 1}`} 
                            />
                          ))}
                        </div>
                      ) : (
                        <span className="text-gray-500">-</span>
                      )}
                    </td>

                    <td className="p-3">
                      <div className="flex gap-3">
                        <button
                          onClick={() => handleManualSend(item)}
                          disabled={sending === item._id || isClosed}
                          className="text-cyan-400 hover:scale-110 transition disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <FaPaperPlane />
                        </button>
                        <button onClick={() => { setEditData(item); setShowModal(true); }} className="text-yellow-400 hover:scale-110 transition">
                          <FaEdit />
                        </button>
                        <button onClick={() => handleDelete(item._id)} className="text-red-400 hover:scale-110 transition">
                          <FaTrash />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <ComplianceModal
          open={showModal}
          onClose={() => setShowModal(false)}
          editData={editData}
          onSaved={() => { setShowModal(false); fetchData(); }}
          companySuggestions={companySuggestions} 
          allUsers={allUsers}                     
        />
      )}
    </MainLayout>
  );
}

// ═══════════════════════════════════════════
// MODAL — Add / Edit
// ═══════════════════════════════════════════
function ComplianceModal({ open, onClose, editData, onSaved, companySuggestions, allUsers }) {
  const [form, setForm] = useState({
    companyName: '',
    complianceType: 'GSTR-1',
    customName: '',
    period: '',
    dueDate: '',
    reminderDays: 5,
    channels: { email: true },
    recipients: [{ name: '', email: '' }],
    attachmentUrls: [], // ✅ Array for multiple files
    assignedTo: [], 
    notes: '',
    status: 'Pending',
  });
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState([]);

  const userOptions = allUsers.map(u => ({
    value: u._id,
    label: `${u.name} (${u.email})`
  }));

  useEffect(() => {
    if (editData) {
      // Handle existing data
      const existingUrls = editData.attachmentUrls?.length > 0 
        ? editData.attachmentUrls 
        : (editData.attachmentUrl ? [editData.attachmentUrl] : []);

      setForm({
        companyName: editData.companyName || '',
        complianceType: editData.complianceType || 'GSTR-1',
        customName: editData.customName || '',
        period: editData.period || '',
        dueDate: editData.dueDate ? editData.dueDate.split('T')[0] : '',
        reminderDays: editData.reminderDays ?? 5,
        channels: { email: editData.channels?.email ?? true },
        recipients: editData.recipients?.length
          ? editData.recipients.map(r => ({ name: r.name || '', email: r.email || '' }))
          : [{ name: '', email: '' }],
        attachmentUrls: existingUrls,
        assignedTo: Array.isArray(editData.assignedTo) 
          ? editData.assignedTo.map(u => u._id || u) 
          : (editData.assignedTo ? [editData.assignedTo._id || editData.assignedTo] : []),
        notes: editData.notes || '',
        status: editData.status || 'Pending',
      });

      if (existingUrls.length > 0) {
        setUploadedFiles(existingUrls.map((url, i) => ({ url, name: `Existing File ${i+1}` })));
      }
    }
  }, [editData]);

  const updateRecipient = (i, field, value) => {
    setForm((prev) => {
      const r = [...prev.recipients];
      r[i] = { ...r[i], [field]: value };
      return { ...prev, recipients: r };
    });
  };

  const addRecipient = () => {
    setForm((p) => ({ ...p, recipients: [...p.recipients, { name: '', email: '' }] }));
  };

  const removeRecipient = (i) => {
    setForm((p) => ({ ...p, recipients: p.recipients.filter((_, idx) => idx !== i) }));
  };

  // ✅ Multiple File Upload System
  const handleFileUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    try {
      setUploading(true);
      const formData = new FormData();
      files.forEach(file => {
        formData.append('pdf', file); // Backend expects 'pdf' field
      });

      const res = await api.post('/api/pdfs/pdf', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      // Backend multiple URLs return karta hai
      const newUrls = res.data.urls || [];
      
      setForm(prev => ({ 
        ...prev, 
        attachmentUrls: [...prev.attachmentUrls, ...newUrls] 
      }));
      
      const newFiles = files.map((file, i) => ({ 
        url: newUrls[i], 
        name: file.name 
      }));
      
      setUploadedFiles(prev => [...prev, ...newFiles]);
      alert(`✅ ${files.length} file(s) uploaded successfully!`);
    } catch (err) {
      console.error('Upload error:', err);
      alert('❌ Failed to upload files');
    } finally {
      setUploading(false);
    }
  };

  const removeFile = (index) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
    setForm(prev => ({
      ...prev,
      attachmentUrls: prev.attachmentUrls.filter((_, i) => i !== index)
    }));
  };

  const handleSave = async () => {
    if (!form.companyName.trim()) return alert('Company Name required');
    if (!form.dueDate) return alert('Due date required');
    
    const validRecipients = form.recipients.filter(r => r.name.trim() && r.email.trim());
    if (validRecipients.length === 0) {
      return alert('At least one recipient with name + email required');
    }

    setSaving(true);
    try {
      const payload = { ...form, recipients: validRecipients };
      if (editData) {
        await api.put(`/api/compliance/${editData._id}`, payload);
      } else {
        await api.post('/api/compliance', payload);
      }
      onSaved();
    } catch (err) {
      alert('Failed: ' + (err.response?.data?.message || err.message));
    } finally {
      setSaving(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/70 backdrop-blur-md p-4">
      <div className="glass w-full max-w-3xl p-6 rounded-2xl max-h-[92vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">
            {editData ? 'Edit Compliance' : 'Add Compliance'}
          </h2>
          <button onClick={onClose} className="glass-icon">
            <FaTimes />
          </button>
        </div>

        <div className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            
            <div className="md:col-span-2">
              <label className="block text-sm text-gray-300 mb-1">Company Name *</label>
              <input
                type="text"
                list="company-suggestions"
                value={form.companyName}
                onChange={(e) => setForm({ ...form, companyName: e.target.value })}
                className="w-full glass-card p-3"
                placeholder="e.g., ABC Pvt Ltd"
              />
              <datalist id="company-suggestions">
                {companySuggestions.map((c, i) => <option key={i} value={c} />)}
              </datalist>
            </div>

            <div>
              <label className="block text-sm text-gray-300 mb-1">Type *</label>
              <select
                value={form.complianceType}
                onChange={(e) => setForm({ ...form, complianceType: e.target.value })}
                className="w-full glass-card p-3 bg-slate-900 text-white"
              >
                {TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-sm text-gray-300 mb-1">Due Date *</label>
              <input
                type="date"
                value={form.dueDate}
                onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
                className="w-full glass-card p-3"
              />
            </div>

            {/* ✅ Multiple File Upload UI */}
            <div className="md:col-span-2">
              <label className="block text-sm text-gray-300 mb-1">Invoices / Attachments (Multiple)</label>
              
              <label className={`inline-flex glass-card px-4 py-2 cursor-pointer hover:scale-105 transition text-sm items-center gap-2 ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}>
                <FaUpload size={14} />
                {uploading ? '⏳ Uploading...' : '📎 Choose Files'}
                <input
                  type="file"
                  multiple // ✅ Multiple files allow
                  accept=".pdf, .jpg, .jpeg, .png, .doc, .docx, .xls, .xlsx"
                  onChange={handleFileUpload}
                  disabled={uploading}
                  className="hidden"
                />
              </label>

              {uploadedFiles.length > 0 && (
                <div className="mt-3 space-y-2">
                  {uploadedFiles.map((file, index) => (
                    <div key={index} className="glass-card px-3 py-2 flex items-center gap-3 text-sm">
                      <span className="text-green-400 truncate flex-1">✅ {file.name}</span>
                      <SmartFileViewer fileUrl={file.url} fileName={file.name} />
                      <button 
                        type="button" 
                        onClick={() => removeFile(index)} 
                        className="text-red-400 hover:text-red-300 ml-2"
                      >
                        <FaTimes />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm text-gray-300 mb-1">Assign To (Users)</label>
              <Select
                isMulti
                options={userOptions}
                value={userOptions.filter(u => form.assignedTo.includes(u.value))}
                onChange={(selected) => setForm({ ...form, assignedTo: selected ? selected.map(s => s.value) : [] })}
                placeholder="Select users..."
                className="react-select-container"
                classNamePrefix="react-select"
              />
            </div>
          </div>

          <div className="glass-card p-3">
            <div className="flex justify-between items-center mb-2">
              <p className="text-sm text-gray-300">Recipients *</p>
              <button onClick={addRecipient} className="text-xs text-cyan-400">+ Add</button>
            </div>
            {form.recipients.map((r, i) => (
              <div key={i} className="grid grid-cols-1 md:grid-cols-10 gap-2 mb-2">
                <input
                  placeholder="Name"
                  value={r.name}
                  onChange={(e) => updateRecipient(i, 'name', e.target.value)}
                  className="glass-card p-2 md:col-span-3 text-sm"
                />
                <input
                  placeholder="Email"
                  type="email"
                  value={r.email}
                  onChange={(e) => updateRecipient(i, 'email', e.target.value)}
                  className="glass-card p-2 md:col-span-6 text-sm"
                />
                <button onClick={() => removeRecipient(i)} className="text-red-400 md:col-span-1">
                  <FaTrash />
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <button onClick={onClose} className="glass-card px-6 py-3">Cancel</button>
          <button onClick={handleSave} disabled={saving || uploading} className="glass-card px-6 py-3 blue-glow disabled:opacity-50">
            {saving ? 'Saving...' : editData ? 'Update' : 'Create'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ComplianceCalendar;