import { useState, useRef, useEffect } from 'react';
import { FaTimes, FaUpload, FaTrash, FaFileAlt, FaFilePdf, FaFileImage, FaFileWord, FaFileExcel } from 'react-icons/fa';
import api from '../../utils/api';

// ✅ File type helpers
const getFileIcon = (mimeType) => {
  if (!mimeType) return <FaFileAlt className="text-gray-400" />;
  if (mimeType === 'application/pdf') return <FaFilePdf className="text-red-400" />;
  if (mimeType.startsWith('image/')) return <FaFileImage className="text-cyan-400" />;
  if (
    mimeType === 'application/msword' ||
    mimeType.includes('wordprocessingml')
  ) return <FaFileWord className="text-blue-400" />;
  if (
    mimeType === 'application/vnd.ms-excel' ||
    mimeType.includes('spreadsheetml') ||
    mimeType === 'text/csv'
  ) return <FaFileExcel className="text-green-400" />;
  return <FaFileAlt className="text-gray-400" />;
};

const formatSize = (bytes) => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
};

const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100 MB

export default function BulkUploadModal({ open, onClose, folderId, clientId, folderName, onUploaded }) {
  const [files, setFiles] = useState([]);
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [errors, setErrors] = useState([]);
  const inputRef = useRef(null);

  useEffect(() => {
    if (open) {
      setFiles([]);
      setDragging(false);
      setUploading(false);
      setProgress(0);
      setErrors([]);
    }
  }, [open]);

  if (!open) return null;

  const validateAndAdd = (newFiles) => {
    const valid = [];
    const newErrors = [];

    for (const f of newFiles) {
      if (f.size > MAX_FILE_SIZE) {
        newErrors.push(`${f.name} is too large (max 100MB)`);
        continue;
      }
      // Duplicate check
      if (files.some(existing => existing.name === f.name && existing.size === f.size)) {
        newErrors.push(`${f.name} already added`);
        continue;
      }
      valid.push(f);
    }

    setFiles(prev => [...prev, ...valid]);
    if (newErrors.length > 0) {
      setErrors(newErrors);
      setTimeout(() => setErrors([]), 5000);
    }
  };

  const handleFileSelect = (e) => {
    const selected = Array.from(e.target.files || []);
    validateAndAdd(selected);
    e.target.value = '';
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    const dropped = Array.from(e.dataTransfer.files || []);
    validateAndAdd(dropped);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setDragging(false);
  };

  const removeFile = (index) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleUpload = async () => {
    if (files.length === 0) return;

    try {
      setUploading(true);
      setProgress(0);

      const formData = new FormData();
      formData.append('folderId', folderId);
      formData.append('clientId', clientId);
      for (const f of files) {
        formData.append('files', f);
      }

      const response = await api.post('/api/custom-files/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (e) => {
          if (e.total) {
            setProgress(Math.round((e.loaded * 100) / e.total));
          }
        }
      });

      onUploaded?.(response.data);
      onClose();
    } catch (err) {
      console.error('Upload error:', err);
      setErrors([err.response?.data?.message || err.message || 'Upload failed']);
    } finally {
      setUploading(false);
      setProgress(0);
    }
  };

  const totalSize = files.reduce((sum, f) => sum + f.size, 0);

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/70 backdrop-blur-md p-4">
      <div className="glass w-full max-w-2xl max-h-[90vh] overflow-hidden rounded-2xl relative flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-white/10">
          <div>
            <h2 className="text-2xl font-bold">📤 Upload Files</h2>
            {folderName && (
              <p className="text-sm text-gray-400 mt-1">
                To: <span className="text-cyan-400">{folderName}</span>
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            disabled={uploading}
            className="text-gray-400 hover:text-white transition disabled:opacity-50"
          >
            <FaTimes size={22} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto flex-1">
          {/* Drop Zone */}
          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onClick={() => !uploading && inputRef.current?.click()}
            className={`relative border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
              dragging
                ? 'border-cyan-400 bg-cyan-500/10 scale-[1.02]'
                : 'border-gray-600 hover:border-cyan-400/50'
            } ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <input
              ref={inputRef}
              type="file"
              multiple
              onChange={handleFileSelect}
              disabled={uploading}
              className="hidden"
            />
            <FaUpload className={`text-4xl mx-auto mb-3 ${dragging ? 'text-cyan-400' : 'text-gray-400'}`} />
            <p className="text-white font-medium">
              {dragging ? '🎯 Drop files here!' : '📎 Click to select or drag & drop'}
            </p>
            <p className="text-xs text-gray-400 mt-2">
              Any type: PDF, Images, Word, Excel, Text • Max 100MB per file
            </p>
          </div>

          {/* Errors */}
          {errors.length > 0 && (
            <div className="mt-4 glass-card p-3 border border-red-400/30">
              {errors.map((err, i) => (
                <p key={i} className="text-red-400 text-sm">❌ {err}</p>
              ))}
            </div>
          )}

          {/* File List */}
          {files.length > 0 && (
            <div className="mt-4">
              <div className="flex justify-between items-center mb-2">
                <p className="text-sm font-medium text-white">
                  {files.length} file(s) selected • {formatSize(totalSize)}
                </p>
                {!uploading && (
                  <button
                    onClick={() => setFiles([])}
                    className="text-xs text-red-400 hover:text-red-300"
                  >
                    Clear all
                  </button>
                )}
              </div>

              <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                {files.map((f, idx) => (
                  <div key={idx} className="glass-card p-3 flex items-center gap-3">
                    <span className="text-xl flex-shrink-0">{getFileIcon(f.type)}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-white truncate">{f.name}</p>
                      <p className="text-xs text-gray-400">{formatSize(f.size)}</p>
                    </div>
                    {!uploading && (
                      <button
                        onClick={() => removeFile(idx)}
                        className="text-red-400 hover:text-red-300 transition flex-shrink-0"
                      >
                        <FaTrash size={14} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Progress bar */}
          {uploading && (
            <div className="mt-4">
              <div className="flex justify-between text-sm text-gray-300 mb-1">
                <span>Uploading...</span>
                <span>{progress}%</span>
              </div>
              <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-cyan-400 to-blue-500 transition-all"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex gap-3 p-6 border-t border-white/10">
          <button
            onClick={onClose}
            disabled={uploading}
            className="glass-card px-6 py-3 disabled:opacity-50 flex-1"
          >
            Cancel
          </button>
          <button
            onClick={handleUpload}
            disabled={uploading || files.length === 0}
            className={`glass-card px-6 py-3 blue-glow hover:scale-105 transition disabled:opacity-50 flex-1 ${
              uploading || files.length === 0 ? 'cursor-not-allowed' : ''
            }`}
          >
            {uploading ? `⏳ Uploading ${progress}%` : `📤 Upload ${files.length} file(s)`}
          </button>
        </div>
      </div>
    </div>
  );
}