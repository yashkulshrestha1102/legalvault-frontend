import { useState } from "react";

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

export default function AddUserModal({ open, onClose, onSave }) {
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

  if (!open) return null;

  const toggleFolder = (folderId) => {
    setFormData((prev) => {
      const current = prev.folderPermissions || [];
      if (current.includes(folderId)) {
        return {
          ...prev,
          folderPermissions: current.filter(id => id !== folderId)
        };
      } else {
        return {
          ...prev,
          folderPermissions: [...current, folderId]
        };
      }
    });
  };

  const selectAllFolders = () => {
    setFormData((prev) => ({
      ...prev,
      folderPermissions: ALL_FOLDERS.map(f => f.id)
    }));
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

    const reader = new FileReader();
    reader.onload = () => {
      setFormData((prev) => ({
        ...prev,
        avatar: reader.result,
      }));
    };
    reader.readAsDataURL(file);
  };

  const handleSave = () => {
    if (!formData.name || !formData.email || !formData.password) {
      alert("Name, Email, and Password are required!");
      return;
    }

    // ✅ Debug log
    console.log('📤 AddUserModal - Sending:', {
      name: formData.name,
      email: formData.email,
      folderPermissions: formData.folderPermissions
    });

    // ✅ IMPORTANT: folderPermissions ko explicitly bhejo
    onSave({
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      password: formData.password,
      department: formData.department,
      role: formData.role,
      status: formData.status,
      folderPermissions: formData.folderPermissions || [], // ✅ Ensure this
      avatar: formData.avatar,
      id: Date.now(),
      createdAt: new Date().toLocaleDateString(),
    });

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

    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50">
      <div className="glass w-[650px] p-8 max-h-[90vh] overflow-y-auto">
        <h2 className="text-3xl font-bold mb-6">Add User</h2>

        <div className="space-y-4">
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
              className="glass-card p-3 w-full"
            />
          </div>

          <input
            type="text"
            placeholder="Full Name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="glass-card w-full p-4 bg-transparent outline-none"
          />

          <input
            type="email"
            placeholder="Email Address"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className="glass-card w-full p-4 bg-transparent outline-none"
          />

          <input
            type="password"
            placeholder="Password"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            className="glass-card w-full p-4 bg-transparent outline-none"
          />

          <input
            type="text"
            placeholder="Phone Number"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            className="glass-card w-full p-4 bg-transparent outline-none"
          />

          <input
            type="text"
            placeholder="Department"
            value={formData.department}
            onChange={(e) => setFormData({ ...formData, department: e.target.value })}
            className="glass-card w-full p-4 bg-transparent outline-none"
          />

          <select
            value={formData.role}
            onChange={(e) => setFormData({ ...formData, role: e.target.value })}
            className="glass-card w-full p-4 bg-slate-900 text-white outline-none"
          >
            <option>Admin</option>
            <option>Lawyer</option>
            <option>Consultant</option>
            <option>Manager</option>
          </select>

          <select
            value={formData.status}
            onChange={(e) => setFormData({ ...formData, status: e.target.value })}
            className="glass-card w-full p-4 bg-slate-900 text-white outline-none"
          >
            <option>Active</option>
            <option>Inactive</option>
          </select>

          {/* ✅ 8 Folders - Permission Selection */}
          <div className="glass-card p-4">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-lg font-semibold">Folder Access Permissions</h3>
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
        </div>

        <div className="flex justify-end gap-4 mt-8">
          <button onClick={onClose} className="glass-card px-6 py-3">
            Cancel
          </button>
          <button onClick={handleSave} className="glass-card px-6 py-3 blue-glow">
            Save User
          </button>
        </div>
      </div>
    </div>
  );
}