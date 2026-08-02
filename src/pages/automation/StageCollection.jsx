import MainLayout from "../../layouts/MainLayout";
import { useState, useEffect } from "react";
import axios from 'axios';
import { FaUpload, FaSpinner, FaFileAlt, FaTrash } from "react-icons/fa";
import { useParams } from "react-router-dom";

const API_URL = 'https://legalvault-jm2n.onrender.com';

function StageCollection() {
  const { automationId } = useParams();
  const [automation, setAutomation] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAutomationDetails();
  }, [automationId]);

  const fetchAutomationDetails = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/api/automation/${automationId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAutomation(response.data);
      setDocuments(response.data.documents || []);
    } catch (error) {
      console.error('❌ Error fetching automation:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('document', selectedFile);
    formData.append('automationId', automationId);

    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(`${API_URL}/api/documents/upload`, formData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });

      // Add document to automation
      await axios.post(`${API_URL}/api/automation/${automationId}/documents`, {
        documentIds: [response.data._id]
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // Update UI
      setDocuments([...documents, response.data]);
      setSelectedFile(null);
      alert('✅ Document uploaded successfully!');
    } catch (error) {
      console.error('❌ Upload error:', error);
      alert('❌ Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteDocument = async (docId) => {
    if (!confirm('Delete this document?')) return;

    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_URL}/api/documents/${docId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setDocuments(documents.filter(d => d._id !== docId));
    } catch (error) {
      console.error('❌ Delete error:', error);
    }
  };

  const handleNextStage = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`${API_URL}/api/automation/${automationId}/stage`, {
        stage: 'sorting',
        status: 'processing'
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      window.location.href = `/automation/${automationId}/sorting`;
    } catch (error) {
      console.error('❌ Stage update error:', error);
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <MainLayout>
      <div className="glass-card p-6 mb-8">
        <h1 className="text-2xl font-bold">📄 Stage 1: Document Collection</h1>
        <p className="text-white/60 mt-1">Client: {automation?.clientId?.name || 'N/A'}</p>
      </div>

      {/* Upload Section */}
      <div className="glass-card p-6 mb-8">
        <h2 className="text-xl font-bold mb-4">Upload Documents</h2>
        <div className="flex flex-col md:flex-row gap-4">
          <input
            type="file"
            onChange={handleFileChange}
            className="flex-1 bg-slate-800/50 border border-white/10 rounded-xl px-4 py-3 text-white"
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
      </div>

      {/* Document List */}
      <div className="glass-card p-6 mb-8">
        <h2 className="text-xl font-bold mb-4">Uploaded Documents ({documents.length})</h2>
        {documents.length === 0 ? (
          <p className="text-white/40">No documents uploaded yet</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {documents.map(doc => (
              <div key={doc._id} className="bg-slate-800/50 border border-white/10 rounded-xl p-4 flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <FaFileAlt className="text-cyan-400" />
                  <div>
                    <p className="font-medium truncate">{doc.name}</p>
                    <p className="text-xs text-white/40">{(doc.size / 1024).toFixed(1)} KB</p>
                  </div>
                </div>
                <button onClick={() => handleDeleteDocument(doc._id)} className="text-red-400 hover:text-red-300">
                  <FaTrash />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Next Stage Button */}
      <div className="flex justify-end">
        <button
          onClick={handleNextStage}
          disabled={documents.length === 0}
          className="glass-card px-8 py-3 text-white disabled:opacity-50"
        >
          Next: Sorting →
        </button>
      </div>
    </MainLayout>
  );
}

export default StageCollection;