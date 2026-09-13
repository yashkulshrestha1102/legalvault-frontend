import { useEffect, useState } from 'react';
import { FaTimes, FaDownload } from 'react-icons/fa';
import api from '../../utils/api';

export default function FilePreviewModal({ open, onClose, file }) {
  const [blobUrl, setBlobUrl] = useState(null);
  const [textContent, setTextContent] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!open || !file) {
      setBlobUrl(null);
      setTextContent(null);
      setError(null);
      return;
    }

    let revoked = false;
    let createdUrl = null;

    const loadFile = async () => {
      setLoading(true);
      setError(null);
      try {
        const url = file.url || `/api/custom-files/file/${file.fileId}`;
        const response = await api.get(url, { responseType: 'blob' });

        // Text-based files
        if (
          file.fileType === 'text' ||
          file.mimeType === 'text/plain' ||
          file.mimeType === 'text/markdown'
        ) {
          const text = await response.data.text();
          if (!revoked) setTextContent(text);
        } else {
          const blob = new Blob([response.data], { type: file.mimeType });
          createdUrl = window.URL.createObjectURL(blob);
          if (!revoked) setBlobUrl(createdUrl);
        }
      } catch (err) {
        console.error('Preview error:', err);
        if (!revoked) setError('Failed to load preview');
      } finally {
        if (!revoked) setLoading(false);
      }
    };

    loadFile();

    return () => {
      revoked = true;
      if (createdUrl) {
        setTimeout(() => window.URL.revokeObjectURL(createdUrl), 100);
      }
    };
  }, [open, file]);

  const handleDownload = async () => {
    if (!file) return;
    try {
      const url = file.url || `/api/custom-files/file/${file.fileId}`;
      const response = await api.get(url, {
        responseType: 'blob',
        params: { download: 1 }
      });
      const blob = new Blob([response.data]);
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = file.filename || 'download';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);
    } catch (err) {
      console.error('Download error:', err);
      alert('Failed to download');
    }
  };

  if (!open || !file) return null;

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
      <div className="glass w-full max-w-5xl max-h-[92vh] rounded-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b border-white/10">
          <div className="min-w-0 flex-1">
            <h3 className="text-lg font-bold truncate">{file.filename}</h3>
            <p className="text-xs text-gray-400">
              {file.fileType?.toUpperCase()} • {file.mimeType}
            </p>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={handleDownload}
              className="glass-card px-3 py-2 text-green-400 hover:scale-105 transition text-sm flex items-center gap-2"
            >
              <FaDownload /> Download
            </button>
            <button
              onClick={onClose}
              className="glass-card px-3 py-2 hover:scale-105 transition"
            >
              <FaTimes />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-auto bg-black/40 flex items-center justify-center">
          {loading ? (
            <div className="text-gray-400 py-20">⏳ Loading preview...</div>
          ) : error ? (
            <div className="text-red-400 py-20">{error}</div>
          ) : file.fileType === 'image' && blobUrl ? (
            <img
              src={blobUrl}
              alt={file.filename}
              className="max-w-full max-h-full object-contain"
            />
          ) : file.fileType === 'pdf' && blobUrl ? (
            <iframe
              src={blobUrl}
              title={file.filename}
              className="w-full h-[75vh] bg-white"
            />
          ) : textContent !== null ? (
            <pre className="w-full h-full p-6 text-sm text-white whitespace-pre-wrap font-mono overflow-auto">
              {textContent}
            </pre>
          ) : (
            <div className="text-center py-20">
              <div className="text-6xl mb-4">📎</div>
              <p className="text-gray-400">Preview not available for this file type</p>
              <button
                onClick={handleDownload}
                className="glass-card px-6 py-3 mt-4 text-green-400 hover:scale-105 transition"
              >
                <FaDownload className="inline mr-2" /> Download to view
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}