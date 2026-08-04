import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; // ✅ useParams hatao
import axios from 'axios';
import { FaEye, FaEdit, FaTrash } from 'react-icons/fa';
import AddPolicyModal from '../../components/modals/AddPolicyModal';

const API_URL = 'https://legalvault-jm2n.onrender.com';

// ✅ clientId prop se lo, URL se nahi
const PoliciesPage = ({ clientId }) => {
  const navigate = useNavigate();
  const [policies, setPolicies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openModal, setOpenModal] = useState(false);
  const [editData, setEditData] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  // ✅ Fetch policies with better error handling
  const fetchPolicies = async () => {
    try {
      const token = localStorage.getItem('token');
      console.log('🔑 Token:', token ? '✅ Yes' : '❌ No');
      
      if (!token) {
        console.error('❌ No token found!');
        setPolicies([]);
        setLoading(false);
        return;
      }

      if (!clientId) {
        console.error('❌ No clientId available!');
        setPolicies([]);
        setLoading(false);
        return;
      }

      console.log('📋 Fetching policies for client:', clientId);
      
      const response = await axios.get(`${API_URL}/api/policies/client/${clientId}`, {
        headers: { 
          'Authorization': `Bearer ${token}` 
        }
      });
      
      console.log('✅ Policies response:', response.data);
      setPolicies(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error('❌ Error fetching policies:', {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message
      });
      setPolicies([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (clientId) {
      fetchPolicies();
    } else {
      console.error('❌ No clientId available');
      setLoading(false);
    }
  }, [clientId]);

  // ✅ Save policy (Create/Update)
  const savePolicy = async (data) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('Please login again');
        return;
      }

      if (!clientId) {
        alert('Client ID not found');
        return;
      }

      const payload = { ...data, clientId };

      if (editData) {
        // Update
        await axios.put(`${API_URL}/api/policies/${editData._id}`, payload, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
      } else {
        // Create
        await axios.post(`${API_URL}/api/policies`, payload, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
      }

      fetchPolicies();
      setOpenModal(false);
      setEditData(null);
      alert('✅ Policy saved successfully!');
    } catch (error) {
      console.error('❌ Error saving policy:', error.response?.data || error.message);
      alert('Failed to save policy: ' + (error.response?.data?.message || error.message));
    }
  };

  // ✅ Delete policy
  const deletePolicy = async (id) => {
    if (!window.confirm('Delete this policy?')) return;
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('Please login again');
        return;
      }

      await axios.delete(`${API_URL}/api/policies/${id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      fetchPolicies();
      alert('✅ Policy deleted!');
    } catch (error) {
      console.error('❌ Error deleting policy:', error.response?.data || error.message);
      alert('Failed to delete policy');
    }
  };

  // ✅ View PDF
  const viewPDF = (pdfUrl) => {
    if (!pdfUrl) return;
    const token = localStorage.getItem('token');
    if (!token) {
      alert('Please login again');
      return;
    }
    window.open(`${pdfUrl}?token=${token}`, '_blank');
  };

  // ✅ Download PDF
  const downloadPDF = async (pdfUrl) => {
    if (!pdfUrl) return;
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('Please login again');
        return;
      }

      const response = await axios.get(pdfUrl, {
        headers: { 'Authorization': `Bearer ${token}` },
        responseType: 'blob'
      });
      const blob = new Blob([response.data]);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'policy.pdf';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('❌ Download error:', error);
      alert('Failed to download PDF');
    }
  };

  // ✅ Get status color
  const getStatusColor = (status) => {
    switch (status) {
      case 'Active': return 'bg-green-500/20 text-green-400 border border-green-400/20';
      case 'Draft': return 'bg-gray-500/20 text-gray-400 border border-gray-400/20';
      case 'Under Review': return 'bg-yellow-500/20 text-yellow-400 border border-yellow-400/20';
      case 'Expired': return 'bg-red-500/20 text-red-400 border border-red-400/20';
      default: return 'bg-gray-500/20 text-gray-400';
    }
  };

  // ✅ Filter policies
  const filteredPolicies = policies.filter(p =>
    p.policyName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.policyType?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="glass p-6">
        <div className="flex justify-center items-center h-32">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-400 mx-auto mb-3"></div>
            <p className="text-gray-400">Loading policies...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="glass p-6">
      {/* Header */}
      <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
        <h2 className="text-2xl font-bold">📋 Policies</h2>
        <div className="flex flex-wrap gap-3">
          <input
            type="text"
            placeholder="🔍 Search policies..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="glass-card px-4 py-2 outline-none focus:border-cyan-400/40 transition text-sm"
          />
          <button
            onClick={() => { setEditData(null); setOpenModal(true); }}
            className="glass-card px-4 py-2 blue-glow hover:scale-105 transition text-sm"
          >
            + Add Policy
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full min-w-[900px]">
          <thead className="bg-white/5">
            <tr className="border-b border-white/10">
              <th className="p-3 text-left text-sm">Policy Name</th>
              <th className="p-3 text-left text-sm">Type</th>
              <th className="p-3 text-left text-sm">Issue Date</th>
              <th className="p-3 text-left text-sm">Review Date</th>
              <th className="p-3 text-left text-sm">Status</th>
              <th className="p-3 text-left text-sm">PDF</th>
              <th className="p-3 text-left text-sm">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredPolicies.length === 0 ? (
              <tr>
                <td colSpan="7" className="text-center py-12 text-gray-400">
                  No policies found
                </td>
              </tr>
            ) : (
              filteredPolicies.map((policy) => (
                <tr key={policy._id} className="border-b border-white/5 hover:bg-white/5 transition">
                  <td className="p-3 font-medium">{policy.policyName}</td>
                  <td className="p-3">
                    <span className="glass-card px-2 py-1 text-xs">
                      {policy.policyType}
                    </span>
                  </td>
                  <td className="p-3 text-sm">{policy.issueDate ? new Date(policy.issueDate).toLocaleDateString() : '-'}</td>
                  <td className="p-3 text-sm">{policy.reviewDate ? new Date(policy.reviewDate).toLocaleDateString() : '-'}</td>
                  <td className="p-3">
                    <span className={`px-3 py-1 rounded-full text-xs ${getStatusColor(policy.status)}`}>
                      {policy.status || 'Active'}
                    </span>
                  </td>
                  <td className="p-3">
                    {policy.pdfs && policy.pdfs.length > 0 ? (
                      <div className="flex gap-2">
                        <button
                          onClick={() => viewPDF(policy.pdfs[0])}
                          className="text-cyan-400 hover:underline text-xs"
                        >
                          👁️ View
                        </button>
                        <button
                          onClick={() => downloadPDF(policy.pdfs[0])}
                          className="text-green-400 hover:underline text-xs"
                        >
                          ⬇️ Download
                        </button>
                      </div>
                    ) : (
                      <span className="text-gray-500 text-xs">No PDF</span>
                    )}
                  </td>
                  <td className="p-3">
                    <div className="flex gap-3">
                      <button
                        onClick={() => navigate(`/client/${clientId}/policy/${policy._id}`)}
                        className="text-cyan-400 hover:scale-125 transition"
                        title="View Details"
                      >
                        <FaEye />
                      </button>
                      <button
                        onClick={() => { setEditData(policy); setOpenModal(true); }}
                        className="text-yellow-400 hover:scale-125 transition"
                        title="Edit"
                      >
                        <FaEdit />
                      </button>
                      <button
                        onClick={() => deletePolicy(policy._id)}
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

      {/* Modal */}
      <AddPolicyModal
        open={openModal}
        onClose={() => { setOpenModal(false); setEditData(null); }}
        onSave={savePolicy}
        editData={editData}
      />
    </div>
  );
};

export default PoliciesPage;