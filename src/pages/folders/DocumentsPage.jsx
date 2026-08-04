import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { FaFilePdf, FaFileImage, FaFileAlt, FaDownload, FaEye, FaTrash, FaUpload } from 'react-icons/fa';

const API_URL = 'https://legalvault-jm2n.onrender.com';

const DocumentsPage = () => {
  const { clientId } = useParams();
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);

  // ✅ Fetch documents
  const fetchDocuments = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token || !clientId) {
        setLoading(false);
        return;
      }

      const response = await axios.get(`${API_URL}/api/documents/client/${clientId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setDocuments(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error('❌ Error fetching documents:', error);
      setDocuments([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (clientId) fetchDocuments();
  }, [clientId]);

  // ✅ Upload documents
  const uploadDocuments = async () => {
    if (selectedFiles.length === 0) {
      alert('Please select at least one file');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const formData = new FormData();
      for (const file of selectedFiles) {
        formData.append('documents', file);
      }
      formData.append('clientId', clientId);
      
      setUploading(true);
      const response = await axios.post(`${API_URL}/api/documents/upload`, formData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      console.log('✅ Documents uploaded:', response.data);
      fetchDocuments();
      setSelectedFiles([]);
      alert(`✅ ${response.data.files.length} files uploaded successfully!`);
    } catch (error) {
      console.error('❌ Upload error:', error);
      alert('Failed to upload documents');
    } finally {
      setUploading(false);
    }
  };

  // ✅ View document
  const viewDocument = (docUrl) => {
    if (!docUrl) return;
    const token = localStorage.getItem('token');
    window.open(`${docUrl}?token=${token}`, '_blank');
  };

  // ✅ Download document
  const downloadDocument = async (docUrl, filename) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(docUrl, {
        headers: { 'Authorization': `Bearer ${token}` },
        responseType: 'blob'
      });
      const blob = new Blob([response.data]);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename || 'document';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Download error:', error);
      alert('Failed to download document');
    }
  };

  // ✅ Delete document
  const deleteDocument = async (docId) => {
    if (!window.confirm('Delete this document?')) return;
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_URL}/api/documents/${docId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      fetchDocuments();
      alert('✅ Document deleted!');
    } catch (error) {
      console.error('Delete error:', error);
      alert('Failed to delete document');
    }
  };

  // ✅ Get file icon
  const getFileIcon = (mimeType) => {
    if (mimeType?.startsWith('image/')) return <FaFileImage className="text-purple-400 text-4xl" />;
    if (mimeType === 'application/pdf') return <FaFilePdf className="text-red-400 text-4xl" />;
    return <FaFileAlt className="text-blue-400 text-4xl" />;
  };

  // ✅ Format file size
  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  if (loading) {
    return (
      <div className="glass p-6">
        <div className="flex justify-center items-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-400 mx-auto mb-3"></div>
          <p className="text-gray-400">Loading documents...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="glass p-6">
      {/* Header */}
      <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
        <h2 className="text-2xl font-bold">📁 Client Repository</h2>
        <div className="flex items-center gap-3 flex-wrap">
          <label className="glass-card px-4 py-2 cursor-pointer hover:scale-105 transition text-sm">
            📎 Select Files
            <input
              type="file"
              multiple
              accept=".pdf,.jpg,.jpeg,.png,.doc,.docx,.xlsx,.txt"
              onChange={(e) => setSelectedFiles(Array.from(e.target.files))}
              className="hidden"
            />
          </label>
          {selectedFiles.length > 0 && (
            <button
              onClick={uploadDocuments}
              disabled={uploading}
              className={`glass-card px-4 py-2 blue-glow hover:scale-105 transition text-sm ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {uploading ? '⏳ Uploading...' : `📤 Upload ${selectedFiles.length} files`}
            </button>
          )}
        </div>
      </div>

      {/* Selected files preview */}
      {selectedFiles.length > 0 && (
        <div className="glass-card p-3 mb-4">
          <p className="text-sm text-gray-400">Selected files:</p>
          <div className="flex flex-wrap gap-2 mt-2 max-h-32 overflow-y-auto">
            {selectedFiles.map((file, idx) => (
              <span key={idx} className="glass-card px-3 py-1 text-sm">
                {file.name} ({(file.size / 1024).toFixed(1)} KB)
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Documents Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {documents.length === 0 ? (
          <div className="col-span-full text-center py-12 text-gray-400">
            No documents uploaded
          </div>
        ) : (
          documents.map((doc) => (
            <div key={doc._id} className="glass-card p-4 hover:scale-105 transition-all duration-300">
              <div className="flex flex-col items-center">
                {/* File Icon */}
                <div className="w-full h-32 flex items-center justify-center bg-white/5 rounded-lg mb-3">
                  {getFileIcon(doc.mimeType)}
                </div>

                {/* File Name */}
                <p className="text-sm font-medium text-center truncate w-full" title={doc.filename}>
                  {doc.filename}
                </p>

                {/* File Size */}
                <p className="text-xs text-gray-400">{formatFileSize(doc.fileSize)}</p>

                {/* Actions */}
                <div className="flex gap-2 mt-3 flex-wrap justify-center">
                  <button
                    onClick={() => viewDocument(doc.fileUrl)}
                    className="glass-card px-3 py-1 text-cyan-400 hover:scale-105 transition text-xs"
                  >
                    👁️ View
                  </button>
                  <button
                    onClick={() => downloadDocument(doc.fileUrl, doc.filename)}
                    className="glass-card px-3 py-1 text-green-400 hover:scale-105 transition text-xs"
                  >
                    ⬇️ Download
                  </button>
                  <button
                    onClick={() => deleteDocument(doc._id)}
                    className="glass-card px-3 py-1 text-red-400 hover:scale-105 transition text-xs"
                  >
                    🗑️ Delete
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default DocumentsPage;