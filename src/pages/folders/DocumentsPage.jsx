import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';

const API_URL = 'https://legalvault-jm2n.onrender.com';

const DocumentsPage = () => {
  const { clientId } = useParams();

  // ✅ All States inside this component
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploadingDocs, setUploadingDocs] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [renamingId, setRenamingId] = useState(null);
  const [newFileName, setNewFileName] = useState('');

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

  // ✅ Upload documents (500 Error Fixed Here)
  const uploadDocuments = async (files) => {
    if (files.length === 0) {
      alert('Please select at least one file');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const formData = new FormData();
      for (const file of files) {
        // ✅ FIX: 'documents' ki jagah 'file' use kiya
        formData.append('documents', file); 
      }
      formData.append('clientId', clientId);
      
      setUploadingDocs(true);
      const response = await axios.post(`${API_URL}/api/documents/upload`, formData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      console.log('✅ Documents uploaded:', response.data);
      fetchDocuments();
      setSelectedFiles([]);
      
      const fileCount = response.data.files ? response.data.files.length : (response.data.length || 0);
      alert(`✅ ${fileCount} files uploaded successfully!`);
    } catch (error) {
      console.error('❌ Upload error:', error);
      alert('Failed to upload documents');
    } finally {
      setUploadingDocs(false);
    }
  };

  // ✅ Rename document
  const renameDocument = async (docId, newName) => {
    if (!newName || newName.trim() === '') {
      alert('Please enter a valid name');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(`${API_URL}/api/documents/${docId}/rename`, {
        newName: newName.trim()
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      console.log('✅ Document renamed:', response.data);
      fetchDocuments();
      setRenamingId(null);
      setNewFileName('');
    } catch (error) {
      console.error('Rename error:', error);
      alert('Failed to rename document');
    }
  };

  const startRename = (doc) => {
    setRenamingId(doc._id);
    setNewFileName(doc.filename);
  };

  const cancelRename = () => {
    setRenamingId(null);
    setNewFileName('');
  };

  const handleRenameKeyDown = (e, docId) => {
    if (e.key === 'Enter') {
      renameDocument(docId, newFileName);
    } else if (e.key === 'Escape') {
      cancelRename();
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
    } catch (error) {
      console.error('Delete error:', error);
      alert('Failed to delete document');
    }
  };

  if (loading) {
    return (
      <div className="glass p-6">
        <div className="flex justify-center items-center h-32">
          <p className="text-gray-400">Loading documents...</p>
        </div>
      </div>
    );
  }

  // ✅ Return UI (Tera exact wahi code)
  return (
    <div className="glass p-6">
      <div className="flex justify-between items-center mb-6 flex-wrap gap-3">
        <h3 className="text-xl font-semibold">📁 Client Repository</h3>
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
              onClick={() => uploadDocuments(selectedFiles)}
              disabled={uploadingDocs}
              className={`glass-card px-4 py-2 blue-glow hover:scale-105 transition text-sm ${
                uploadingDocs ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {uploadingDocs ? '⏳ Uploading...' : `📤 Upload ${selectedFiles.length} files`}
            </button>
          )}
        </div>
      </div>

      {selectedFiles.length > 0 && (
        <div className="glass-card p-3 mb-4">
          <p className="text-sm text-gray-400">Selected files:</p>
          <div className="flex flex-wrap gap-2 mt-2 max-h-32 overflow-y-auto">
            {selectedFiles.map((file, idx) => (
              <span key={`file-${idx}`} className="glass-card px-3 py-1 text-sm">
                {file.name} ({(file.size / 1024).toFixed(1)} KB)
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {documents.length === 0 ? (
          <div className="col-span-full text-center py-12 text-gray-400">
            No documents uploaded
          </div>
        ) : (
          documents.map((doc) => (
            <div key={`doc-${doc._id}`} className="glass-card p-4 hover:scale-105 transition-all duration-300">
              <div className="flex flex-col items-center">
                {doc.mimeType?.startsWith('image/') ? (
                  <img 
                    src={`${doc.fileUrl}?token=${localStorage.getItem('token')}`} 
                    alt={doc.filename}
                    className="w-full h-32 object-cover rounded-lg mb-3"
                    onError={(e) => { e.target.style.display = 'none'; }}
                  />
                ) : (
                  <div className="w-full h-32 flex items-center justify-center bg-white/5 rounded-lg mb-3">
                    <span className="text-6xl">
                      {doc.mimeType === 'application/pdf' ? '📄' : '📎'}
                    </span>
                  </div>
                )}

                {/* Editable File Name */}
                {renamingId === doc._id ? (
                  <div className="w-full flex items-center gap-2 mb-1">
                    <input
                      type="text"
                      value={newFileName}
                      onChange={(e) => setNewFileName(e.target.value)}
                      onKeyDown={(e) => handleRenameKeyDown(e, doc._id)}
                      onBlur={() => renameDocument(doc._id, newFileName)}
                      className="glass-card px-2 py-1 text-sm w-full text-white outline-none focus:border-cyan-400/40"
                      autoFocus
                    />
                  </div>
                ) : (
                  <div className="w-full flex items-center justify-center gap-2 mb-1">
                    <p 
                      className="text-sm font-medium text-center truncate cursor-pointer hover:text-cyan-400 transition flex-1"
                      title="Double-click to rename"
                      onDoubleClick={() => startRename(doc)}
                    >
                      {doc.filename}
                    </p>
                    <button
                      onClick={() => startRename(doc)}
                      className="text-gray-400 hover:text-cyan-400 transition text-xs"
                      title="Rename"
                    >
                      ✏️
                    </button>
                  </div>
                )}

                <p className="text-xs text-gray-400">{(doc.fileSize / 1024).toFixed(1)} KB</p>
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