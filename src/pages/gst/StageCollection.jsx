import MainLayout from "../../layouts/MainLayout";
import { useState, useEffect } from "react";
import axios from 'axios';
import { FaUpload, FaSpinner, FaFileInvoice, FaArrowRight } from "react-icons/fa";
import { useParams, useNavigate } from "react-router-dom";

const API_URL = 'https://legalvault-jm2n.onrender.com';

function GSTCollection() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [automation, setAutomation] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchAutomation();
  }, [id]);

  // ✅ FIXED: fetchAutomation - proper GET request
  const fetchAutomation = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/api/gst-automation/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAutomation(response.data);
      setDocuments(response.data.documents || []);
    } catch (error) {
      console.error('❌ Error:', error);
      setError('Failed to load automation');
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files.length > 0) {
      setSelectedFile(e.target.files[0]);
    }
  };

  // ✅ FIXED: handleUpload - correct URL
  const handleUpload = async () => {
    if (!selectedFile) {
      setError('Please select a file');
      return;
    }

    setUploading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      const formData = new FormData();
      formData.append('document', selectedFile);
      formData.append('automationId', id);

      console.log('📤 Uploading file:', selectedFile.name);
      console.log('📦 automationId:', id);

      // ✅ Correct URL: /api/documents/automation-upload
      const uploadRes = await axios.post(`${API_URL}/api/documents/automation-upload`, formData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });

      console.log('✅ Upload response:', uploadRes.data);

      // ✅ Add document to automation
      await axios.post(`${API_URL}/api/gst-automation/${id}/documents`, {
        fileId: uploadRes.data._id,
        fileName: selectedFile.name,
        fileType: selectedFile.type
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      await fetchAutomation();
      setSelectedFile(null);
      document.getElementById('fileInput').value = '';
      alert('✅ Document uploaded successfully!');
    } catch (error) {
      console.error('❌ Upload error:', error);
      setError('Failed to upload document: ' + (error.response?.data?.message || error.message));
    } finally {
      setUploading(false);
    }
  };

  const handleNext = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(`${API_URL}/api/gst-automation/${id}/sort`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      navigate(`/gst/sorting/${id}`);
    } catch (error) {
      console.error('❌ Error:', error);
      setError('Failed to proceed to next stage');
    }
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="flex justify-center items-center h-64">
          <FaSpinner className="animate-spin text-3xl text-cyan-400" />
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="glass-card p-6 mb-8">
        <h1 className="text-2xl font-bold">📄 Stage 1: Document Collection</h1>
        <p className="text-white/60 mt-1">
          Client: <span className="text-white">{automation?.clientId?.name || 'N/A'}</span> 
          | GSTIN: <span className="text-white">{automation?.gstin || 'N/A'}</span>
        </p>
        <p className="text-white/40 text-sm">
          Status: <span className="capitalize">{automation?.status || 'pending'}</span>
        </p>
        <p className="text-white/40 text-sm">
          Documents: <span className="text-white font-bold">{documents.length}</span>
        </p>
      </div>

      {error && (
        <div className="bg-red-500/20 border border-red-400/50 rounded-xl p-4 mb-6 text-red-300">
          ❌ {error}
        </div>
      )}

      <div className="glass-card p-6 mb-8">
        <h2 className="text-xl font-bold mb-4">Upload GST Documents</h2>
        <p className="text-white/40 text-sm mb-4">Upload invoices, purchase bills, bank statements</p>
        <div className="flex flex-col md:flex-row gap-4">
          <input
            id="fileInput"
            type="file"
            onChange={handleFileChange}
            className="flex-1 bg-slate-800/50 border border-white/10 rounded-xl px-4 py-3 text-white file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-cyan-500/20 file:text-cyan-400"
          />
          <button
            onClick={handleUpload}
            disabled={!selectedFile || uploading}
            className="glass-card px-6 py-3 flex items-center justify-center gap-2 text-white disabled:opacity-50"
          >
            {uploading ? <FaSpinner className="animate-spin" /> : <FaUpload />}
            {uploading ? 'Uploading...' : 'Upload'}
          </button>
        </div>
        {selectedFile && (
          <p className="mt-2 text-sm text-white/40">Selected: {selectedFile.name}</p>
        )}
      </div>

      <div className="glass-card p-6 mb-8">
        <h2 className="text-xl font-bold mb-4">
          📋 Uploaded Documents ({documents.length})
        </h2>
        {documents.length === 0 ? (
          <p className="text-white/40">No documents uploaded yet</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {documents.map((doc, index) => (
              <div key={doc._id || index} className="bg-slate-800/30 border border-white/10 rounded-xl p-4 flex items-center gap-3">
                <FaFileInvoice className="text-cyan-400" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm truncate">{doc.fileName || 'Document'}</p>
                  <p className="text-xs text-white/40">{doc.fileType || 'Unknown'}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="flex justify-end">
        <button
          onClick={handleNext}
          disabled={documents.length === 0}
          className="glass-card px-8 py-3 flex items-center gap-2 text-white disabled:opacity-50"
        >
          Next: Auto-Sort <FaArrowRight />
        </button>
      </div>
    </MainLayout>
  );
}

export default GSTCollection;