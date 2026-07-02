import { useEffect, useState } from "react";
import Select from "react-select";
import axios from 'axios';

const API_URL = 'https://legalvault-jm2n.onrender.com';

function AddRegistrationModal({
  open,
  onClose,
  onSave,
  editData,
}) {
  const [formData, setFormData] = useState({
    category: "",
    customCategory: "",
    registrationName: "",
    startDate: "",
    endDate: "",
    status: "Valid",
    pdf: "",
    pdfFile: null, // ✅ File object for upload
    pdfUrl: "",
  });
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (editData) {
      setFormData({
        ...editData,
        pdfFile: null,
      });
    } else {
      setFormData({
        category: "",
        customCategory: "",
        registrationName: "",
        startDate: "",
        endDate: "",
        status: "Valid",
        pdf: "",
        pdfFile: null,
        pdfUrl: "",
      });
    }
  }, [editData]);

  if (!open) return null;

  // ✅ Upload PDF to GridFS
const uploadPDF = async (file) => {
  try {
    const token = localStorage.getItem('token');
    console.log('🔑 PDF Upload - Token:', token ? '✅ Yes' : '❌ No');

    if (!token) {
      alert('Please login again');
      return null;
    }

    const formData = new FormData();
    formData.append('pdf', file);
    
    const response = await axios.post(`${API_URL}/api/pdfs/pdf`, formData, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'multipart/form-data'
      }
    });
    console.log('✅ PDF uploaded successfully:', response.data);
    return response.data.url;
  } catch (error) {
    console.error('❌ PDF upload error:', error.response?.data || error.message);
    return null;
  }
};

  const registrationOptions = [
    { value: "GST Registration", label: "GST Registration" },
    { value: "PF Registration", label: "PF Registration" },
    { value: "ESIC Registration", label: "ESIC Registration" },
    { value: "ISO Certificate", label: "ISO Certificate" },
    { value: "Trade License", label: "Trade License" },
    { value: "Shops & Establishment", label: "Shops & Establishment" },
    { value: "MSME Registration", label: "MSME Registration" },
    { value: "Import Export Code", label: "Import Export Code" },
    { value: "FSSAI License", label: "FSSAI License" },
    { value: "Co/LLP", label: "Co/LLP" },
    { value: "Factory", label: "Factory" },
    { value: "FIU", label: "FIU" },
    { value: "Partnership Firm", label: "Partnership Firm" },
    { value: "Trademark Registration", label: "Trademark Registration" },
    { value: "Copyright", label: "Copyright" },
    { value: "Labours License", label: "Labours License" },
    { value: "Pollution Control", label: "Pollution Control" },
    { value: "Five NOC", label: "Five NOC" },
    { value: "Lift NOC", label: "Lift NOC" },
    { value: "PAN/TAN", label: "PAN/TAN" },
    { value: "ICE GATE", label: "ICE GATE" },
    { value: "Others", label: "Others" },
  ];

  const statusOptions = [
    { value: "Valid", label: "Valid" },
    { value: "Invalid", label: "Invalid" },
    { value: "Renewed", label: "Renewed" },
    { value: "Expired", label: "Expired" },
  ];

  const customSelectStyles = {
    control: (provided, state) => ({
      ...provided,
      background: "rgba(255,255,255,0.04)",
      backdropFilter: "blur(25px)",
      border: state.isFocused
        ? "1px solid rgba(59,130,246,.5)"
        : "1px solid rgba(255,255,255,.08)",
      borderRadius: "24px",
      minHeight: "56px",
      boxShadow: "none",
      color: "#fff",
    }),
    menu: (provided) => ({
      ...provided,
      background: "rgba(15,23,42,.95)",
      backdropFilter: "blur(30px)",
      borderRadius: "20px",
      border: "1px solid rgba(255,255,255,.08)",
      overflow: "hidden",
      zIndex: 9999,
    }),
    option: (provided, state) => ({
      ...provided,
      background: state.isFocused
        ? "rgba(59,130,246,.20)"
        : "transparent",
      color: "#fff",
      cursor: "pointer",
    }),
    singleValue: (provided) => ({
      ...provided,
      color: "#fff",
    }),
    placeholder: (provided) => ({
      ...provided,
      color: "rgba(255,255,255,.6)",
    }),
    input: (provided) => ({
      ...provided,
      color: "#fff",
    }),
    dropdownIndicator: (provided) => ({
      ...provided,
      color: "#fff",
    }),
    indicatorSeparator: () => ({
      display: "none",
    }),
  };

  const handleSave = async () => {
    let pdfUrl = formData.pdf;

    // ✅ If PDF file is selected, upload it
    if (formData.pdfFile) {
      setUploading(true);
      const uploadedUrl = await uploadPDF(formData.pdfFile);
      setUploading(false);
      if (uploadedUrl) {
        pdfUrl = uploadedUrl;
      }
    }

    const finalData = {
      ...formData,
      category: formData.category === "Others" ? formData.customCategory : formData.category,
      pdf: pdfUrl,
      pdfFile: undefined,
    };

    onSave(finalData);

    setFormData({
      category: "",
      customCategory: "",
      registrationName: "",
      startDate: "",
      endDate: "",
      status: "Valid",
      pdf: "",
      pdfFile: null,
      pdfUrl: "",
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-[9999] p-4">
      <div className="glass p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <h2 className="text-2xl font-bold mb-6 text-white">
          {editData ? "Edit Registration" : "Add Registration"}
        </h2>

        <div className="space-y-4">
          <Select
            styles={customSelectStyles}
            options={registrationOptions}
            placeholder="Select Registration Type"
            value={formData.category ? { value: formData.category, label: formData.category } : null}
            onChange={(selected) =>
              setFormData({ ...formData, category: selected.value })
            }
          />

          {formData.category === "Others" && (
            <input
              type="text"
              placeholder="Enter Custom Registration"
              value={formData.customCategory}
              onChange={(e) =>
                setFormData({ ...formData, customCategory: e.target.value })
              }
              className="glass-card p-4 w-full text-white outline-none"
            />
          )}

          <input
            type="text"
            placeholder="Registration Name"
            value={formData.registrationName}
            onChange={(e) =>
              setFormData({ ...formData, registrationName: e.target.value })
            }
            className="glass-card p-4 w-full text-white outline-none"
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="date"
              value={formData.startDate}
              onChange={(e) =>
                setFormData({ ...formData, startDate: e.target.value })
              }
              className="glass-card p-4 w-full text-white outline-none"
            />
            <input
              type="date"
              value={formData.endDate}
              onChange={(e) =>
                setFormData({ ...formData, endDate: e.target.value })
              }
              className="glass-card p-4 w-full text-white outline-none"
            />
          </div>

          <Select
            styles={customSelectStyles}
            options={statusOptions}
            placeholder="Select Status"
            value={{ value: formData.status, label: formData.status }}
            onChange={(selected) =>
              setFormData({ ...formData, status: selected.value })
            }
          />

          {/* ✅ PDF Upload */}
          <div className="glass-card p-4">
            <label className="block text-sm text-gray-400 mb-2">Upload PDF Document</label>
            <input
              type="file"
              accept=".pdf"
              onChange={(e) => {
                const file = e.target.files[0];
                if (file) {
                  setFormData({
                    ...formData,
                    pdfFile: file,
                    pdf: file.name,
                  });
                }
              }}
              className="w-full text-white file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-cyan-500/20 file:text-cyan-400 hover:file:bg-cyan-500/30"
            />
            {formData.pdf && (
              <div className="mt-2 text-sm text-green-400">
                📄 Selected: {formData.pdf}
              </div>
            )}
            {uploading && (
              <div className="mt-2 text-sm text-yellow-400">
                ⏳ Uploading PDF...
              </div>
            )}
          </div>

          {formData.pdfUrl && (
            <div className="glass-card p-4">
              <a
                href={formData.pdfUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-cyan-400 hover:underline"
              >
                📄 View PDF
              </a>
            </div>
          )}
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