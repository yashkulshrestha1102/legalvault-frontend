import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FaEye, FaEdit, FaTrash } from 'react-icons/fa';
import AddCorporateSecretariatModal from '../../components/modals/AddCorporateSecretariatModal';

const API_URL = 'https://legalvault-jm2n.onrender.com';

const CorporateSecretariatPage = ({ clientId }) => {
  const navigate = useNavigate();
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openModal, setOpenModal] = useState(false);
  const [editData, setEditData] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchRecords = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token || !clientId) {
        setLoading(false);
        return;
      }

      const response = await axios.get(`${API_URL}/api/corporate-secretariat/client/${clientId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setRecords(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error('❌ Error fetching Corporate Secretariat:', error);
      setRecords([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (clientId) fetchRecords();
  }, [clientId]);

  const saveRecord = async (data) => {
    try {
      const token = localStorage.getItem('token');
      if (!token || !clientId) {
        alert('Please login again');
        return;
      }

      const payload = { ...data, clientId };

      if (editData) {
        await axios.put(`${API_URL}/api/corporate-secretariat/${editData._id}`, payload, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
      } else {
        await axios.post(`${API_URL}/api/corporate-secretariat`, payload, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
      }

      fetchRecords();
      setOpenModal(false);
      setEditData(null);
      alert('✅ Record saved successfully!');
    } catch (error) {
      console.error('❌ Error saving:', error);
      alert('Failed to save record');
    }
  };

  const deleteRecord = async (id) => {
    if (!window.confirm('Delete this record?')) return;
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_URL}/api/corporate-secretariat/${id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      fetchRecords();
      alert('✅ Record deleted!');
    } catch (error) {
      console.error('❌ Error deleting:', error);
      alert('Failed to delete');
    }
  };

  const viewPDF = (pdfUrl) => {
    if (!pdfUrl) return;
    const token = localStorage.getItem('token');
    window.open(`${pdfUrl}?token=${token}`, '_blank');
  };

  const downloadPDF = async (pdfUrl) => {
    if (!pdfUrl) return;
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(pdfUrl, {
        headers: { 'Authorization': `Bearer ${token}` },
        responseType: 'blob'
      });
      const blob = new Blob([response.data]);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'cs.pdf';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('❌ Download error:', error);
      alert('Failed to download PDF');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Active': return 'bg-green-500/20 text-green-400 border border-green-400/20';
      case 'Draft': return 'bg-gray-500/20 text-gray-400 border border-gray-400/20';
      case 'Under Review': return 'bg-yellow-500/20 text-yellow-400 border border-yellow-400/20';
      case 'Expired': return 'bg-red-500/20 text-red-400 border border-red-400/20';
      default: return 'bg-gray-500/20 text-gray-400';
    }
  };

  const filteredRecords = records.filter(r =>
    r.csName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.csType?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.companyName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="glass p-6">
        <div className="flex justify-center items-center h-32">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-400 mx-auto mb-3"></div>
            <p className="text-gray-400">Loading Corporate Secretariat records...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="glass p-6">
      <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
        <h2 className="text-2xl font-bold">🏛️ Corporate Secretariat</h2>
        <div className="flex flex-wrap gap-3">
          <input
            type="text"
            placeholder="🔍 Search..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="glass-card px-4 py-2 outline-none focus:border-cyan-400/40 transition text-sm"
          />
          <button
            onClick={() => { setEditData(null); setOpenModal(true); }}
            className="glass-card px-4 py-2 blue-glow hover:scale-105 transition text-sm"
          >
            + Add
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[900px]">
          <thead className="bg-white/5">
            <tr className="border-b border-white/10">
              <th className="p-3 text-left text-sm">Name</th>
              <th className="p-3 text-left text-sm">Type</th>
              <th className="p-3 text-left text-sm">Company</th>
              <th className="p-3 text-left text-sm">Meeting Date</th>
              <th className="p-3 text-left text-sm">Status</th>
              <th className="p-3 text-left text-sm">PDF</th>
              <th className="p-3 text-left text-sm">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredRecords.length === 0 ? (
              <tr>
                <td colSpan="7" className="text-center py-12 text-gray-400">
                  No records found
                </td>
              </tr>
            ) : (
              filteredRecords.map((record) => (
                <tr key={record._id} className="border-b border-white/5 hover:bg-white/5 transition">
                  <td className="p-3 font-medium">{record.csName}</td>
                  <td className="p-3">
                    <span className="glass-card px-2 py-1 text-xs">{record.csType}</span>
                  </td>
                  <td className="p-3 text-sm">{record.companyName || '-'}</td>
                  <td className="p-3 text-sm">{record.meetingDate ? new Date(record.meetingDate).toLocaleDateString() : '-'}</td>
                  <td className="p-3">
                    <span className={`px-3 py-1 rounded-full text-xs ${getStatusColor(record.status)}`}>
                      {record.status || 'Active'}
                    </span>
                  </td>
                  <td className="p-3">
                    {record.pdfs && record.pdfs.length > 0 ? (
                      <div className="flex gap-2">
                        <button onClick={() => viewPDF(record.pdfs[0])} className="text-cyan-400 hover:underline text-xs">👁️ View</button>
                        <button onClick={() => downloadPDF(record.pdfs[0])} className="text-green-400 hover:underline text-xs">⬇️ Download</button>
                      </div>
                    ) : (
                      <span className="text-gray-500 text-xs">No PDF</span>
                    )}
                  </td>
                  <td className="p-3">
                    <div className="flex gap-3">
                      <button
                        onClick={() => navigate(`/client/${clientId}/corporate-secretariat/${record._id}`)}
                        className="text-cyan-400 hover:scale-125 transition"
                        title="View Details"
                      >
                        <FaEye />
                      </button>
                      <button
                        onClick={() => { setEditData(record); setOpenModal(true); }}
                        className="text-yellow-400 hover:scale-125 transition"
                        title="Edit"
                      >
                        <FaEdit />
                      </button>
                      <button
                        onClick={() => deleteRecord(record._id)}
                        className="text-red-400 hover:scale-125 transition"
                        title="Delete"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <AddCorporateSecretariatModal
        open={openModal}
        onClose={() => { setOpenModal(false); setEditData(null); }}
        onSave={saveRecord}
        editData={editData}
      />
    </div>
  );
};

export default CorporateSecretariatPage;