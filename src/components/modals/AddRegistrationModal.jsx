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
  });
  const [uploading, setUploading] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (editData) {
      setFormData({
        category: editData.category || "",
        customCategory: editData.customCategory || "",
        registrationName: editData.registrationName || "",
        startDate: editData.startDate || "",
        endDate: editData.endDate || "",
        status: editData.status || "Valid",
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
      });
      setSelectedFiles([]);
    }
    setErrors({});
  }, [editData, open]);

  const validateForm = () => {
    const newErrors = {};
    if (!formData.category) newErrors.category = "Registration type is required";
    if (formData.category === "Others" && !formData.customCategory.trim()) {
      newErrors.customCategory = "Please enter custom registration type";
    }
    if (!formData.registrationName.trim()) {
      newErrors.registrationName = "Registration name is required";
    } else if (formData.registrationName.trim().length < 2) {
      newErrors.registrationName = "Registration name must be at least 2 characters";
    }
    if (!formData.startDate) newErrors.startDate = "Start date is required";
    if (!formData.endDate) {
      newErrors.endDate = "End date is required";
    } else if (formData.startDate && formData.endDate < formData.startDate) {
      newErrors.endDate = "End date must be after start date";
    }
    if (!formData.status) newErrors.status = "Please select a status";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const uploadDocuments = async (files) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('Please login again');
        return null;
      }
      const formData = new FormData();
      for (const file of files) {
        formData.append('pdf', file);
      }
      const response = await axios.post(`${API_URL}/api/pdfs/pdf`, formData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      console.log('✅ PDF uploaded:', response.data);
      return response.data.url || response.data.files || [];
    } catch (error) {
      console.error('❌ Upload error:', error.response?.data || error.message);
      alert('PDF upload failed. Please try again.');
      return null;
    }
  };

  const handleSave = async () => {
    if (!validateForm()) {
      return;
    }

    let uploadedDocs = [];
    let pdfUrl = null;

    if (selectedFiles.length > 0) {
      setUploading(true);
      const result = await uploadDocuments(selectedFiles);
      setUploading(false);
      
      if (result) {
        pdfUrl = Array.isArray(result) ? result[0] : result;
        uploadedDocs = Array.isArray(result) ? result : [result];
      }
    }

    const finalData = {
      ...formData,
      category: formData.category === "Others" ? formData.customCategory : formData.category,
      pdf: pdfUrl,
      pdfFile: selectedFiles.length > 0 ? selectedFiles[0] : null,
      documents: uploadedDocs || []
    };

    onSave(finalData);
    setFormData({
      category: "",
      customCategory: "",
      registrationName: "",
      startDate: "",
      endDate: "",
      status: "Valid",
    });
    setSelectedFiles([]);
    setErrors({});
    onClose();
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleSelectChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    const validFiles = files.filter(file => {
      if (file.size > 20 * 1024 * 1024) {
        alert(`❌ ${file.name} is too large (max 20MB)`);
        return false;
      }
      return true;
    });
    setSelectedFiles(prev => [...prev, ...validFiles]);
  };

  const removeFile = (index) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
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

  // ✅ Responsive Select Styles
  const customSelectStyles = {
    control: (provided) => ({
      ...provided,
      backgroundColor: "rgba(255,255,255,0.04)",
      border: "1px solid rgba(255,255,255,0.08)",
      borderRadius: "12px",
      minHeight: "48px",
      boxShadow: "none",
      color: "#fff",
      "&:hover": {
        borderColor: "rgba(59,130,246,0.5)"
      }
    }),
    menu: (provided) => ({
      ...provided,
      backgroundColor: "rgba(15,23,42,0.95)",
      borderRadius: "12px",
      border: "1px solid rgba(255,255,255,0.08)",
      zIndex: 9999,
    }),
    option: (provided, state) => ({
      ...provided,
      backgroundColor: state.isFocused ? "rgba(59,130,246,0.20)" : "transparent",
      color: "#fff",
      cursor: "pointer",
      padding: "10px 16px",
    }),
    singleValue: (provided) => ({
      ...provided,
      color: "#fff",
    }),
    placeholder: (provided) => ({
      ...provided,
      color: "rgba(255,255,255,0.6)",
    }),
    input: (provided) => ({
      ...provided,
      color: "#fff",
    }),
    dropdownIndicator: (provided) => ({
      ...provided,
      color: "#fff",
    }),
    indicatorSeparator: () => ({ display: "none" }),
  };

  const errorSelectStyles = {
    ...customSelectStyles,
    control: (provided) => ({
      ...customSelectStyles.control(provided),
      border: "1px solid rgba(255,0,0,0.5)",
    }),
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-[9999] p-4">
      {/* ✅ Responsive Modal */}
      <div className="glass p-4 sm:p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 text-white">
          {editData ? "Edit Registration" : "Add Registration"}
        </h2>

        <div className="space-y-3 sm:space-y-4">
          {/* Registration Type */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Registration Type <span className="text-red-400">*</span>
            </label>
            <Select
              styles={errorSelectStyles}
              options={registrationOptions}
              placeholder="Select Registration Type"
              value={formData.category ? { value: formData.category, label: formData.category } : null}
              onChange={(selected) => handleSelectChange("category", selected?.value || "")}
            />
            {errors.category && (
              <p className="text-red-400 text-sm mt-1">{errors.category}</p>
            )}
          </div>

          {/* Custom Category */}
          {formData.category === "Others" && (
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Custom Registration <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                name="customCategory"
                placeholder="Enter custom registration type"
                value={formData.customCategory}
                onChange={handleChange}
                className={`w-full glass-card p-3 sm:p-4 text-white outline-none ${
                  errors.customCategory ? "border-2 border-red-500" : ""
                }`}
              />
              {errors.customCategory && (
                <p className="text-red-400 text-sm mt-1">{errors.customCategory}</p>
              )}
            </div>
          )}

          {/* Registration Name */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Registration Name <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              name="registrationName"
              placeholder="Enter registration name"
              value={formData.registrationName}
              onChange={handleChange}
              className={`w-full glass-card p-3 sm:p-4 text-white outline-none ${
                errors.registrationName ? "border-2 border-red-500" : ""
              }`}
            />
            {errors.registrationName && (
              <p className="text-red-400 text-sm mt-1">{errors.registrationName}</p>
            )}
          </div>

          {/* Dates - Responsive Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Start Date <span className="text-red-400">*</span>
              </label>
              <input
                type="date"
                name="startDate"
                value={formData.startDate}
                onChange={handleChange}
                className={`w-full glass-card p-3 sm:p-4 text-white outline-none ${
                  errors.startDate ? "border-2 border-red-500" : ""
                }`}
              />
              {errors.startDate && (
                <p className="text-red-400 text-sm mt-1">{errors.startDate}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                End Date <span className="text-red-400">*</span>
              </label>
              <input
                type="date"
                name="endDate"
                value={formData.endDate}
                onChange={handleChange}
                className={`w-full glass-card p-3 sm:p-4 text-white outline-none ${
                  errors.endDate ? "border-2 border-red-500" : ""
                }`}
              />
              {errors.endDate && (
                <p className="text-red-400 text-sm mt-1">{errors.endDate}</p>
              )}
            </div>
          </div>

          {/* Status */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Status <span className="text-red-400">*</span>
            </label>
            <Select
              styles={errorSelectStyles}
              options={statusOptions}
              placeholder="Select Status"
              value={{ value: formData.status, label: formData.status }}
              onChange={(selected) => handleSelectChange("status", selected?.value || "")}
            />
            {errors.status && (
              <p className="text-red-400 text-sm mt-1">{errors.status}</p>
            )}
          </div>

          {/* File Upload - Responsive */}
          <div className="glass-card p-3 sm:p-4">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Upload Documents (PDF, JPG, PNG)
            </label>
            <div className="relative">
              <input
                type="file"
                multiple
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={handleFileChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
              />
              <div className="glass-card p-3 text-center text-gray-400 border border-dashed border-gray-600">
                <span>📎 Choose Files</span>
                {selectedFiles.length > 0 && (
                  <span className="ml-2 text-green-400">
                    ({selectedFiles.length} files selected)
                  </span>
                )}
              </div>
            </div>
            
            {selectedFiles.length > 0 && (
              <div className="mt-3 space-y-2 max-h-32 overflow-y-auto">
                {selectedFiles.map((file, index) => (
                  <div key={index} className="flex items-center justify-between glass-card p-2 text-sm">
                    <span className="text-white truncate flex-1">
                      {file.name} ({(file.size / 1024).toFixed(1)} KB)
                    </span>
                    <button
                      onClick={() => removeFile(index)}
                      className="text-red-400 hover:text-red-300 ml-2 flex-shrink-0"
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

        {/* Footer - Responsive Buttons */}
        <div className="flex flex-col sm:flex-row justify-end gap-3 mt-6 sm:mt-8">
          <button
            onClick={onClose}
            className="glass-card px-4 sm:px-6 py-2 sm:py-3 text-white w-full sm:w-auto order-2 sm:order-1"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={uploading}
            className={`glass-card px-4 sm:px-6 py-2 sm:py-3 text-white blue-glow w-full sm:w-auto order-1 sm:order-2 ${
              uploading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {uploading ? 'Uploading...' : editData ? 'Update Registration' : 'Save Registration'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default AddRegistrationModal;