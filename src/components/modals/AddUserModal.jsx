import { useState, useEffect } from "react";

// ✅ 8 Folders List
const ALL_FOLDERS = [
  { id: 'registrations', label: 'Registrations / Certifications' },
  { id: 'contracts', label: 'Contracts' },
  { id: 'policies', label: 'Policies' },
  { id: 'corporate-secretariat', label: 'Corporate Secretariat' },
  { id: 'hr', label: 'HR' },
  { id: 'gst', label: 'GST' },
  { id: 'income-tax', label: 'Income Tax' },
  { id: 'financials', label: 'Financials' }
];

export default function AddUserModal({ open, onClose, onSave, editData }) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    department: "",
    role: "Consultant",
    status: "Active",
    folderPermissions: [],
    avatar: "",
  });

  // ✅ Validation Errors State
  const [errors, setErrors] = useState({});

  // ✅ Edit Data Set Hone Par Form Fill Ho
  useEffect(() => {
    if (editData) {
      setFormData({
        name: editData.name || "",
        email: editData.email || "",
        phone: editData.phone || "",
        password: "", // Password never pre-filled for security
        department: editData.department || "",
        role: editData.role || "Consultant",
        status: editData.status || "Active",
        folderPermissions: editData.folderPermissions || [],
        avatar: editData.avatar || "",
      });
    } else {
      setFormData({
        name: "",
        email: "",
        phone: "",
        password: "",
        department: "",
        role: "Consultant",
        status: "Active",
        folderPermissions: [],
        avatar: "",
      });
    }
    // ✅ Modal open/close par errors clear
    setErrors({});
  }, [editData, open]);

  if (!open) return null;

  // ✅ Validation Function
  const validateForm = () => {
    const newErrors = {};

    // 1. Name Validation
    if (!formData.name.trim()) {
      newErrors.name = "Full name is required";
    } else if (formData.name.trim().length < 2) {
      newErrors.name = "Name must be at least 2 characters";
    } else if (!/^[a-zA-Z\s]+$/.test(formData.name.trim())) {
      newErrors.name = "Name can only contain letters and spaces";
    }

    // 2. Email Validation
    if (!formData.email.trim()) {
      newErrors.email = "Email address is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      newErrors.email = "Please enter a valid email address (e.g., name@domain.com)";
    }

    // 3. Password Validation (Only for new users, not for edit)
    if (!editData) {
      if (!formData.password) {
        newErrors.password = "Password is required";
      } else if (formData.password.length < 6) {
        newErrors.password = "Password must be at least 6 characters";
      } else if (!/(?=.*[A-Z])(?=.*[a-z])(?=.*\d)/.test(formData.password)) {
        newErrors.password = "Password must contain uppercase, lowercase, and number";
      }
    } else {
      // Edit mode - password optional
      if (formData.password && formData.password.length < 6) {
        newErrors.password = "Password must be at least 6 characters";
      }
      if (formData.password && !/(?=.*[A-Z])(?=.*[a-z])(?=.*\d)/.test(formData.password)) {
        newErrors.password = "Password must contain uppercase, lowercase, and number";
      }
    }

    // 4. Phone Validation (Optional but if provided, validate)
    if (formData.phone.trim() && !/^\d{10,15}$/.test(formData.phone.trim())) {
      newErrors.phone = "Phone must be 10-15 digits only";
    }

    // 5. Department Validation (Optional)
    if (formData.department.trim() && formData.department.trim().length < 2) {
      newErrors.department = "Department must be at least 2 characters";
    }

    // 6. Role Validation
    if (!formData.role) {
      newErrors.role = "Please select a role";
    }

    // 7. Status Validation
    if (!formData.status) {
      newErrors.status = "Please select a status";
    }

    // 8. Folder Permissions Validation (At least 1 folder required)
    if (!formData.folderPermissions || formData.folderPermissions.length === 0) {
      newErrors.folderPermissions = "Please select at least one folder permission";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ✅ Handle Save - Validation Check Ke Saath
  const handleSave = () => {
    // ✅ Pehle validate karo
    if (!validateForm()) {
      // ✅ Scroll to first error
      const firstErrorField = Object.keys(errors)[0];
      if (firstErrorField) {
        const element = document.querySelector(`[name="${firstErrorField}"]`);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
          element.focus();
        }
      }
      return;
    }

    // ✅ Debug log
    console.log('📤 AddUserModal - Sending:', {
      name: formData.name,
      email: formData.email,
      folderPermissions: formData.folderPermissions
    });

    onSave({
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      password: formData.password,
      department: formData.department,
      role: formData.role,
      status: formData.status,
      folderPermissions: formData.folderPermissions || [],
      avatar: formData.avatar,
      id: editData?.id || Date.now(),
      createdAt: editData?.createdAt || new Date().toLocaleDateString(),
    });

    // ✅ Form Reset After Successful Save
    setFormData({
      name: "",
      email: "",
      phone: "",
      password: "",
      department: "",
      role: "Consultant",
      status: "Active",
      folderPermissions: [],
      avatar: "",
    });
    setErrors({});
    onClose();
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

  // ✅ Handle Folder Toggle with Error Clear
  const toggleFolder = (folderId) => {
    setFormData((prev) => {
      const current = prev.folderPermissions || [];
      const updated = current.includes(folderId)
        ? current.filter(id => id !== folderId)
        : [...current, folderId];
      
      // ✅ Clear folder permission error if any folder is selected
      if (errors.folderPermissions && updated.length > 0) {
        setErrors(prevErrors => ({ ...prevErrors, folderPermissions: "" }));
      }
      
      return {
        ...prev,
        folderPermissions: updated
      };
    });
  };

  const selectAllFolders = () => {
    setFormData((prev) => ({
      ...prev,
      folderPermissions: ALL_FOLDERS.map(f => f.id)
    }));
    // ✅ Clear folder permission error
    if (errors.folderPermissions) {
      setErrors(prev => ({ ...prev, folderPermissions: "" }));
    }
  };

  const deselectAllFolders = () => {
    setFormData((prev) => ({
      ...prev,
      folderPermissions: []
    }));
  };

  const handleAvatarUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // ✅ Avatar file validation
    if (!file.type.startsWith('image/')) {
      setErrors(prev => ({ ...prev, avatar: "Please upload an image file" }));
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setErrors(prev => ({ ...prev, avatar: "Image size should be less than 5MB" }));
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setFormData((prev) => ({
        ...prev,
        avatar: reader.result,
      }));
      // ✅ Clear avatar error if any
      if (errors.avatar) {
        setErrors(prev => ({ ...prev, avatar: "" }));
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50">
      <div className="glass w-[650px] p-8 max-h-[90vh] overflow-y-auto">
        <h2 className="text-3xl font-bold mb-6">
          {editData ? "Edit User" : "Add User"}
        </h2>

        <div className="space-y-4">
          {/* ✅ Avatar Upload with Error */}
          <div className="flex flex-col items-center gap-4">
            {formData.avatar ? (
              <img
                src={formData.avatar}
                alt="avatar"
                className="w-24 h-24 rounded-full object-cover border border-white/20"
              />
            ) : (
              <div className="w-24 h-24 rounded-full glass-card flex items-center justify-center text-3xl">
                👤
              </div>
            )}
            <input
              type="file"
              accept="image/*"
              onChange={handleAvatarUpload}
              className={`glass-card p-3 w-full ${errors.avatar ? "border-2 border-red-500" : ""}`}
            />
            {errors.avatar && (
              <p className="text-red-400 text-sm -mt-2">{errors.avatar}</p>
            )}
          </div>

          {/* ✅ Full Name with Error */}
          <div>
            <input
              type="text"
              name="name"
              placeholder="Full Name *"
              value={formData.name}
              onChange={handleChange}
              className={`glass-card w-full p-4 bg-transparent outline-none ${
                errors.name ? "border-2 border-red-500" : ""
              }`}
            />
            {errors.name && (
              <p className="text-red-400 text-sm mt-1">{errors.name}</p>
            )}
          </div>

          {/* ✅ Email with Error */}
          <div>
            <input
              type="email"
              name="email"
              placeholder="Email Address *"
              value={formData.email}
              onChange={handleChange}
              className={`glass-card w-full p-4 bg-transparent outline-none ${
                errors.email ? "border-2 border-red-500" : ""
              }`}
            />
            {errors.email && (
              <p className="text-red-400 text-sm mt-1">{errors.email}</p>
            )}
          </div>

          {/* ✅ Password with Error */}
          <div>
            <input
              type="password"
              name="password"
              placeholder={editData ? "New Password (leave blank to keep current)" : "Password *"}
              value={formData.password}
              onChange={handleChange}
              className={`glass-card w-full p-4 bg-transparent outline-none ${
                errors.password ? "border-2 border-red-500" : ""
              }`}
            />
            {errors.password && (
              <p className="text-red-400 text-sm mt-1">{errors.password}</p>
            )}
            {!editData && !errors.password && (
              <p className="text-gray-400 text-xs mt-1">Must contain uppercase, lowercase, and number</p>
            )}
          </div>

          {/* ✅ Phone with Error */}
          <div>
            <input
              type="text"
              name="phone"
              placeholder="Phone Number"
              value={formData.phone}
              onChange={handleChange}
              className={`glass-card w-full p-4 bg-transparent outline-none ${
                errors.phone ? "border-2 border-red-500" : ""
              }`}
            />
            {errors.phone && (
              <p className="text-red-400 text-sm mt-1">{errors.phone}</p>
            )}
          </div>

          {/* ✅ Department with Error */}
          <div>
            <input
              type="text"
              name="department"
              placeholder="Department"
              value={formData.department}
              onChange={handleChange}
              className={`glass-card w-full p-4 bg-transparent outline-none ${
                errors.department ? "border-2 border-red-500" : ""
              }`}
            />
            {errors.department && (
              <p className="text-red-400 text-sm mt-1">{errors.department}</p>
            )}
          </div>

          {/* ✅ Role with Error */}
          <div>
            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              className={`glass-card w-full p-4 bg-slate-900 text-white outline-none ${
                errors.role ? "border-2 border-red-500" : ""
              }`}
            >
              <option value="">Select Role *</option>
              <option value="Admin">Admin</option>
              <option value="Lawyer">Lawyer</option>
              <option value="Consultant">Consultant</option>
              <option value="Manager">Manager</option>
            </select>
            {errors.role && (
              <p className="text-red-400 text-sm mt-1">{errors.role}</p>
            )}
          </div>

          {/* ✅ Status with Error */}
          <div>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className={`glass-card w-full p-4 bg-slate-900 text-white outline-none ${
                errors.status ? "border-2 border-red-500" : ""
              }`}
            >
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
            {errors.status && (
              <p className="text-red-400 text-sm mt-1">{errors.status}</p>
            )}
          </div>

          {/* ✅ 8 Folders - Permission Selection with Error */}
          <div>
            <div className={`glass-card p-4 ${errors.folderPermissions ? "border-2 border-red-500" : ""}`}>
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-lg font-semibold">Folder Access Permissions *</h3>
                <div className="flex gap-2">
                  <button 
                    onClick={selectAllFolders}
                    className="text-xs bg-cyan-500/20 px-3 py-1 rounded hover:bg-cyan-500/30 transition"
                  >
                    Select All
                  </button>
                  <button 
                    onClick={deselectAllFolders}
                    className="text-xs bg-red-500/20 px-3 py-1 rounded hover:bg-red-500/30 transition"
                  >
                    Deselect All
                  </button>
                </div>
              </div>
              <p className="text-sm text-gray-400 mb-4">Select folders this user can access</p>

              <div className="grid grid-cols-2 gap-3">
                {ALL_FOLDERS.map((folder) => (
                  <label key={folder.id} className="flex items-center gap-2 cursor-pointer p-2 rounded hover:bg-white/5 transition">
                    <input
                      type="checkbox"
                      checked={formData.folderPermissions?.includes(folder.id) || false}
                      onChange={() => toggleFolder(folder.id)}
                      className="w-4 h-4 accent-cyan-500"
                    />
                    <span className="text-sm">{folder.label}</span>
                  </label>
                ))}
              </div>

              <div className="mt-3 text-xs text-gray-400">
                Selected: {formData.folderPermissions?.length || 0} / {ALL_FOLDERS.length} folders
              </div>
            </div>
            {errors.folderPermissions && (
              <p className="text-red-400 text-sm mt-1">{errors.folderPermissions}</p>
            )}
          </div>
        </div>

        <div className="flex justify-end gap-4 mt-8">
          <button onClick={onClose} className="glass-card px-6 py-3">
            Cancel
          </button>
          <button onClick={handleSave} className="glass-card px-6 py-3 blue-glow">
            {editData ? "Update User" : "Save User"}
          </button>
        </div>
      </div>
    </div>
  );
}