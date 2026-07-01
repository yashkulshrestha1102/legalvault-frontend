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

export default function EditUserModal({ open, onClose, onSave, user }) {
  const [formData, setFormData] = useState({
    id: "",
    _id: "",
    name: "",
    email: "",
    phone: "",
    department: "",
    role: "Consultant",
    status: "Active",
    folderPermissions: [],
    createdAt: "",
  });

  useEffect(() => {
    if (user) {
      setFormData({
        ...user,
        id: user._id || user.id || "",  // ✅ Ensure id is set from _id or id
        _id: user._id || user.id || "", // ✅ Store _id separately
        folderPermissions: user.folderPermissions || []
      });
    }
  }, [user]);

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

  const handleSave = () => {
    // ✅ Ensure id is present
    const userId = formData._id || formData.id;
    if (!userId) {
      console.error('❌ User ID is missing!', formData);
      alert('Error: User ID not found. Please try again.');
      return;
    }
    
    // ✅ Create user object with proper id
    const userToSave = {
      ...formData,
      id: userId,
      _id: userId
    };
    
    console.log('📤 Saving user with ID:', userId);
    onSave(userToSave);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50">
      <div className="glass w-[650px] p-8 max-h-[90vh] overflow-y-auto">
        <h2 className="text-3xl font-bold mb-6">Edit User</h2>

        <div className="space-y-4">
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
            Update User
          </button>
        </div>
      </div>
    </div>
  );
}