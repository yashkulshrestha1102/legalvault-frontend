import { useState } from "react";
import { FaTimes, FaUpload } from "react-icons/fa";
import axios from 'axios';

const API_URL = 'https://legalvault-jm2n.onrender.com';

export default function AddDocumentModal({ open, onClose, clientId, onUpload }) {
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);

  const handleFileChange = (e) => {
    setFiles(Array.from(e.target.files));
  };

  const handleUpload = async () => {
    if (files.length === 0) {
      alert('Please select at least one file');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const formData = new FormData();
      for (const file of files) {
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
      onUpload(response.data.files);
      setFiles([]);
      onClose();
    } catch (error) {
      console.error('Upload error:', error);
      alert('Failed to upload documents');
    } finally {
      setUploading(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/60 backdrop-blur-md p-4">
      <div className="glass w-full max-w-2xl p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">📤 Upload Documents</h2>
          <button onClick={onClose} className="glass-icon">
            <FaTimes />
          </button>
        </div>

        <div className="border-2 border-dashed border-gray-600 rounded-lg p-8 text-center">
          <input
            type="file"
            multiple
            accept=".pdf,.jpg,.jpeg,.png,.doc,.docx,.xlsx,.txt"
            onChange={handleFileChange}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
          <FaUpload className="text-4xl text-gray-400 mx-auto mb-3" />
          <p className="text-gray-400">Drag & drop files here, or click to select</p>
          <p className="text-xs text-gray-500 mt-2">Supports: PDF, JPG, PNG, DOC, XLSX, TXT</p>
        </div>

        {files.length > 0 && (
          <div className="mt-4">
            <p className="text-sm font-medium mb-2">Selected files: {files.length}</p>
            <div className="max-h-40 overflow-y-auto space-y-1">
              {files.map((file, idx) => (
                <div key={idx} className="glass-card p-2 text-sm flex justify-between">
                  <span>{file.name}</span>
                  <span className="text-gray-400">{(file.size / 1024).toFixed(1)} KB</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex justify-end gap-3 mt-6">
          <button onClick={onClose} className="glass-card px-6 py-2">
            Cancel
          </button>
          <button
            onClick={handleUpload}
            disabled={uploading || files.length === 0}
            className={`glass-card px-6 py-2 blue-glow ${
              uploading || files.length === 0 ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {uploading ? '⏳ Uploading...' : `📤 Upload ${files.length} files`}
          </button>
        </div>
      </div>
    </div>
  );
}