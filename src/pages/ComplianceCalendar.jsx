import { useState, useEffect } from 'react';
import MainLayout from '../layouts/MainLayout';
import api from '../utils/api';
import {
  FaPlus, FaEdit, FaTrash, FaPaperPlane, FaCalendarAlt,
  FaEnvelope, FaTimes, FaSync
} from 'react-icons/fa';

const TYPES = ['GSTR-1', 'GSTR-3B', 'TDS', 'TCS', 'ITR', 'Advance Tax', 'GSTR-9', 'Custom'];

function ComplianceCalendar() {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editData, setEditData] = useState(null);
  const [sending, setSending] = useState(null);

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

  useEffect(() => { fetchData(); }, []);

  const handleManualSend = async (item) => {
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

  // Days left calculation
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
          <button
            onClick={fetchData}
            className="glass-card px-4 py-2 flex items-center gap-2"
          >
            <FaSync /> Refresh
          </button>
          <button
            onClick={() => { setEditData(null); setShowModal(true); }}
            className="glass-card px-4 py-2 blue-glow flex items-center gap-2"
          >
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
          <table className="w-full min-w-[900px]">
            <thead>
              <tr className="border-b border-white/10">
                <th className="p-3 text-left">Type</th>
                <th className="p-3 text-left">Period</th>
                <th className="p-3 text-left">Due Date</th>
                <th className="p-3 text-left">Days Left</th>
                <th className="p-3 text-left">Reminder</th>
                <th className="p-3 text-left">Email</th>
                <th className="p-3 text-left">Recipients</th>
                <th className="p-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {list.map((item) => {
                const dl = daysLeft(item.dueDate);
                const color = dl < 0 ? 'text-red-400' : dl <= 5 ? 'text-yellow-400' : 'text-green-400';
                return (
                  <tr key={item._id} className="border-b border-white/5 hover:bg-white/5">
                    <td className="p-3 font-medium">
                      {item.complianceType === 'Custom' ? item.customName : item.complianceType}
                    </td>
                    <td className="p-3 text-sm">{item.period || '-'}</td>
                    <td className="p-3 text-sm">{new Date(item.dueDate).toLocaleDateString('en-IN')}</td>
                    <td className={`p-3 font-bold ${color}`}>
                      {dl < 0 ? `Overdue ${Math.abs(dl)}d` : `${dl}d`}
                    </td>
                    <td className="p-3 text-sm">{item.reminderDays} days before</td>
                    <td className="p-3 text-sm">
                      {item.channels?.email ? (
                        <FaEnvelope className="text-green-400" title="Email enabled" />
                      ) : (
                        <span className="text-gray-500 text-xs">Off</span>
                      )}
                    </td>
                    <td className="p-3 text-sm">
                      {item.recipients?.length || 0} member(s)
                    </td>
                    <td className="p-3">
                      <div className="flex gap-3">
                        <button
                          onClick={() => handleManualSend(item)}
                          disabled={sending === item._id}
                          className="text-cyan-400 hover:scale-110 transition disabled:opacity-50"
                          title="Send email reminder now (manual test)"
                        >
                          <FaPaperPlane />
                        </button>
                        <button
                          onClick={() => { setEditData(item); setShowModal(true); }}
                          className="text-yellow-400 hover:scale-110 transition"
                          title="Edit"
                        >
                          <FaEdit />
                        </button>
                        <button
                          onClick={() => handleDelete(item._id)}
                          className="text-red-400 hover:scale-110 transition"
                          title="Delete"
                        >
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
        />
      )}
    </MainLayout>
  );
}

// ═══════════════════════════════════════════
// MODAL — Add / Edit (Email ONLY)
// ═══════════════════════════════════════════
function ComplianceModal({ open, onClose, editData, onSaved }) {
  const [form, setForm] = useState({
    complianceType: 'GSTR-1',
    customName: '',
    period: '',
    dueDate: '',
    reminderDays: 5,
    channels: { email: true },          // ✅ sirf email
    recipients: [{ name: '', email: '' }], // ✅ phone hata diya
    notes: '',
    status: 'Pending',
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (editData) {
      setForm({
        complianceType: editData.complianceType || 'GSTR-1',
        customName: editData.customName || '',
        period: editData.period || '',
        dueDate: editData.dueDate ? editData.dueDate.split('T')[0] : '',
        reminderDays: editData.reminderDays ?? 5,
        channels: { email: editData.channels?.email ?? true },
        recipients: editData.recipients?.length
          ? editData.recipients.map(r => ({ name: r.name || '', email: r.email || '' }))
          : [{ name: '', email: '' }],
        notes: editData.notes || '',
        status: editData.status || 'Pending',
      });
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

  const handleSave = async () => {
    if (!form.dueDate) return alert('Due date required');
    if (form.complianceType === 'Custom' && !form.customName.trim()) {
      return alert('Custom name required');
    }
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

            {form.complianceType === 'Custom' && (
              <div>
                <label className="block text-sm text-gray-300 mb-1">Custom Name *</label>
                <input
                  type="text"
                  value={form.customName}
                  onChange={(e) => setForm({ ...form, customName: e.target.value })}
                  className="w-full glass-card p-3"
                  placeholder="e.g., ROC Annual Filing"
                />
              </div>
            )}

            <div>
              <label className="block text-sm text-gray-300 mb-1">Period</label>
              <input
                type="text"
                value={form.period}
                onChange={(e) => setForm({ ...form, period: e.target.value })}
                className="w-full glass-card p-3"
                placeholder="e.g., Oct 2026 / Q2 FY26"
              />
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

            <div>
              <label className="block text-sm text-gray-300 mb-1">
                Reminder Days Before (default 5)
              </label>
              <input
                type="number"
                min={0}
                max={30}
                value={form.reminderDays}
                onChange={(e) => setForm({ ...form, reminderDays: Number(e.target.value) })}
                className="w-full glass-card p-3"
              />
              <p className="text-xs text-gray-400 mt-1">
                Reminder from D-{form.reminderDays} to D-0 (daily)
              </p>
            </div>

            <div>
              <label className="block text-sm text-gray-300 mb-1">Status</label>
              <select
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value })}
                className="w-full glass-card p-3 bg-slate-900 text-white"
              >
                <option>Pending</option>
                <option>Filed</option>
                <option>Overdue</option>
              </select>
            </div>
          </div>

          {/* Channels — Email only */}
          <div className="glass-card p-3">
            <p className="text-sm text-gray-300 mb-2">Channels</p>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={form.channels.email}
                onChange={(e) =>
                  setForm({ ...form, channels: { email: e.target.checked } })
                }
                className="accent-cyan-500"
              />
              <FaEnvelope /> Email
            </label>
          </div>

          {/* Recipients — no phone */}
          <div className="glass-card p-3">
            <div className="flex justify-between items-center mb-2">
              <p className="text-sm text-gray-300">Recipients *</p>
              <button onClick={addRecipient} className="text-xs text-cyan-400">
                + Add
              </button>
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
                <button
                  onClick={() => removeRecipient(i)}
                  className="text-red-400 md:col-span-1"
                  title="Remove"
                >
                  <FaTrash />
                </button>
              </div>
            ))}
          </div>

          <div>
            <label className="block text-sm text-gray-300 mb-1">Notes</label>
            <textarea
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              rows={2}
              className="w-full glass-card p-3"
              placeholder="Optional notes"
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <button onClick={onClose} className="glass-card px-6 py-3">
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="glass-card px-6 py-3 blue-glow disabled:opacity-50"
          >
            {saving ? 'Saving...' : editData ? 'Update' : 'Create'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ComplianceCalendar;