import React, { useState } from 'react';
import { FaEye, FaDownload, FaFilePdf, FaFileImage, FaFileAlt, FaTimes } from 'react-icons/fa';

export default function SmartFileViewer({ fileUrl, fileName = "Attachment" }) {
  const [isOpen, setIsOpen] = useState(false);

  if (!fileUrl) return null;

  // ✅ File type detect karo URL se
  const isPdf = fileUrl.toLowerCase().includes('.pdf') || fileUrl.includes('/raw/upload/') && fileName.toLowerCase().endsWith('.pdf');
  const isImage = /\.(jpg|jpeg|png|webp|gif|bmp|svg)$/i.test(fileUrl) || fileUrl.match(/\.(jpg|jpeg|png|webp|gif|bmp|svg)(\?|$)/i);
  const isDoc = /\.(doc|docx|xls|xlsx|txt|csv)$/i.test(fileUrl) || fileUrl.match(/\.(doc|docx|xls|xlsx|txt|csv)(\?|$)/i);

  // ✅ Download handle karne ke liye (Cloudinary/R2 ke liye)
  const handleDownload = () => {
    let downloadUrl = fileUrl;
    
    // Agar Cloudinary hai, toh fl_attachment laga kar force download karo
    if (fileUrl.includes('cloudinary.com')) {
      downloadUrl = fileUrl.replace('/upload/', '/upload/fl_attachment:/');
      window.open(downloadUrl, '_blank');
    } 
    // Agar R2 ya normal URL hai
    else {
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  // ✅ View render karne ka logic
  const renderPreview = () => {
    if (isPdf) {
      return (
        <iframe
          src={`${fileUrl}#toolbar=0`}
          className="w-full h-full rounded-lg bg-white"
          title="PDF Preview"
        />
      );
    }
    if (isImage) {
      return (
        <img 
          src={fileUrl} 
          alt={fileName} 
          className="max-w-full max-h-full object-contain mx-auto rounded-lg" 
        />
      );
    }
    if (isDoc) {
      // Word/Excel ko direct preview nahi kar sakte, isliye MS Office Viewer use karenge
      const officeViewerUrl = `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(fileUrl)}`;
      return (
        <iframe
          src={officeViewerUrl}
          className="w-full h-full rounded-lg bg-white"
          title="Document Preview"
        />
      );
    }
    
    return (
      <div className="flex flex-col items-center justify-center h-full text-gray-500">
        <FaFileAlt size={50} className="mb-3" />
        <p>Preview not available for this format.</p>
        <p className="text-sm mt-2">Please download to view.</p>
      </div>
    );
  };

  // ✅ Icon return karo file type ke hisaab se
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
          className="flex items-center gap-2 px-3 py-1.5 bg-blue-600/20 text-blue-400 border border-blue-500/30 rounded-lg hover:bg-blue-600/40 transition text-sm"
        >
          <FaEye /> View Invoice
        </button>
        
        <button
          onClick={handleDownload}
          className="flex items-center gap-2 px-3 py-1.5 bg-green-600/20 text-green-400 border border-green-500/30 rounded-lg hover:bg-green-600/40 transition text-sm"
        >
          <FaDownload /> Download
        </button>
      </div>

      {/* ✅ MODAL FOR PREVIEW */}
      {isOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
          <div className="bg-slate-900 border border-white/10 w-full max-w-5xl h-[85vh] rounded-2xl flex flex-col overflow-hidden relative shadow-2xl">
            
            {/* Header */}
            <div className="flex justify-between items-center p-4 border-b border-white/10 bg-slate-800">
              <div className="flex items-center gap-3">
                <span className="text-2xl">{getFileIcon()}</span>
                <h3 className="text-white font-medium truncate max-w-md">{fileName}</h3>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={handleDownload}
                  className="text-green-400 hover:text-green-300 transition p-2"
                  title="Download File"
                >
                  <FaDownload size={18} />
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-red-400 hover:text-red-300 transition p-2"
                  title="Close"
                >
                  <FaTimes size={20} />
                </button>
              </div>
            </div>

            {/* Preview Body */}
            <div className="flex-1 bg-slate-800/50 p-2 overflow-hidden">
              {renderPreview()}
            </div>

          </div>
        </div>
      )}
    </>
  );
}