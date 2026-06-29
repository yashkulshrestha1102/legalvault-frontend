import { useState } from "react";

export default function AddUserModal({
  open,
  onClose,
  onSave,
}) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",        // ✅ Password field add karo
    department: "",
    role: "Consultant",
    status: "Active",
    avatar: "",
  });

  if (!open) return null;

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
    // ✅ Password required validation
    if (!formData.name || !formData.email || !formData.password) {
      alert("Name, Email, and Password are required!");
      return;
    }

    onSave({
      ...formData,
      id: Date.now(),
      createdAt: new Date().toLocaleDateString(),
    });

    setFormData({
      name: "",
      email: "",
      phone: "",
      password: "",        // ✅ Reset password
      department: "",
      role: "Consultant",
      status: "Active",
      avatar: "",
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50">
      <div className="glass w-[650px] p-8">
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
            onChange={(e) =>
              setFormData({ ...formData, name: e.target.value })
            }
            className="glass-card w-full p-4 bg-transparent outline-none"
          />

          <input
            type="email"
            placeholder="Email Address"
            value={formData.email}
            onChange={(e) =>
              setFormData({ ...formData, email: e.target.value })
            }
            className="glass-card w-full p-4 bg-transparent outline-none"
          />

          {/* ✅ Password Field Add */}
          <input
            type="password"
            placeholder="Password"
            value={formData.password}
            onChange={(e) =>
              setFormData({ ...formData, password: e.target.value })
            }
            className="glass-card w-full p-4 bg-transparent outline-none"
          />

          <input
            type="text"
            placeholder="Phone Number"
            value={formData.phone}
            onChange={(e) =>
              setFormData({ ...formData, phone: e.target.value })
            }
            className="glass-card w-full p-4 bg-transparent outline-none"
          />

          <input
            type="text"
            placeholder="Department"
            value={formData.department}
            onChange={(e) =>
              setFormData({ ...formData, department: e.target.value })
            }
            className="glass-card w-full p-4 bg-transparent outline-none"
          />

          <select
            value={formData.role}
            onChange={(e) =>
              setFormData({ ...formData, role: e.target.value })
            }
            className="glass-card w-full p-4 bg-slate-900 text-white outline-none"
          >
            <option>Admin</option>
            <option>Lawyer</option>
            <option>Consultant</option>
            <option>Manager</option>
          </select>

          <select
            value={formData.status}
            onChange={(e) =>
              setFormData({ ...formData, status: e.target.value })
            }
            className="glass-card w-full p-4 bg-slate-900 text-white outline-none"
          >
            <option>Active</option>
            <option>Inactive</option>
          </select>
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