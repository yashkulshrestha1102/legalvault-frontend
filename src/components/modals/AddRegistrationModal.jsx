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

    if (!formData.category) {
      newErrors.category = "Registration type is required";
    }

    if (formData.category === "Others" && !formData.customCategory.trim()) {
      newErrors.customCategory = "Please enter custom registration type";
    }

    if (!formData.registrationName.trim()) {
      newErrors.registrationName = "Registration name is required";
    } else if (formData.registrationName.trim().length < 2) {
      newErrors.registrationName = "Registration name must be at least 2 characters";
    }

    if (!formData.startDate) {
      newErrors.startDate = "Start date is required";
    }

    if (!formData.endDate) {
      newErrors.endDate = "End date is required";
    } else if (formData.startDate && formData.endDate < formData.startDate) {
      newErrors.endDate = "End date must be after start date";
    }

    if (!formData.status) {
      newErrors.status = "Please select a status";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

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
    if (!validateForm()) {
      return;
    }

    let uploadedDocs = [];

    if (selectedFiles.length > 0) {
      setUploading(true);
      uploadedDocs = await uploadDocuments(selectedFiles);
      setUploading(false);
    }

    const finalData = {
      ...formData,
      category: formData.category === "Others" ? formData.customCategory : formData.category,
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
    setSelectedFiles(prev => [...prev, ...files]);
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

  // ✅ React Select Styles - ONLY ONCE
  const customSelectStyles = {
    control: (provided) => ({
      ...provided,
      backgroundColor: "rgba(255,255,255,0.04)",
      border: "1px solid rgba(255,255,255,0.08)",
      borderRadius: "24px",
      minHeight: "56px",
      boxShadow: "none",
      color: "#fff",
      "&:hover": {
        borderColor: "rgba(59,130,246,0.5)"
      }
    }),
    menu: (provided) => ({
      ...provided,
      backgroundColor: "rgba(15,23,42,0.95)",
      borderRadius: "20px",
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

  // ✅ Error Select Styles - ONLY ONCE
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
      <div className="glass p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <h2 className="text-2xl font-bold mb-6 text-white">
          {editData ? "Edit Registration" : "Add Registration"}
        </h2>

        <div className="space-y-4">
          {/* Registration Type */}
          <div>
            <Select
              styles={errorSelectStyles}
              options={registrationOptions}
              placeholder="Select Registration Type *"
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
              <input
                type="text"
                name="customCategory"
                placeholder="Enter Custom Registration *"
                value={formData.customCategory}
                onChange={handleChange}
                className={`glass-card p-4 w-full text-white outline-none ${
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
            <input
              type="text"
              name="registrationName"
              placeholder="Registration Name *"
              value={formData.registrationName}
              onChange={handleChange}
              className={`glass-card p-4 w-full text-white outline-none ${
                errors.registrationName ? "border-2 border-red-500" : ""
              }`}
            />
            {errors.registrationName && (
              <p className="text-red-400 text-sm mt-1">{errors.registrationName}</p>
            )}
          </div>

          {/* Dates */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <input
                type="date"
                name="startDate"
                value={formData.startDate}
                onChange={handleChange}
                className={`glass-card p-4 w-full text-white outline-none ${
                  errors.startDate ? "border-2 border-red-500" : ""
                }`}
              />
              {errors.startDate && (
                <p className="text-red-400 text-sm mt-1">{errors.startDate}</p>
              )}
            </div>
            <div>
              <input
                type="date"
                name="endDate"
                value={formData.endDate}
                onChange={handleChange}
                className={`glass-card p-4 w-full text-white outline-none ${
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
            <Select
              styles={errorSelectStyles}
              options={statusOptions}
              placeholder="Select Status *"
              value={{ value: formData.status, label: formData.status }}
              onChange={(selected) => handleSelectChange("status", selected?.value || "")}
            />
            {errors.status && (
              <p className="text-red-400 text-sm mt-1">{errors.status}</p>
            )}
          </div>

          {/* File Upload */}
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
            
            {selectedFiles.length > 0 && (
              <div className="mt-3 space-y-2">
                {selectedFiles.map((file, index) => (
                  <div key={index} className="flex items-center justify-between glass-card p-2">
                    <span className="text-sm text-white truncate">
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
            className={`glass-card px-6 py-3 text-white blue-glow ${
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