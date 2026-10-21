import React, { useState } from 'react';
import { FaEye, FaDownload, FaFilePdf, FaFileImage, FaFileAlt, FaTimes, FaSpinner } from 'react-icons/fa';

export default function SmartFileViewer({ fileUrl, fileName = "Attachment" }) {
  const [isOpen, setIsOpen] = useState(false);
  const [downloading, setDownloading] = useState(false);

  if (!fileUrl) return null;

  const lowerUrl = fileUrl.toLowerCase();
  const isPdf = lowerUrl.includes('.pdf');
  const isImage = /\.(jpg|jpeg|png|webp|gif|bmp|svg)(\?|$)/i.test(lowerUrl);
  const isDoc = /\.(doc|docx|xls|xlsx|txt|csv)(\?|$)/i.test(lowerUrl);

  // ✅ Force Download Function (Naya tab nahi khulega)
  const handleDownload = async () => {
    try {
      setDownloading(true);
      
      let finalUrl = fileUrl;
      // Cloudinary ke liye force download flag
      if (finalUrl.includes('cloudinary.com') && !finalUrl.includes('fl_attachment')) {
        finalUrl = finalUrl.replace('/upload/', '/upload/fl_attachment:/');
      }

      // Native fetch use kar rahe hain taaki CORS cross-origin download ho sake
      const response = await fetch(finalUrl, { method: 'GET' });
      if (!response.ok) throw new Error('Network response was not ok');
      
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = downloadUrl;
      
      // File extension nikal kar sahi naam set karo
      const urlParts = fileUrl.split('/');
      let originalFileName = urlParts[urlParts.length - 1].split('?')[0];
      
      // Agar file name URL se nahi mila toh generic naam do
      if (!originalFileName || originalFileName.length > 50) {
         originalFileName = fileName.includes('.') ? fileName : `${fileName}.file`;
      }

      link.setAttribute('download', originalFileName); 
      
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      setTimeout(() => window.URL.revokeObjectURL(downloadUrl), 10000);
    } catch (err) {
      console.error("Download failed:", err);
      // Fallback: Agar fetch fail ho jaye toh direct open kar do
      window.open(fileUrl, '_blank');
    } finally {
      setDownloading(false);
    }
  };

  // ✅ Preview Render Logic
  const renderPreview = () => {
    if (isImage) {
      return <img src={fileUrl} alt={fileName} className="max-w-full max-h-full object-contain mx-auto rounded-lg" />;
    }
    
    if (isPdf) {
      return (
        <iframe src={fileUrl} className="w-full h-full bg-white rounded-lg" title="PDF Preview" />
      );
    }

    if (isDoc) {
      const officeViewerUrl = `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(fileUrl)}`;
      return <iframe src={officeViewerUrl} className="w-full h-full bg-white rounded-lg" title="Doc Preview" />;
    }

    // HTML aur baaki files ke liye
    return (
      <iframe src={fileUrl} className="w-full h-full bg-white rounded-lg" title="File Preview" />
    );
  };

  const getFileIcon = () => {
    if (isPdf) return <FaFilePdf className="text-red-400" />;
    if (isImage) return <FaFileImage className="text-cyan-400" />;
    return <FaFileAlt className="text-yellow-400" />;
  };

  return (
    <>
      <div className="flex items-center gap-2">
        <button
          onClick={() => setIsOpen(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600/20 text-blue-400 border border-blue-500/30 rounded hover:bg-blue-600/40 transition text-xs"
        >
          <FaEye /> View
        </button>
        
        <button
          onClick={handleDownload}
          disabled={downloading}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-green-600/20 text-green-400 border border-green-500/30 rounded hover:bg-green-600/40 transition text-xs disabled:opacity-50"
        >
          {downloading ? <FaSpinner className="animate-spin" /> : <FaDownload />} 
          {downloading ? 'Downloading...' : 'Download'}
        </button>
      </div>

      {/* ✅ FULL SCREEN MODAL FOR PREVIEW */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/90 p-4 backdrop-blur-sm"
          onClick={() => setIsOpen(false)} // Kahi bhi bahar click karne pe close ho jayega
        >
          <div 
            className="bg-slate-900 border border-white/10 w-full max-w-6xl h-[90vh] rounded-xl flex flex-col overflow-hidden shadow-2xl relative"
            onClick={(e) => e.stopPropagation()} // Andar click karne pe close na ho
          >
            {/* Modal Header */}
            <div className="flex justify-between items-center p-3 border-b border-white/10 bg-slate-800 shrink-0">
              <div className="flex items-center gap-2 overflow-hidden">
                <span className="text-xl">{getFileIcon()}</span>
                <h3 className="text-white text-sm font-medium truncate">{fileName}</h3>
              </div>
              <div className="flex items-center gap-4">
                <button 
                  onClick={handleDownload} 
                  disabled={downloading} 
                  className="text-green-400 hover:text-green-300 text-sm flex items-center gap-1 disabled:opacity-50"
                >
                  <FaDownload /> Download
                </button>
                <button 
                  onClick={() => setIsOpen(false)} 
                  className="text-red-400 hover:text-red-300 p-1 bg-red-500/10 rounded-full hover:bg-red-500/20 transition"
                  title="Close"
                >
                  <FaTimes size={20} />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="flex-1 bg-slate-950 p-2 overflow-hidden">
              {renderPreview()}
            </div>
          </div>
        </div>
      )}
    </>
  );
}