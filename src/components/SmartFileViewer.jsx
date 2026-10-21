import React, { useState } from 'react';
import { FaEye, FaDownload, FaFilePdf, FaFileImage, FaFileAlt, FaTimes, FaSpinner } from 'react-icons/fa';
import api from '../utils/api'; // 👈 Tera main axios instance

export default function SmartFileViewer({ fileUrl, fileName = "Attachment" }) {
  const [isOpen, setIsOpen] = useState(false);
  const [downloading, setDownloading] = useState(false);

  if (!fileUrl) return null;

  // ✅ File type detect karo
  const lowerUrl = fileUrl.toLowerCase();
  const isPdf = lowerUrl.includes('.pdf') || lowerUrl.includes('application/pdf');
  const isImage = /\.(jpg|jpeg|png|webp|gif|bmp|svg)(\?|$)/i.test(lowerUrl);
  const isDoc = /\.(doc|docx|xls|xlsx|txt|csv)(\?|$)/i.test(lowerUrl);

  // ✅ Force Download (Blob method - naye tab me open nahi hoga)
  const handleDownload = async () => {
    try {
      setDownloading(true);
      
      let finalUrl = fileUrl;
      // Agar Cloudinary hai toh fl_attachment laga do
      if (finalUrl.includes('cloudinary.com') && !finalUrl.includes('fl_attachment')) {
        finalUrl = finalUrl.replace('/upload/', '/upload/fl_attachment:/');
      }

      // API se file blob format me fetch karo
      const response = await api.get(finalUrl, { 
        responseType: 'blob',
        timeout: 600000 // 10 mins for large files
      });

      // Blob URL create karke download trigger karo
      const blob = new Blob([response.data]);
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      
      // File extension nikal ke name set karo
      const ext = isPdf ? '.pdf' : isImage ? '.jpg' : isDoc ? '.docx' : '';
      link.setAttribute('download', fileName.includes('.') ? fileName : `${fileName}${ext}`);
      
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      // Memory clean karo
      setTimeout(() => window.URL.revokeObjectURL(downloadUrl), 10000);
    } catch (err) {
      console.error("Download failed:", err);
      // Agar API fail ho jaye (CORS etc), toh direct open kardo fallback me
      window.open(fileUrl, '_blank');
    } finally {
      setDownloading(false);
    }
  };

  // ✅ View render logic
  const renderPreview = () => {
    if (isImage) {
      return <img src={fileUrl} alt={fileName} className="max-w-full max-h-full object-contain mx-auto rounded-lg" />;
    }
    
    if (isPdf) {
      return (
        <object data={fileUrl} type="application/pdf" className="w-full h-full rounded-lg">
          <iframe src={fileUrl} className="w-full h-full rounded-lg bg-white" title="PDF Preview" />
        </object>
      );
    }

    if (isDoc) {
      const officeViewerUrl = `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(fileUrl)}`;
      return <iframe src={officeViewerUrl} className="w-full h-full rounded-lg bg-white" title="Doc Preview" />;
    }

    // Fallback (HTML, txt, etc)
    return (
      <iframe src={fileUrl} className="w-full h-full rounded-lg bg-white" title="File Preview" />
    );
  };

  const getFileIcon = () => {
    if (isPdf) return <FaFilePdf className="text-red-400" />;
    if (isImage) return <FaFileImage className="text-cyan-400" />;
    return <FaFileAlt className="text-yellow-400" />;
  };

  return (
    <>
      <div className="flex items-center gap-1.5">
        <button
          onClick={() => setIsOpen(true)}
          className="flex items-center gap-1.5 px-2.5 py-1.5 bg-blue-600/20 text-blue-400 border border-blue-500/30 rounded-lg hover:bg-blue-600/40 transition text-xs font-medium"
          title="View File"
        >
          <FaEye /> View
        </button>
        
        <button
          onClick={handleDownload}
          disabled={downloading}
          className="flex items-center gap-1.5 px-2.5 py-1.5 bg-green-600/20 text-green-400 border border-green-500/30 rounded-lg hover:bg-green-600/40 transition text-xs font-medium disabled:opacity-50"
          title="Download File"
        >
          {downloading ? <FaSpinner className="animate-spin" /> : <FaDownload />} 
          {downloading ? 'Wait' : 'Download'}
        </button>
      </div>

      {/* MODAL */}
      {isOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
          <div className="bg-slate-900 border border-white/10 w-full max-w-5xl h-[85vh] rounded-2xl flex flex-col overflow-hidden relative shadow-2xl">
            <div className="flex justify-between items-center p-3 border-b border-white/10 bg-slate-800">
              <div className="flex items-center gap-2 truncate max-w-[70%]">
                <span className="text-xl">{getFileIcon()}</span>
                <h3 className="text-white text-sm font-medium truncate">{fileName}</h3>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={handleDownload} disabled={downloading} className="text-green-400 hover:text-green-300 p-2 text-sm disabled:opacity-50">
                  {downloading ? 'Downloading...' : 'Download'}
                </button>
                <button onClick={() => setIsOpen(false)} className="text-red-400 hover:text-red-300 p-2">
                  <FaTimes size={18} />
                </button>
              </div>
            </div>
            <div className="flex-1 bg-slate-800/50 p-1 overflow-hidden">
              {renderPreview()}
            </div>
          </div>
        </div>
      )}
    </>
  );
}