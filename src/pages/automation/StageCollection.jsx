import MainLayout from "../../layouts/MainLayout";
import { useState, useEffect } from "react";
import axios from 'axios';
import { FaUpload, FaSpinner, FaFileAlt, FaTrash, FaArrowRight } from "react-icons/fa";
import { useParams, useNavigate } from "react-router-dom";

const API_URL = 'https://legalvault-jm2n.onrender.com';

function StageCollection() {
  const { automationId } = useParams();
  const navigate = useNavigate();
  const [automation, setAutomation] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

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
      setError('');
    } catch (error) {
      console.error('❌ Error fetching automation:', error);
      setError('Failed to load automation details');
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files.length > 0) {
      setSelectedFile(e.target.files[0]);
      setError('');
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setError('Please select a file first');
      return;
    }

    setUploading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      const formData = new FormData();
      
      // ✅ CRITICAL: Field name MUST be 'document'
      formData.append('document', selectedFile);
      formData.append('automationId', automationId);

      // ✅ DEBUG: Log FormData
      console.log('📤 Uploading file:', selectedFile.name);
      console.log('📦 FormData entries:');
      for (let pair of formData.entries()) {
        console.log(pair[0], pair[1]);
      }
      
const response = await axios.post(`${API_URL}/api/documents/automation/upload`, formData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        },
        timeout: 60000
      });

      console.log('✅ Upload response:', response.data);

      // ✅ Add document to automation
      await axios.post(`${API_URL}/api/automation/${automationId}/documents`, {
        documentIds: [response.data._id]
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setDocuments([...documents, response.data]);
      setSelectedFile(null);
      
      const fileInput = document.getElementById('fileInput');
      if (fileInput) fileInput.value = '';

      alert('✅ Document uploaded successfully!');
    } catch (error) {
      console.error('❌ Upload error:', error);
      
      if (error.response) {
        setError(`Upload failed: ${error.response.data?.message || error.response.statusText}`);
      } else if (error.request) {
        setError('Upload failed: No response from server. Please check your connection.');
      } else {
        setError(`Upload failed: ${error.message}`);
      }
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
      setError('Failed to delete document');
    }
  };

  const handleNextStage = async () => {
    if (documents.length === 0) {
      setError('Please upload at least one document before proceeding');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      await axios.put(`${API_URL}/api/automation/${automationId}/stage`, {
        stage: 'sorting',
        status: 'processing'
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      navigate(`/automation/${automationId}/sorting`);
    } catch (error) {
      console.error('❌ Stage update error:', error);
      setError('Failed to move to next stage');
    }
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="flex justify-center items-center h-64">
          <div className="flex items-center gap-2">
            <FaSpinner className="animate-spin" />
            <span>Loading...</span>
          </div>
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
        </p>
        <p className="text-white/40 text-sm">
          Status: <span className="capitalize">{automation?.status || 'pending'}</span>
        </p>
      </div>

      {error && (
        <div className="bg-red-500/20 border border-red-400/50 rounded-xl p-4 mb-6 text-red-300">
          ❌ {error}
        </div>
      )}

      <div className="glass-card p-6 mb-8">
        <h2 className="text-xl font-bold mb-4">Upload Documents</h2>
        <div className="flex flex-col md:flex-row gap-4">
          <input
            id="fileInput"
            type="file"
            onChange={handleFileChange}
            className="flex-1 bg-slate-800/50 border border-white/10 rounded-xl px-4 py-3 text-white file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-cyan-500/20 file:text-cyan-400 hover:file:bg-cyan-500/30"
          />
          <button
            onClick={handleUpload}
            disabled={!selectedFile || uploading}
            className="glass-card px-6 py-3 flex items-center justify-center gap-2 text-white disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-[0_0_30px_rgba(34,211,238,0.2)]"
          >
            {uploading ? <FaSpinner className="animate-spin" /> : <FaUpload />}
            {uploading ? 'Uploading...' : 'Upload'}
          </button>
        </div>
        {selectedFile && (
          <p className="mt-2 text-sm text-white/40">
            Selected: {selectedFile.name} ({(selectedFile.size / 1024).toFixed(1)} KB)
          </p>
        )}
      </div>

      <div className="glass-card p-6 mb-8">
        <h2 className="text-xl font-bold mb-4">
          Uploaded Documents 
          <span className="ml-2 text-white/40 text-sm font-normal">
            ({documents.length} files)
          </span>
        </h2>
        
        {documents.length === 0 ? (
          <div className="text-center py-8 text-white/40">
            <FaFileAlt className="mx-auto text-4xl mb-2 opacity-20" />
            <p>No documents uploaded yet</p>
            <p className="text-sm">Upload files to proceed to the next stage</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {documents.map(doc => (
              <div 
                key={doc._id} 
                className="bg-slate-800/50 border border-white/10 rounded-xl p-4 flex justify-between items-center hover:border-white/20 transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <FaFileAlt className="text-cyan-400 flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="font-medium truncate" title={doc.name}>
                      {doc.name}
                    </p>
                    <p className="text-xs text-white/40">
                      {(doc.size / 1024).toFixed(1)} KB • {new Date(doc.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <button 
                  onClick={() => handleDeleteDocument(doc._id)} 
                  className="text-red-400 hover:text-red-300 p-2 hover:bg-red-400/10 rounded-lg transition-colors"
                >
                  <FaTrash />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="flex justify-end">
        <button
          onClick={handleNextStage}
          disabled={documents.length === 0 || uploading}
          className="glass-card px-8 py-3 flex items-center gap-2 text-white disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-[0_0_30px_rgba(34,211,238,0.2)]"
        >
          Next: Sorting <FaArrowRight />
        </button>
      </div>
    </MainLayout>
  );
}

export default StageCollection;