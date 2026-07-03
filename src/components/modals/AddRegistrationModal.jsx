import { useEffect, useState } from "react";
import Select from "react-select";
import axios from 'axios';

const API_URL = 'https://legalvault-jm2n.onrender.com';

function AddRegistrationModal({ open, onClose, onSave, editData }) {
  const [formData, setFormData] = useState({
    category: "",
    customCategory: "",
    registrationName: "",
    startDate: "",
    endDate: "",
    status: "Valid",
    documents: [] // ✅ Multiple documents
  });
  const [uploading, setUploading] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);

  useEffect(() => {
    if (editData) {
      setFormData({
        ...editData,
        documents: editData.documents || []
      });
      setSelectedFiles([]);
    } else {
      setFormData({
        category: "",
        customCategory: "",
        registrationName: "",
        startDate: "",
        endDate: "",
        status: "Valid",
        documents: []
      });
      setSelectedFiles([]);
    }
  }, [editData]);

  if (!open) return null;

  // ✅ Upload Multiple Documents
  const uploadDocuments = async (files) => {
    try {
      const token = localStorage.getItem('token');
      const formData = new FormData();
      
      for (const file of files) {
        formData.append('documents', file);
      }
      
      const response = await axios.post(`${API_URL}/api/pdfs/documents`, formData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      return response.data.files;
    } catch (error) {
      console.error('Upload error:', error);
      return null;
    }
  };

  const handleSave = async () => {
    let uploadedDocs = [];

    if (selectedFiles.length > 0) {
      setUploading(true);
      uploadedDocs = await uploadDocuments(selectedFiles);
      setUploading(false);
    }

    const finalData = {
      ...formData,
      category: formData.category === "Others" ? formData.customCategory : formData.category,
      documents: [...formData.documents, ...(uploadedDocs || [])]
    };

    onSave(finalData);
    onClose();
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    setSelectedFiles(prev => [...prev, ...files]);
  };

  const removeFile = (index) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  // ... (rest of the modal UI with multiple file upload)

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-[9999] p-4">
      <div className="glass p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <h2 className="text-2xl font-bold mb-6 text-white">
          {editData ? "Edit Registration" : "Add Registration"}
        </h2>

        <div className="space-y-4">
          {/* ... other fields (Select, Inputs) ... */}

          {/* ✅ Multiple File Upload */}
          <div className="glass-card p-4">
            <label className="block text-sm text-gray-400 mb-2">
              Upload Documents (PDF, JPG, PNG)
            </label>
            <input
              type="file"
              multiple
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={handleFileChange}
              className="w-full text-white file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-cyan-500/20 file:text-cyan-400 hover:file:bg-cyan-500/30"
            />
            
            {/* Show selected files */}
            {selectedFiles.length > 0 && (
              <div className="mt-3 space-y-2">
                {selectedFiles.map((file, index) => (
                  <div key={index} className="flex items-center justify-between glass-card p-2">
                    <span className="text-sm text-white">
                      {file.name} ({(file.size / 1024).toFixed(1)} KB)
                    </span>
                    <button
                      onClick={() => removeFile(index)}
                      className="text-red-400 hover:text-red-300"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}
            
            {uploading && (
              <div className="mt-2 text-sm text-yellow-400">
                ⏳ Uploading documents...
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row justify-end gap-3 mt-8">
          <button onClick={onClose} className="glass-card px-6 py-3 text-white">
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={uploading}
            className={`glass-card px-6 py-3 text-white blue-glow ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {uploading ? 'Uploading...' : 'Save Registration'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default AddRegistrationModal;