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
    return Object.keys(newErrors).length === 0; // ✅ True if no errors
  };

  // ✅ Handle Save - Validation Check Ke Saath
  const handleSave = () => {
    if (validateForm()) {
      onSave(formData);
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

      {/* Modal */}
      <div
        className="
        glass
        w-full
        max-w-xl
        p-8
        relative
        overflow-hidden
        "
      >
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-3">
            <div className="glass-icon text-cyan-400">
              <FaUserPlus />
            </div>
            <div>
              <h2 className="text-3xl font-bold">
                {editData ? "Edit Client" : "Add New Client"}
              </h2>
              <p className="text-gray-400 text-sm mt-1">
                Client Information Management
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="glass-icon hover:scale-110 transition-all"
          >
            <FaTimes />
          </button>
        </div>

        {/* Form */}
        <div className="space-y-4">
          {/* Client Name */}
          <div>
            <input
              type="text"
              name="name"
              placeholder="Client Name *"
              value={formData.name}
              onChange={handleChange}
              className={`
                w-full glass-card p-4 outline-none placeholder:text-gray-400
                ${errors.name ? "border-2 border-red-500" : ""}
              `}
            />
            {errors.name && (
              <p className="text-red-400 text-sm mt-1">{errors.name}</p>
            )}
          </div>

          {/* Company Name */}
          <div>
            <input
              type="text"
              name="company"
              placeholder="Company Name *"
              value={formData.company}
              onChange={handleChange}
              className={`
                w-full glass-card p-4 outline-none placeholder:text-gray-400
                ${errors.company ? "border-2 border-red-500" : ""}
              `}
            />
            {errors.company && (
              <p className="text-red-400 text-sm mt-1">{errors.company}</p>
            )}
          </div>

          {/* Contact Person */}
          <div>
            <input
              type="text"
              name="contactPerson"
              placeholder="Contact Person Name"
              value={formData.contactPerson}
              onChange={handleChange}
              className={`
                w-full glass-card p-4 outline-none placeholder:text-gray-400
                ${errors.contactPerson ? "border-2 border-red-500" : ""}
              `}
            />
            {errors.contactPerson && (
              <p className="text-red-400 text-sm mt-1">{errors.contactPerson}</p>
            )}
          </div>

          {/* Email */}
          <div>
            <input
              type="email"
              name="email"
              placeholder="Email Address *"
              value={formData.email}
              onChange={handleChange}
              className={`
                w-full glass-card p-4 outline-none placeholder:text-gray-400
                ${errors.email ? "border-2 border-red-500" : ""}
              `}
            />
            {errors.email && (
              <p className="text-red-400 text-sm mt-1">{errors.email}</p>
            )}
          </div>

          {/* Phone */}
          <div>
            <input
              type="text"
              name="phone"
              placeholder="Phone Number *"
              value={formData.phone}
              onChange={handleChange}
              className={`
                w-full glass-card p-4 outline-none placeholder:text-gray-400
                ${errors.phone ? "border-2 border-red-500" : ""}
              `}
            />
            {errors.phone && (
              <p className="text-red-400 text-sm mt-1">{errors.phone}</p>
            )}
          </div>

          {/* Onboarding Date */}
          <div>
            <input
              type="date"
              name="onboardingDate"
              value={formData.onboardingDate}
              onChange={handleChange}
              className="w-full glass-card p-4 outline-none"
            />
          </div>

          {/* Status */}
          <div>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className={`
                w-full glass-card p-4 outline-none cursor-pointer
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

        {/* Footer */}
        <div className="flex justify-end gap-4 mt-8">
          <button
            onClick={onClose}
            className="glass-card px-6 py-3 hover:scale-105 transition-all"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="
            px-6
            py-3
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
            "
          >
            {editData ? "Update Client" : "Save Client"}
          </button>
        </div>
      </div>
    </div>
  );
}