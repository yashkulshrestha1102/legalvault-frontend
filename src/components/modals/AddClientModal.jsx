import { useState, useEffect, useContext } from "react";
import { FaTimes, FaUserPlus, FaUserMinus } from "react-icons/fa";
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
    userPermissions: [],
  });

  const [users, setUsers] = useState([]);
  const [errors, setErrors] = useState({});

  // ✅ 9 Folders including Client Repository
  const ALL_FOLDERS = [
    { id: 'registrations', label: 'Registrations / Certifications' },
    { id: 'contracts', label: 'Contracts' },
    { id: 'policies', label: 'Policies' },
    { id: 'corporate-secretariat', label: 'Corporate Secretariat' },
    { id: 'hr', label: 'HR' },
    { id: 'gst', label: 'GST' },
    { id: 'income-tax', label: 'Income Tax' },
    { id: 'financials', label: 'Financials' },
    { id: 'documents', label: '📁 Client Repository' }
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
        userPermissions: editData.userPermissions || [],
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
        userPermissions: [],
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

  // ✅ UNASSIGN USER FUNCTION - Complete remove from client
  const unassignUser = (userId) => {
    const userName = users.find(u => u._id === userId)?.name || 'User';
    if (!window.confirm(`Remove "${userName}" completely from this client?`)) return;
    
    setFormData(prev => ({
      ...prev,
      userPermissions: prev.userPermissions.filter(p => p.userId !== userId)
    }));
  };

  const handleSave = () => {
    if (validateForm()) {
      const finalUserPermissions = (formData.userPermissions || []).map(p => ({
        userId: p.userId,
        folderPermissions: Array.isArray(p.folderPermissions) ? p.folderPermissions : []
      }));

      const saveData = editData ? {
        ...formData,
        userPermissions: finalUserPermissions,
        _id: editData._id || editData.id,
        id: editData.id || editData._id,
      } : {
        ...formData,
        userPermissions: finalUserPermissions
      };
      
      onSave(saveData);
      setFormData({
        name: "",
        contactPerson: "",
        company: "",
        email: "",
        phone: "",
        onboardingDate: "",
        status: "Active",
        userPermissions: [],
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

  const toggleUserPermission = (userId, folderId) => {
    setFormData(prev => {
      const userPermissions = [...(prev.userPermissions || [])];
      let userPerm = userPermissions.find(p => p.userId === userId);
      
      if (!userPerm) {
        userPerm = { userId, folderPermissions: [] };
        userPermissions.push(userPerm);
      }
      
      const folderIndex = userPerm.folderPermissions.indexOf(folderId);
      if (folderIndex > -1) {
        userPerm.folderPermissions.splice(folderIndex, 1);
      } else {
        userPerm.folderPermissions.push(folderId);
      }
      
      if (userPerm.folderPermissions.length === 0) {
        return {
          ...prev,
          userPermissions: userPermissions.filter(p => p.userId !== userId)
        };
      }
      
      return { ...prev, userPermissions };
    });
  };

  const toggleAllFoldersForUser = (userId) => {
    setFormData(prev => {
      const userPermissions = [...(prev.userPermissions || [])];
      let userPerm = userPermissions.find(p => p.userId === userId);
      
      if (!userPerm) {
        userPerm = { userId, folderPermissions: [] };
        userPermissions.push(userPerm);
      }
      
      if (userPerm.folderPermissions.length === ALL_FOLDERS.length) {
        userPerm.folderPermissions = [];
      } else {
        userPerm.folderPermissions = ALL_FOLDERS.map(f => f.id);
      }
      
      // Agar koi folder select nahi hai toh user ko remove karo
      if (userPerm.folderPermissions.length === 0) {
        return {
          ...prev,
          userPermissions: userPermissions.filter(p => p.userId !== userId)
        };
      }
      
      return { ...prev, userPermissions };
    });
  };

  const hasUserFolderPermission = (userId, folderId) => {
    const userPerm = formData.userPermissions?.find(p => p.userId === userId);
    return userPerm?.folderPermissions.includes(folderId) || false;
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/40 backdrop-blur-md p-4">
      <div className="glass w-full max-w-2xl p-4 sm:p-8 relative overflow-hidden max-h-[90vh] overflow-y-auto">
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

          {/* ✅ Access Control - Only for Admin with Unassign Feature */}
          {isAdmin && (
            <div className="border-t border-white/10 pt-4">
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-lg font-semibold text-white">🔐 Access Control</h3>
                <span className="text-xs text-gray-400">
                  {formData.userPermissions?.length || 0} users assigned
                </span>
              </div>
              
              {users.length === 0 ? (
                <p className="text-gray-400 text-sm">No users available</p>
              ) : (
                users.filter(u => u._id !== user._id).map((u) => {
                  const userPerm = formData.userPermissions?.find(p => p.userId === u._id);
                  const hasPermissions = userPerm?.folderPermissions?.length > 0;
                  
                  return (
                    <div key={u._id} className="glass-card p-3 mb-3">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-white">{u.name}</span>
                          <span className="text-gray-400 text-xs">({u.role})</span>
                          {hasPermissions && (
                            <span className="text-xs bg-green-500/20 text-green-400 px-2 py-0.5 rounded-full">
                              Assigned
                            </span>
                          )}
                        </div>
                        <div className="flex gap-2">
                          {/* ✅ UNASSIGN BUTTON - Complete Remove */}
                          {hasPermissions && (
                            <button
                              onClick={() => unassignUser(u._id)}
                              className="flex items-center gap-1 text-xs bg-red-500/20 text-red-400 px-3 py-1 rounded hover:bg-red-500/30 transition"
                              title={`Remove ${u.name} from this client`}
                            >
                              <FaUserMinus className="text-xs" />
                              Unassign
                            </button>
                          )}
                          <button
                            onClick={() => toggleAllFoldersForUser(u._id)}
                            className="text-xs bg-cyan-500/20 px-2 py-1 rounded hover:bg-cyan-500/30 transition"
                          >
                            {hasPermissions ? 'Deselect All' : 'Select All'}
                          </button>
                        </div>
                      </div>
                      
                      {/* Folder checkboxes */}
                      <div className="grid grid-cols-2 gap-1">
                        {ALL_FOLDERS.map((folder) => (
                          <label key={folder.id} className="flex items-center gap-2 cursor-pointer p-1 hover:bg-white/5 rounded text-sm">
                            <input
                              type="checkbox"
                              checked={hasUserFolderPermission(u._id, folder.id)}
                              onChange={() => toggleUserPermission(u._id, folder.id)}
                              className="w-3 h-3 accent-cyan-500"
                            />
                            <span className="text-gray-300">{folder.label}</span>
                          </label>
                        ))}
                      </div>
                      
                      {hasPermissions && (
                        <div className="flex justify-between items-center mt-2">
                          <p className="text-xs text-cyan-400">
                            Selected: {userPerm.folderPermissions.length} folders
                          </p>
                          {/* ✅ UNASSIGN BUTTON - Small version */}
                          <button
                            onClick={() => unassignUser(u._id)}
                            className="text-xs text-red-400 hover:text-red-300 hover:underline transition"
                          >
                            Remove all permissions
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
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