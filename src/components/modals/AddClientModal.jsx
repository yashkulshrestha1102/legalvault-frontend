import { useState, useEffect } from "react";
import { FaTimes, FaUserPlus } from "react-icons/fa";

export default function AddClientModal({
  open,
  onClose,
  onSave,
  editData,
}) {
  // ✅ Form State
  const [formData, setFormData] = useState({
    name: "",
    contactPerson: "",
    company: "",
    email: "",
    phone: "",
    onboardingDate: "",
    status: "Active",
  });

  // ✅ Validation Errors State
  const [errors, setErrors] = useState({});

  // ✅ Edit Data Set Hone Par Form Fill Ho
  useEffect(() => {
    if (editData) {
      setFormData({
        name: editData.name || "",
        contactPerson: editData.contactPerson || "",
        company: editData.company || "",
        email: editData.email || "",
        phone: editData.phone || "",
        onboardingDate: editData.onboardingDate || "",
        status: editData.status || "Active",
      });
    } else {
      setFormData({
        name: "",
        contactPerson: "",
        company: "",
        email: "",
        phone: "",
        onboardingDate: "",
        status: "Active",
      });
    }
    // ✅ Modal open/close par errors clear
    setErrors({});
  }, [editData, open]);

  // ✅ Validation Function
  const validateForm = () => {
    const newErrors = {};

    // 1. Name Validation
    if (!formData.name.trim()) {
      newErrors.name = "Client name is required";
    } else if (formData.name.trim().length < 2) {
      newErrors.name = "Name must be at least 2 characters";
    } else if (!/^[a-zA-Z\s]+$/.test(formData.name.trim())) {
      newErrors.name = "Name can only contain letters and spaces";
    }

    // 2. Company Validation
    if (!formData.company.trim()) {
      newErrors.company = "Company name is required";
    } else if (formData.company.trim().length < 2) {
      newErrors.company = "Company name must be at least 2 characters";
    }

    // 3. Contact Person Validation (Optional but good to have)
    if (formData.contactPerson.trim() && !/^[a-zA-Z\s]+$/.test(formData.contactPerson.trim())) {
      newErrors.contactPerson = "Contact person can only contain letters and spaces";
    }

    // 4. Email Validation
    if (!formData.email.trim()) {
      newErrors.email = "Email address is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      newErrors.email = "Please enter a valid email address (e.g., name@domain.com)";
    }

    // 5. Phone Validation
    if (!formData.phone.trim()) {
      newErrors.phone = "Phone number is required";
    } else if (!/^\d{10,15}$/.test(formData.phone.trim())) {
      newErrors.phone = "Phone must be 10-15 digits only";
    }

    // 6. Status Validation
    if (!formData.status) {
      newErrors.status = "Please select a status";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ✅ Handle Save - FIXED: Preserve ID when editing
  const handleSave = () => {
    if (validateForm()) {
      // ✅ If editing, preserve the ID
      const saveData = editData ? {
        ...formData,
        _id: editData._id || editData.id,
        id: editData.id || editData._id,
      } : formData;
      
      onSave(saveData);
      // ✅ Form Reset After Successful Save
      setFormData({
        name: "",
        contactPerson: "",
        company: "",
        email: "",
        phone: "",
        onboardingDate: "",
        status: "Active",
      });
      setErrors({});
      onClose();
    }
  };

  // ✅ Handle Input Change - Live Error Clear
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // ✅ Error clear on typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  if (!open) return null;

  return (
    <div
      className="
      fixed
      inset-0
      z-[999]
      flex
      items-center
      justify-center
      bg-black/40
      backdrop-blur-md
      p-4
      "
    >
      {/* Glow Effects */}
      <div className="absolute top-20 left-20 w-72 h-72 bg-blue-500/20 rounded-full blur-[120px]" />
      <div className="absolute bottom-20 right-20 w-72 h-72 bg-purple-500/20 rounded-full blur-[120px]" />

      {/* ✅ Responsive Modal */}
      <div
        className="
        glass
        w-full
        max-w-xl
        p-4 sm:p-8
        relative
        overflow-hidden
        max-h-[90vh]
        overflow-y-auto
        "
      >
        {/* Header */}
        <div className="flex justify-between items-center mb-4 sm:mb-8">
          <div className="flex items-center gap-3">
            <div className="glass-icon text-cyan-400 w-10 h-10 sm:w-12 sm:h-12">
              <FaUserPlus className="text-sm sm:text-base" />
            </div>
            <div>
              <h2 className="text-xl sm:text-3xl font-bold">
                {editData ? "Edit Client" : "Add New Client"}
              </h2>
              <p className="text-xs sm:text-sm text-gray-400 mt-0.5 sm:mt-1">
                Client Information Management
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="glass-icon hover:scale-110 transition-all w-10 h-10 sm:w-12 sm:h-12"
          >
            <FaTimes className="text-sm sm:text-base" />
          </button>
        </div>

        {/* Form */}
        <div className="space-y-3 sm:space-y-4">
          {/* Client Name */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Client Name <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              name="name"
              placeholder="Enter client name"
              value={formData.name}
              onChange={handleChange}
              className={`
                w-full glass-card p-3 sm:p-4 outline-none placeholder:text-gray-400 text-white
                ${errors.name ? "border-2 border-red-500" : ""}
              `}
            />
            {errors.name && (
              <p className="text-red-400 text-sm mt-1">{errors.name}</p>
            )}
          </div>

          {/* Company Name */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Company Name <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              name="company"
              placeholder="Enter company name"
              value={formData.company}
              onChange={handleChange}
              className={`
                w-full glass-card p-3 sm:p-4 outline-none placeholder:text-gray-400 text-white
                ${errors.company ? "border-2 border-red-500" : ""}
              `}
            />
            {errors.company && (
              <p className="text-red-400 text-sm mt-1">{errors.company}</p>
            )}
          </div>

          {/* Contact Person */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Contact Person
            </label>
            <input
              type="text"
              name="contactPerson"
              placeholder="Enter contact person name"
              value={formData.contactPerson}
              onChange={handleChange}
              className={`
                w-full glass-card p-3 sm:p-4 outline-none placeholder:text-gray-400 text-white
                ${errors.contactPerson ? "border-2 border-red-500" : ""}
              `}
            />
            {errors.contactPerson && (
              <p className="text-red-400 text-sm mt-1">{errors.contactPerson}</p>
            )}
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Email Address <span className="text-red-400">*</span>
            </label>
            <input
              type="email"
              name="email"
              placeholder="Enter email address"
              value={formData.email}
              onChange={handleChange}
              className={`
                w-full glass-card p-3 sm:p-4 outline-none placeholder:text-gray-400 text-white
                ${errors.email ? "border-2 border-red-500" : ""}
              `}
            />
            {errors.email && (
              <p className="text-red-400 text-sm mt-1">{errors.email}</p>
            )}
          </div>

          {/* Phone */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Phone Number <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              name="phone"
              placeholder="Enter phone number"
              value={formData.phone}
              onChange={handleChange}
              className={`
                w-full glass-card p-3 sm:p-4 outline-none placeholder:text-gray-400 text-white
                ${errors.phone ? "border-2 border-red-500" : ""}
              `}
            />
            {errors.phone && (
              <p className="text-red-400 text-sm mt-1">{errors.phone}</p>
            )}
          </div>

          {/* Onboarding Date */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Onboarding Date
            </label>
            <input
              type="date"
              name="onboardingDate"
              value={formData.onboardingDate}
              onChange={handleChange}
              className="w-full glass-card p-3 sm:p-4 outline-none text-white"
            />
          </div>

          {/* Status */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Status <span className="text-red-400">*</span>
            </label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className={`
                w-full glass-card p-3 sm:p-4 outline-none cursor-pointer text-white bg-transparent
                ${errors.status ? "border-2 border-red-500" : ""}
              `}
            >
              <option value="Active" className="bg-slate-900">
                Active
              </option>
              <option value="Inactive" className="bg-slate-900">
                Inactive
              </option>
            </select>
            {errors.status && (
              <p className="text-red-400 text-sm mt-1">{errors.status}</p>
            )}
          </div>
        </div>

        {/* Footer - Responsive Buttons */}
        <div className="flex flex-col sm:flex-row justify-end gap-3 mt-6 sm:mt-8">
          <button
            onClick={onClose}
            className="glass-card px-4 sm:px-6 py-2 sm:py-3 text-white w-full sm:w-auto order-2 sm:order-1 text-sm sm:text-base"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="
            px-4 sm:px-6
            py-2 sm:py-3
            rounded-2xl
            bg-gradient-to-r
            from-cyan-500
            via-blue-500
            to-purple-500
            text-white
            font-semibold
            hover:scale-105
            transition-all
            shadow-lg
            shadow-cyan-500/30
            w-full sm:w-auto
            order-1 sm:order-2
            text-sm sm:text-base
            "
          >
            {editData ? "Update Client" : "Save Client"}
          </button>
        </div>
      </div>
    </div>
  );
}