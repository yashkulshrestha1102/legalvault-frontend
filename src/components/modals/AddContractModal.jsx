import { useEffect, useState } from "react";
import Select from "react-select";

function AddContractModal({
  open,
  onClose,
  onSave,
  editData,
}) {
  const [formData, setFormData] = useState({
    contractType: "",
    customContractType: "",
    contractName: "",
    firstParty: "",
    secondParty: "",
    startDate: "",
    endDate: "",
    status: "Active",
    pdf: "",
    pdfFile: null,
    pdfUrl: "",
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (editData) {
      setFormData({
        ...editData,
        pdfFile: null,
      });
    } else {
      setFormData({
        contractType: "",
        customContractType: "",
        contractName: "",
        firstParty: "",
        secondParty: "",
        startDate: "",
        endDate: "",
        status: "Active",
        pdf: "",
        pdfFile: null,
        pdfUrl: "",
      });
    }
    setErrors({});
  }, [editData, open]);

  const validateForm = () => {
    const newErrors = {};
    if (!formData.contractType) newErrors.contractType = "Contract type is required";
    if (formData.contractType === "Others" && !formData.customContractType.trim()) {
      newErrors.customContractType = "Please enter custom contract type";
    }
    if (!formData.contractName.trim()) {
      newErrors.contractName = "Contract name is required";
    } else if (formData.contractName.trim().length < 2) {
      newErrors.contractName = "Contract name must be at least 2 characters";
    }
    if (!formData.firstParty.trim()) {
      newErrors.firstParty = "First party is required";
    } else if (formData.firstParty.trim().length < 2) {
      newErrors.firstParty = "First party must be at least 2 characters";
    }
    if (!formData.secondParty.trim()) {
      newErrors.secondParty = "Second party is required";
    } else if (formData.secondParty.trim().length < 2) {
      newErrors.secondParty = "Second party must be at least 2 characters";
    }
    if (!formData.startDate) newErrors.startDate = "Start date is required";
    if (!formData.endDate) {
      newErrors.endDate = "End date is required";
    } else if (formData.startDate && formData.endDate < formData.startDate) {
      newErrors.endDate = "End date must be after start date";
    }
    if (!formData.status) newErrors.status = "Please select a status";
    if (formData.pdfFile && formData.pdfFile.type !== 'application/pdf') {
      newErrors.pdf = "Please upload a valid PDF file";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ✅ Handle Save - PDF URL pass karo
  const handleSave = () => {
    if (!validateForm()) return;

    const finalData = {
      ...formData,
      contractType: formData.contractType === "Others" ? formData.customContractType : formData.contractType,
      // ✅ PDF URL ko pdf field mein bhejo
      pdf: formData.pdfUrl || formData.pdf || ""
    };

    onSave(finalData);

    setFormData({
      contractType: "",
      customContractType: "",
      contractName: "",
      firstParty: "",
      secondParty: "",
      startDate: "",
      endDate: "",
      status: "Active",
      pdf: "",
      pdfFile: null,
      pdfUrl: "",
    });
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
    const file = e.target.files[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      setErrors(prev => ({ ...prev, pdf: "Please upload a valid PDF file" }));
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setErrors(prev => ({ ...prev, pdf: "File size should be less than 10MB" }));
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setFormData((prev) => ({
        ...prev,
        pdf: file.name,
        pdfFile: file,
        pdfUrl: reader.result,
      }));
      if (errors.pdf) {
        setErrors(prev => ({ ...prev, pdf: "" }));
      }
    };
    reader.readAsDataURL(file);
  };

  const contractOptions = [
    { value: "Service Agreement", label: "Service Agreement" },
    { value: "Vendor Agreement", label: "Vendor Agreement" },
    { value: "Employment Agreement", label: "Employment Agreement" },
    { value: "NDA", label: "NDA" },
    { value: "Partnership Agreement", label: "Partnership Agreement" },
    { value: "Lease Agreement", label: "Lease Agreement" },
    { value: "Consultancy Agreement", label: "Consultancy Agreement" },
    { value: "Franchise Agreement", label: "Franchise Agreement" },
    { value: "Joint Venture Agreement", label: "Joint Venture Agreement" },
    { value: "Purchase Agreement", label: "Purchase Agreement" },
    { value: "Shareholders Agreement", label: "Shareholders Agreement" },
    { value: "Others", label: "Others" },
  ];

  const customSelectStyles = {
    control: (provided, state) => ({
      ...provided,
      background: "rgba(255,255,255,0.04)",
      backdropFilter: "blur(25px)",
      border: state.isFocused ? "1px solid rgba(59,130,246,.5)" : "1px solid rgba(255,255,255,.08)",
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
      overflow: "hidden",
      border: "1px solid rgba(255,255,255,.08)",
      zIndex: 9999,
    }),
    option: (provided, state) => ({
      ...provided,
      background: state.isFocused ? "rgba(59,130,246,.20)" : "transparent",
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
    indicatorSeparator: () => ({ display: "none" }),
  };

  const errorSelectStyles = {
    ...customSelectStyles,
    control: (provided, state) => ({
      ...customSelectStyles.control(provided, state),
      border: errors.contractType || errors.status 
        ? "1px solid rgba(255,0,0,0.5)" 
        : customSelectStyles.control(provided, state).border,
    }),
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-[9999] p-4">
      <div className="glass p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <h2 className="text-2xl font-bold mb-6 text-white">
          {editData ? "Edit Contract" : "Add Contract"}
        </h2>

        <div className="space-y-4">
          <div>
            <Select
              styles={errorSelectStyles}
              options={contractOptions}
              placeholder="Select Contract Type *"
              value={formData.contractType ? { value: formData.contractType, label: formData.contractType } : null}
              onChange={(selected) => handleSelectChange("contractType", selected?.value || "")}
            />
            {errors.contractType && <p className="text-red-400 text-sm mt-1">{errors.contractType}</p>}
          </div>

          {formData.contractType === "Others" && (
            <div>
              <input
                type="text"
                name="customContractType"
                placeholder="Enter Custom Contract Type *"
                value={formData.customContractType}
                onChange={handleChange}
                className={`glass-card p-4 w-full text-white outline-none ${errors.customContractType ? "border-2 border-red-500" : ""}`}
              />
              {errors.customContractType && <p className="text-red-400 text-sm mt-1">{errors.customContractType}</p>}
            </div>
          )}

          <div>
            <input
              type="text"
              name="contractName"
              placeholder="Contract Name *"
              value={formData.contractName}
              onChange={handleChange}
              className={`glass-card p-4 w-full text-white outline-none ${errors.contractName ? "border-2 border-red-500" : ""}`}
            />
            {errors.contractName && <p className="text-red-400 text-sm mt-1">{errors.contractName}</p>}
          </div>

          <div>
            <input
              type="text"
              name="firstParty"
              placeholder="First Party *"
              value={formData.firstParty}
              onChange={handleChange}
              className={`glass-card p-4 w-full text-white outline-none ${errors.firstParty ? "border-2 border-red-500" : ""}`}
            />
            {errors.firstParty && <p className="text-red-400 text-sm mt-1">{errors.firstParty}</p>}
          </div>

          <div>
            <input
              type="text"
              name="secondParty"
              placeholder="Second Party *"
              value={formData.secondParty}
              onChange={handleChange}
              className={`glass-card p-4 w-full text-white outline-none ${errors.secondParty ? "border-2 border-red-500" : ""}`}
            />
            {errors.secondParty && <p className="text-red-400 text-sm mt-1">{errors.secondParty}</p>}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <input
                type="date"
                name="startDate"
                value={formData.startDate}
                onChange={handleChange}
                className={`glass-card p-4 w-full text-white outline-none ${errors.startDate ? "border-2 border-red-500" : ""}`}
              />
              {errors.startDate && <p className="text-red-400 text-sm mt-1">{errors.startDate}</p>}
            </div>
            <div>
              <input
                type="date"
                name="endDate"
                value={formData.endDate}
                onChange={handleChange}
                className={`glass-card p-4 w-full text-white outline-none ${errors.endDate ? "border-2 border-red-500" : ""}`}
              />
              {errors.endDate && <p className="text-red-400 text-sm mt-1">{errors.endDate}</p>}
            </div>
          </div>

          <div>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className={`glass-card p-4 w-full text-white outline-none bg-transparent ${errors.status ? "border-2 border-red-500" : ""}`}
            >
              <option className="bg-slate-900" value="Active">Active</option>
              <option className="bg-slate-900" value="Expired">Expired</option>
              <option className="bg-slate-900" value="Renewed">Renewed</option>
              <option className="bg-slate-900" value="Terminated">Terminated</option>
            </select>
            {errors.status && <p className="text-red-400 text-sm mt-1">{errors.status}</p>}
          </div>

          <div>
            <input
              type="file"
              accept=".pdf"
              onChange={handleFileChange}
              className={`glass-card p-4 w-full text-white ${errors.pdf ? "border-2 border-red-500" : ""}`}
            />
            {errors.pdf && <p className="text-red-400 text-sm mt-1">{errors.pdf}</p>}
            {formData.pdf && !errors.pdf && (
              <div className="glass-card p-4 text-green-400 mt-2">
                ✅ Selected File: {formData.pdf}
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row justify-end gap-3 mt-8">
          <button onClick={onClose} className="glass-card px-6 py-3 text-white">
            Cancel
          </button>
          <button onClick={handleSave} className="glass-card px-6 py-3 text-white blue-glow">
            {editData ? "Update Contract" : "Save Contract"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default AddContractModal;