import { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import {
  FaTimes, FaUpload, FaTrash, FaFileAlt, FaFilePdf,
  FaFileImage, FaFileWord, FaFileExcel, FaFolderOpen,
  FaCheckCircle, FaExclamationTriangle
} from 'react-icons/fa';

// ✅ Direct axios instance for uploads (bypass main api instance)
const uploadApi = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '',                             // Vite proxy use karega
  timeout: 600000,                        // 10 minutes per batch
  withCredentials: true,                  // Send cookies
  maxContentLength: Infinity,             // ✅ No response limit
  maxBodyLength: Infinity,                // ✅ No request limit
});

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

// ✅ Constants
const MAX_FILE_SIZE = 100 * 1024 * 1024;   // 100 MB per file
const MAX_FOLDER_FILES = 500;               // Max 500 files per folder
const BATCH_SIZE = 20;                      // ✅ 20 files per request
const MAX_TOTAL_SIZE = 200 * 1024 * 1024;  // 200 MB total safety limit

export default function BulkUploadModal({
  open,
  onClose,
  folderId,
  clientId,
  folderName,
  onUploaded
}) {
  const [mode, setMode] = useState('files'); // 'files' | 'folder'
  const [files, setFiles] = useState([]);
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [batchStatus, setBatchStatus] = useState({ current: 0, total: 0 });
  const [errors, setErrors] = useState([]);
  const [successMsg, setSuccessMsg] = useState('');
  const inputRef = useRef(null);
  const folderInputRef = useRef(null);

  // ✅ Reset on modal open
  useEffect(() => {
    if (open) {
      setMode('files');
      setFiles([]);
      setDragging(false);
      setUploading(false);
      setProgress(0);
      setBatchStatus({ current: 0, total: 0 });
      setErrors([]);
      setSuccessMsg('');
    }
  }, [open]);

  if (!open) return null;

  // ✅ Validate & add files
  const validateAndAdd = (newFiles) => {
    const valid = [];
    const newErrors = [];

    for (const f of newFiles) {
      if (f.size > MAX_FILE_SIZE) {
        newErrors.push(`${f.name} is too large (max 100MB)`);
        continue;
      }
      if (files.some(existing => existing.name === f.name && existing.size === f.size)) {
        newErrors.push(`${f.name} already added`);
        continue;
      }
      valid.push(f);
    }

    setFiles(prev => [...prev, ...valid]);

    if (newErrors.length > 0) {
      setErrors(newErrors.slice(0, 5)); // Show max 5 errors
      setTimeout(() => setErrors([]), 5000);
    }
  };

  // ✅ File selection (normal)
  const handleFileSelect = (e) => {
    const selected = Array.from(e.target.files || []);
    setMode('files');
    validateAndAdd(selected);
    e.target.value = '';
  };

  // ✅ Folder selection (recursive)
  const handleFolderSelect = (e) => {
    const selected = Array.from(e.target.files || []);

    if (selected.length > MAX_FOLDER_FILES) {
      setErrors([`Too many files (${selected.length}). Max ${MAX_FOLDER_FILES} per upload.`]);
      setTimeout(() => setErrors([]), 6000);
      e.target.value = '';
      return;
    }

    const totalSize = selected.reduce((sum, f) => sum + f.size, 0);
    if (totalSize > MAX_TOTAL_SIZE) {
      setErrors([`Total size too large (${(totalSize / 1024 / 1024).toFixed(1)}MB). Max ${MAX_TOTAL_SIZE / 1024 / 1024}MB.`]);
      setTimeout(() => setErrors([]), 6000);
      e.target.value = '';
      return;
    }

    setMode('folder');
    setFiles([]); // Fresh start
    validateAndAdd(selected);
    e.target.value = '';
  };

  // ✅ Drag & Drop
  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    const dropped = Array.from(e.dataTransfer.files || []);
    setMode('files');
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

  // ✅ Upload — smart batching (files vs folder)
  const handleUpload = async () => {
    if (files.length === 0) return;

    try {
      setUploading(true);
      setProgress(0);
      setErrors([]);
      setSuccessMsg('');

      const totalFiles = files.length;
      const totalBatches = Math.ceil(totalFiles / BATCH_SIZE);
      setBatchStatus({ current: 0, total: totalBatches });

      let uploadedCount = 0;
      let totalFoldersCreated = 0;
      const allErrors = [];
      const allUploadedFiles = [];

      const endpoint = mode === 'folder'
        ? '/api/custom-files/upload-folder'
        : '/api/custom-files/upload';

      // ✅ Process in batches
      for (let batchIdx = 0; batchIdx < totalBatches; batchIdx++) {
        const start = batchIdx * BATCH_SIZE;
        const end = Math.min(start + BATCH_SIZE, totalFiles);
        const batchFiles = files.slice(start, end);

        setBatchStatus({ current: batchIdx + 1, total: totalBatches });

        const formData = new FormData();
        formData.append('folderId', folderId);
        formData.append('clientId', clientId);

        for (const f of batchFiles) {
          formData.append('files', f);
          // ✅ Preserve relative path for folder mode
          if (mode === 'folder' && f.webkitRelativePath) {
            formData.append('paths', f.webkitRelativePath);
          } else {
            formData.append('paths', f.name);
          }
        }

        try {
          const response = await uploadApi.post(endpoint, formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
            onUploadProgress: (e) => {
              if (e.total) {
                const batchProgress = e.loaded / e.total; // 0-1
                const overallProgress =
                  ((uploadedCount + batchProgress * batchFiles.length) / totalFiles) * 100;
                setProgress(Math.round(overallProgress));
              }
            }
          });

          // ✅ Success for this batch
          uploadedCount += batchFiles.length;
          if (response.data.foldersCreated) {
            totalFoldersCreated += response.data.foldersCreated;
          }
          if (response.data.files) {
            allUploadedFiles.push(...response.data.files);
          }

        } catch (batchError) {
          console.error(`❌ Batch ${batchIdx + 1} failed:`, batchError);

          const errorMessage = batchError.response?.data?.message
            || batchError.message
            || 'Unknown error';

          allErrors.push(
            `Batch ${batchIdx + 1}/${totalBatches} (${batchFiles.length} files): ${errorMessage}`
          );

          // ✅ Continue with next batch (don't abort whole upload)
        }

        // Update progress after batch
        setProgress(Math.round((uploadedCount / totalFiles) * 100));
      }

      // ✅ Final result
      if (allErrors.length > 0) {
        setErrors(allErrors.slice(0, 5));
        setTimeout(() => setErrors([]), 10000);
      }

      if (uploadedCount > 0) {
        // Notify parent
        onUploaded?.({
          filesCount: uploadedCount,
          foldersCreated: totalFoldersCreated,
          totalBatches,
          success: uploadedCount,
          failed: totalFiles - uploadedCount,
          files: allUploadedFiles,
        });

        // Show success message
        const successText = allErrors.length === 0
          ? `✅ All ${uploadedCount} file(s) uploaded successfully!`
          : `⚠️ ${uploadedCount}/${totalFiles} file(s) uploaded. ${allErrors.length} batch(es) failed.`;

        setSuccessMsg(successText);

        // Auto close on full success
        if (allErrors.length === 0) {
          setTimeout(() => onClose(), 1200);
        } else {
          setTimeout(() => {
            setSuccessMsg('');
            onClose();
          }, 3000);
        }
      } else {
        // Nothing uploaded
        setErrors(['❌ All batches failed. Please check your connection and try again.']);
        setTimeout(() => setErrors([]), 8000);
      }

    } catch (err) {
      console.error('❌ Upload error:', err);
      setErrors([err.message || 'Upload failed. Please try again.']);
      setTimeout(() => setErrors([]), 8000);
    } finally {
      setUploading(false);
      setProgress(0);
      setBatchStatus({ current: 0, total: 0 });
    }
  };

  const totalSize = files.reduce((sum, f) => sum + f.size, 0);
  const totalBatches = Math.ceil(files.length / BATCH_SIZE);

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/70 backdrop-blur-md p-4">
      <div className="glass w-full max-w-2xl max-h-[90vh] overflow-hidden rounded-2xl relative flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-white/10">
          <div>
            <h2 className="text-2xl font-bold">
              {mode === 'folder' ? '📁 Upload Folder' : '📤 Upload Files'}
            </h2>
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

        {/* Mode Tabs */}
        <div className="flex gap-2 p-4 pb-0">
          <button
            onClick={() => { setMode('files'); setFiles([]); }}
            disabled={uploading}
            className={`flex-1 px-4 py-2 rounded-lg text-sm transition flex items-center justify-center gap-2 ${
              mode === 'files'
                ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-400/40'
                : 'glass-card text-gray-400 hover:text-white'
            }`}
          >
            <FaUpload /> Upload Files
          </button>
          <button
            onClick={() => { setMode('folder'); setFiles([]); }}
            disabled={uploading}
            className={`flex-1 px-4 py-2 rounded-lg text-sm transition flex items-center justify-center gap-2 ${
              mode === 'folder'
                ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-400/40'
                : 'glass-card text-gray-400 hover:text-white'
            }`}
          >
            <FaFolderOpen /> Upload Folder
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto flex-1">
          {/* Drop Zone — FILES MODE */}
          {mode === 'files' && (
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
                {dragging ? '🎯 Drop files here!' : '📎 Click to select or drag & drop files'}
              </p>
              <p className="text-xs text-gray-400 mt-2">
                Any type: PDF, Images, Word, Excel, Text • Max 100MB per file
              </p>
            </div>
          )}

          {/* Drop Zone — FOLDER MODE */}
          {mode === 'folder' && (
            <div
              onClick={() => !uploading && folderInputRef.current?.click()}
              className={`relative border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all border-gray-600 hover:border-cyan-400/50 ${
                uploading ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              <input
                ref={folderInputRef}
                type="file"
                webkitdirectory="true"
                directory="true"
                multiple
                onChange={handleFolderSelect}
                disabled={uploading}
                className="hidden"
              />
              <FaFolderOpen className="text-4xl mx-auto mb-3 text-cyan-400" />
              <p className="text-white font-medium">
                📁 Click to select a folder
              </p>
              <p className="text-xs text-gray-400 mt-2">
                Whole folder (with subfolders & files) will be uploaded • Max 500 files
              </p>
              <p className="text-xs text-yellow-400/70 mt-1">
                ⚠️ Empty folders will be skipped (browser limitation)
              </p>
            </div>
          )}

          {/* Errors */}
          {errors.length > 0 && (
            <div className="mt-4 glass-card p-3 border border-red-400/30">
              {errors.map((err, i) => (
                <p key={i} className="text-red-400 text-sm flex items-start gap-2">
                  <FaExclamationTriangle className="mt-0.5 flex-shrink-0" />
                  <span>{err}</span>
                </p>
              ))}
            </div>
          )}

          {/* Success message */}
          {successMsg && (
            <div className="mt-4 glass-card p-3 border border-green-400/30">
              <p className="text-green-400 text-sm flex items-center gap-2">
                <FaCheckCircle />
                <span>{successMsg}</span>
              </p>
            </div>
          )}

          {/* File List */}
          {files.length > 0 && (
            <div className="mt-4">
              <div className="flex justify-between items-center mb-2">
                <div>
                  <p className="text-sm font-medium text-white">
                    {files.length} file(s) • {formatSize(totalSize)}
                    {mode === 'folder' && (
                      <span className="text-cyan-400 ml-2">
                        (folder structure preserved)
                      </span>
                    )}
                  </p>
                  {totalBatches > 1 && (
                    <p className="text-xs text-gray-400 mt-0.5">
                      Will upload in {totalBatches} batches (max {BATCH_SIZE} files per batch)
                    </p>
                  )}
                </div>
                {!uploading && (
                  <button
                    onClick={() => setFiles([])}
                    className="text-xs text-red-400 hover:text-red-300 flex-shrink-0"
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
                      <p
                        className="text-sm text-white truncate"
                        title={f.webkitRelativePath || f.name}
                      >
                        {f.webkitRelativePath || f.name}
                      </p>
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
                <span>
                  Uploading batch {batchStatus.current}/{batchStatus.total}...
                </span>
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
            {uploading
              ? `⏳ Uploading ${progress}%`
              : `📤 Upload ${files.length} file(s)`}
          </button>
        </div>
      </div>
    </div>
  );
}