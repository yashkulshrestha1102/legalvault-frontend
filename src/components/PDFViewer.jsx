import React, { useState } from 'react';
import { FaEye, FaDownload, FaUpload } from 'react-icons/fa';

const PDFViewer = ({ pdfUrl, onUpload, onDownload }) => {
  const [showPreview, setShowPreview] = useState(false);

  // ✅ Cloudinary raw URL ko proper viewable link mein convert karo
  const getViewableUrl = (url) => {
    if (!url) return '';
    // Agar Cloudinary raw URL hai toh fl_attachment:hatao
    if (url.includes('cloudinary.com')) {
      // Cloudinary raw URL ko viewable banane ke liye fl_attachment parameter hatao
      return url.replace('/upload/', '/upload/fl_attachment:/');
    }
    return url;
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
          onClick={() => setShowPreview(!showPreview)}
          className="glass-card px-3 py-2 text-cyan-400 hover:scale-105 transition"
        >
          <FaEye className="inline mr-2" />
          {showPreview ? 'Hide PDF' : 'View PDF'}
        </button>
      )}

      {/* Download Button */}
      {pdfUrl && (
        <a
          href={pdfUrl}
          download
          target="_blank"
          rel="noopener noreferrer"
          className="glass-card px-3 py-2 text-green-400 hover:scale-105 transition"
        >
          <FaDownload className="inline mr-2" />
          Download PDF
        </a>
      )}

      {/* PDF Preview */}
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
              onError={(e) => {
                // Agar Google Docs Viewer fail ho toh direct download link dikhao
                e.target.style.display = 'none';
                const parent = e.target.parentElement;
                const msg = document.createElement('div');
                msg.className = 'flex flex-col items-center justify-center h-full text-gray-700';
                msg.innerHTML = `
                  <p class="text-lg mb-4">PDF preview not available</p>
                  <a href="${pdfUrl}" download class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
                    Download PDF to view
                  </a>
                `;
                parent.appendChild(msg);
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default PDFViewer;