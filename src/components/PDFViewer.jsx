import React, { useState } from 'react';
import { FaEye, FaDownload, FaUpload } from 'react-icons/fa';

const PDFViewer = ({ pdfUrl, onUpload, onDownload }) => {
  const [showPreview, setShowPreview] = useState(false);

  // ✅ View PDF - Google Docs Viewer
  const viewPDF = (url) => {
    if (!url) return;
    const viewerUrl = `https://docs.google.com/viewer?url=${encodeURIComponent(url)}&embedded=true`;
    window.open(viewerUrl, '_blank');
  };

  // ✅ Download PDF - Cloudinary fl_attachment flag
  const downloadPDF = (url) => {
    if (!url) return;
    let downloadUrl = url;
    if (url.includes('cloudinary.com')) {
      downloadUrl = url.replace('/upload/', '/upload/fl_attachment:/');
    }
    window.open(downloadUrl, '_blank');
  };

  return (
    <div className="flex items-center gap-3 flex-wrap">
      {/* Upload Button */}
      <label className="glass-card px-3 py-2 cursor-pointer hover:scale-105 transition">
        <FaUpload className="inline mr-2" />
        Upload PDF
        <input
          type="file"
          accept=".pdf"
          onChange={(e) => {
            const file = e.target.files[0];
            if (file && onUpload) onUpload(file);
          }}
          className="hidden"
        />
      </label>

      {/* View Button */}
      {pdfUrl && (
        <button
          onClick={() => viewPDF(pdfUrl)}
          className="glass-card px-3 py-2 text-cyan-400 hover:scale-105 transition"
        >
          <FaEye className="inline mr-2" />
          View PDF
        </button>
      )}

      {/* Download Button */}
      {pdfUrl && (
        <button
          onClick={() => downloadPDF(pdfUrl)}
          className="glass-card px-3 py-2 text-green-400 hover:scale-105 transition"
        >
          <FaDownload className="inline mr-2" />
          Download PDF
        </button>
      )}

      {/* PDF Preview Modal */}
      {showPreview && pdfUrl && (
        <div className="fixed inset-0 bg-black/80 z-50 flex justify-center items-center p-4">
          <div className="bg-white rounded-lg w-full max-w-4xl h-[80vh] relative">
            <button
              onClick={() => setShowPreview(false)}
              className="absolute top-2 right-2 text-white bg-red-500 rounded-full w-8 h-8 flex items-center justify-center hover:bg-red-600 z-10"
            >
              ✕
            </button>
            <iframe
              src={`https://docs.google.com/viewer?url=${encodeURIComponent(pdfUrl)}&embedded=true`}
              className="w-full h-full rounded-lg"
              title="PDF Preview"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default PDFViewer;