import { useState, useEffect, useContext } from "react";
import { FaTimes, FaUserPlus } from "react-icons/fa";
import axios from 'axios';
import AuthContext from '../../context/AuthContext';

const API_URL = 'https://legalvault-jm2n.onrender.com';

export default function AddClientModal({
  open,
  onClose,
  onSave,
  editData,
}) {
  const { user } = useContext(AuthContext);
  const isAdmin = user?.role === 'admin';

  const [formData, setFormData] = useState({
    name: "",
    contactPerson: "",
    company: "",
    email: "",
    phone: "",
    onboardingDate: "",
    status: "Active",
    assignedTo: [],
    folderPermissions: [],
  });

  const [users, setUsers] = useState([]);
  const [errors, setErrors] = useState({});

  // ✅ Folder list
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

  // ✅ Fetch users for assignment
  useEffect(() => {
    const fetchUsers = async () => {
      if (!isAdmin) return;
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`${API_URL}/api/users`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setUsers(response.data);
      } catch (error) {
        console.error('❌ Error fetching users:', error);
      }
    };
    if (open) {
      fetchUsers();
    }
  }, [open, isAdmin]);

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
        assignedTo: editData.assignedTo?.map(u => u._id || u) || [],
        folderPermissions: editData.folderPermissions || [],
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
        assignedTo: [],
        folderPermissions: [],
      });
    }
    setErrors({});
  }, [editData, open]);

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = "Client name is required";
    if (!formData.company.trim()) newErrors.company = "Company name is required";
    if (!formData.email.trim()) {
      newErrors.email = "Email address is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      newErrors.email = "Please enter a valid email address";
    }
    if (!formData.phone.trim()) {
      newErrors.phone = "Phone number is required";
    } else if (!/^\d{10,15}$/.test(formData.phone.trim())) {
      newErrors.phone = "Phone must be 10-15 digits only";
    }
    if (!formData.status) newErrors.status = "Please select a status";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (validateForm()) {
      const saveData = editData ? {
        ...formData,
        _id: editData._id || editData.id,
        id: editData.id || editData._id,
      } : formData;
      onSave(saveData);
      setFormData({
        name: "",
        contactPerson: "",
        company: "",
        email: "",
        phone: "",
        onboardingDate: "",
        status: "Active",
        assignedTo: [],
        folderPermissions: [],
      });
      setErrors({});
      onClose();
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const toggleUser = (userId) => {
    setFormData(prev => {
      const current = prev.assignedTo || [];
      if (current.includes(userId)) {
        return { ...prev, assignedTo: current.filter(id => id !== userId) };
      } else {
        return { ...prev, assignedTo: [...current, userId] };
      }
    });
  };

  const toggleFolder = (folderId) => {
    setFormData(prev => {
      const current = prev.folderPermissions || [];
      if (current.includes(folderId)) {
        return { ...prev, folderPermissions: current.filter(id => id !== folderId) };
      } else {
        return { ...prev, folderPermissions: [...current, folderId] };
      }
    });
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/40 backdrop-blur-md p-4">
      <div className="glass w-full max-w-xl p-4 sm:p-8 relative overflow-hidden max-h-[90vh] overflow-y-auto">
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
          <button onClick={onClose} className="glass-icon hover:scale-110 transition-all w-10 h-10 sm:w-12 sm:h-12">
            <FaTimes className="text-sm sm:text-base" />
          </button>
        </div>

        <div className="space-y-3 sm:space-y-4">
          {/* Basic Info */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Client Name <span className="text-red-400">*</span></label>
            <input type="text" name="name" placeholder="Enter client name" value={formData.name} onChange={handleChange} className={`w-full glass-card p-3 sm:p-4 outline-none placeholder:text-gray-400 text-white ${errors.name ? "border-2 border-red-500" : ""}`} />
            {errors.name && <p className="text-red-400 text-sm mt-1">{errors.name}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Company Name <span className="text-red-400">*</span></label>
            <input type="text" name="company" placeholder="Enter company name" value={formData.company} onChange={handleChange} className={`w-full glass-card p-3 sm:p-4 outline-none placeholder:text-gray-400 text-white ${errors.company ? "border-2 border-red-500" : ""}`} />
            {errors.company && <p className="text-red-400 text-sm mt-1">{errors.company}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Email Address <span className="text-red-400">*</span></label>
            <input type="email" name="email" placeholder="Enter email address" value={formData.email} onChange={handleChange} className={`w-full glass-card p-3 sm:p-4 outline-none placeholder:text-gray-400 text-white ${errors.email ? "border-2 border-red-500" : ""}`} />
            {errors.email && <p className="text-red-400 text-sm mt-1">{errors.email}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Phone Number <span className="text-red-400">*</span></label>
            <input type="text" name="phone" placeholder="Enter phone number" value={formData.phone} onChange={handleChange} className={`w-full glass-card p-3 sm:p-4 outline-none placeholder:text-gray-400 text-white ${errors.phone ? "border-2 border-red-500" : ""}`} />
            {errors.phone && <p className="text-red-400 text-sm mt-1">{errors.phone}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Contact Person</label>
            <input type="text" name="contactPerson" placeholder="Enter contact person name" value={formData.contactPerson} onChange={handleChange} className={`w-full glass-card p-3 sm:p-4 outline-none placeholder:text-gray-400 text-white ${errors.contactPerson ? "border-2 border-red-500" : ""}`} />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Onboarding Date</label>
            <input type="date" name="onboardingDate" value={formData.onboardingDate} onChange={handleChange} className="w-full glass-card p-3 sm:p-4 outline-none text-white" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Status <span className="text-red-400">*</span></label>
            <select name="status" value={formData.status} onChange={handleChange} className={`w-full glass-card p-3 sm:p-4 outline-none cursor-pointer text-white bg-transparent ${errors.status ? "border-2 border-red-500" : ""}`}>
              <option value="Active" className="bg-slate-900">Active</option>
              <option value="Inactive" className="bg-slate-900">Inactive</option>
            </select>
            {errors.status && <p className="text-red-400 text-sm mt-1">{errors.status}</p>}
          </div>

          {/* ✅ Access Control - Only for Admin */}
          {isAdmin && (
            <>
              <div className="border-t border-white/10 pt-4">
                <h3 className="text-lg font-semibold text-white mb-3">🔐 Access Control</h3>
                
                {/* Assign To */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-300 mb-2">Assign To (Select users)</label>
                  <div className="glass-card p-3 space-y-2 max-h-40 overflow-y-auto">
                    {users.length === 0 ? (
                      <p className="text-gray-400 text-sm">No users available</p>
                    ) : (
                      users.filter(u => u._id !== user._id).map((u) => (
                        <label key={u._id} className="flex items-center gap-2 cursor-pointer p-1 hover:bg-white/5 rounded">
                          <input type="checkbox" checked={formData.assignedTo.includes(u._id)} onChange={() => toggleUser(u._id)} className="w-4 h-4 accent-cyan-500" />
                          <span className="text-sm text-white">{u.name} ({u.role})</span>
                        </label>
                      ))
                    )}
                  </div>
                  <p className="text-xs text-gray-400 mt-1">Selected: {formData.assignedTo.length} users</p>
                </div>

                {/* Folder Permissions */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Folder Permissions</label>
                  <div className="glass-card p-3 grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-40 overflow-y-auto">
                    {ALL_FOLDERS.map((folder) => (
                      <label key={folder.id} className="flex items-center gap-2 cursor-pointer p-1 hover:bg-white/5 rounded">
                        <input type="checkbox" checked={formData.folderPermissions.includes(folder.id)} onChange={() => toggleFolder(folder.id)} className="w-4 h-4 accent-cyan-500" />
                        <span className="text-sm text-white">{folder.label}</span>
                      </label>
                    ))}
                  </div>
                  <p className="text-xs text-gray-400 mt-1">Selected: {formData.folderPermissions.length} folders</p>
                </div>
              </div>
            </>
          )}
        </div>

        <div className="flex flex-col sm:flex-row justify-end gap-3 mt-6 sm:mt-8">
          <button onClick={onClose} className="glass-card px-4 sm:px-6 py-2 sm:py-3 text-white w-full sm:w-auto order-2 sm:order-1 text-sm sm:text-base">Cancel</button>
          <button onClick={handleSave} className="px-4 sm:px-6 py-2 sm:py-3 rounded-2xl bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500 text-white font-semibold hover:scale-105 transition-all shadow-lg shadow-cyan-500/30 w-full sm:w-auto order-1 sm:order-2 text-sm sm:text-base">
            {editData ? "Update Client" : "Save Client"}
          </button>
        </div>
      </div>
    </div>
  );
}