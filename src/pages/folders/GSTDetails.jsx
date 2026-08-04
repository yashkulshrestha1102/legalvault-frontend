import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FaArrowLeft, FaFilePdf, FaEye, FaDownload } from 'react-icons/fa';

const API_URL = 'https://legalvault-jm2n.onrender.com';

const GSTDetails = () => {
  const { clientId, gstId } = useParams();
  const navigate = useNavigate();
  const [gst, setGst] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGST = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          alert('Please login again');
          return;
        }

        const response = await axios.get(`${API_URL}/api/gst/${gstId}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        setGst(response.data);
      } catch (error) {
        console.error('❌ Error fetching GST:', error);
        alert('Failed to load GST details');
      } finally {
        setLoading(false);
      }
    };

    if (gstId) fetchGST();
  }, [gstId]);

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
      link.download = 'gst.pdf';
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

  if (loading) {
    return (
      <div className="glass p-6">
        <div className="flex justify-center items-center h-32">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-400 mx-auto mb-3"></div>
            <p className="text-gray-400">Loading GST details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!gst) {
    return (
      <div className="glass p-6">
        <p className="text-red-400 text-center">GST record not found</p>
        <button onClick={() => navigate(`/client/${clientId}`)} className="glass-card px-4 py-2 mt-4">
          ← Back to Client
        </button>
      </div>
    );
  }

  return (
    <div className="glass p-6">
      <button 
        onClick={() => navigate(`/client/${clientId}`)} 
        className="glass-card px-4 py-2 mb-6 hover:scale-105 transition flex items-center gap-2"
      >
        <FaArrowLeft /> Back to Client
      </button>

      <h1 className="text-3xl font-bold mb-6">{gst.gstName}</h1>

      <div className="grid md:grid-cols-2 gap-4 mb-6">
        <div className="glass-card p-4">
          <p className="text-gray-400 text-sm">GST Type</p>
          <h3 className="font-semibold mt-1">{gst.gstType || '-'}</h3>
        </div>
        <div className="glass-card p-4">
          <p className="text-gray-400 text-sm">GSTIN</p>
          <h3 className="font-mono font-semibold mt-1">{gst.gstin || '-'}</h3>
        </div>
        <div className="glass-card p-4">
          <p className="text-gray-400 text-sm">Category</p>
          <h3 className="font-semibold mt-1">{gst.category || '-'}</h3>
        </div>
        <div className="glass-card p-4">
          <p className="text-gray-400 text-sm">Issue Date</p>
          <h3 className="font-semibold mt-1">{gst.issueDate ? new Date(gst.issueDate).toLocaleDateString() : '-'}</h3>
        </div>
        <div className="glass-card p-4">
          <p className="text-gray-400 text-sm">Review Date</p>
          <h3 className="font-semibold mt-1">{gst.reviewDate ? new Date(gst.reviewDate).toLocaleDateString() : '-'}</h3>
        </div>
        <div className="glass-card p-4">
          <p className="text-gray-400 text-sm">Expiry Date</p>
          <h3 className="font-semibold mt-1">{gst.expiryDate ? new Date(gst.expiryDate).toLocaleDateString() : '-'}</h3>
        </div>
        <div className="glass-card p-4">
          <p className="text-gray-400 text-sm">Status</p>
          <h3 className={`mt-1 inline-block px-3 py-1 rounded-full text-sm ${getStatusColor(gst.status)}`}>
            {gst.status || 'Active'}
          </h3>
        </div>
        <div className="glass-card p-4">
          <p className="text-gray-400 text-sm">Department</p>
          <h3 className="font-semibold mt-1">{gst.department || '-'}</h3>
        </div>
        <div className="glass-card p-4">
          <p className="text-gray-400 text-sm">Approved By</p>
          <h3 className="font-semibold mt-1">{gst.approvedBy || '-'}</h3>
        </div>
      </div>

      {gst.description && (
        <div className="glass-card p-4 mb-6">
          <p className="text-gray-400 text-sm">Description</p>
          <p className="mt-2">{gst.description}</p>
        </div>
      )}

      {/* PDF Section */}
      {gst.pdfs && gst.pdfs.length > 0 && (
        <div className="glass-card p-4">
          <p className="text-gray-400 text-sm mb-4">📄 Documents ({gst.pdfs.length})</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {gst.pdfs.map((pdfUrl, index) => (
              <div key={index} className="glass-card p-4 hover:scale-105 transition">
                <div className="flex flex-col items-center">
                  <FaFilePdf className="text-red-400 text-5xl mb-3" />
                  <p className="text-sm font-medium text-center truncate w-full">
                    GST Document {index + 1}
                  </p>
                  <div className="flex gap-2 mt-3">
                    <button 
                      onClick={() => viewPDF(pdfUrl)} 
                      className="glass-card px-3 py-1 text-cyan-400 hover:scale-105 transition text-xs flex items-center gap-1"
                    >
                      <FaEye /> View
                    </button>
                    <button 
                      onClick={() => downloadPDF(pdfUrl)} 
                      className="glass-card px-3 py-1 text-green-400 hover:scale-105 transition text-xs flex items-center gap-1"
                    >
                      <FaDownload /> Download
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default GSTDetails;