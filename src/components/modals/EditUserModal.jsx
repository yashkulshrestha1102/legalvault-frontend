import {
  useState,
  useEffect,
} from "react";

export default function EditUserModal({
  open,
  onClose,
  onSave,
  user,
}) {
  const [formData, setFormData] =
    useState({
      id: "",
      name: "",
      email: "",
      phone: "",
      department: "",
      role: "Consultant",
      status: "Active",
      createdAt: "",
    });

  useEffect(() => {
    if (user) {
      setFormData(user);
    }
  }, [user]);

  if (!open) return null;

  const handleSave = () => {
    onSave(formData);
    onClose();
  };

  return (
    <div
      className="
      fixed
      inset-0
      bg-black/60
      backdrop-blur-sm
      flex
      justify-center
      items-center
      z-50
    "
    >
      <div
        className="
        glass
        w-[650px]
        p-8
      "
      >
        <h2 className="text-3xl font-bold mb-6">
          Edit User
        </h2>

        <div className="space-y-4">

          <input
            type="text"
            placeholder="Full Name"
            value={formData.name}
            onChange={(e) =>
              setFormData({
                ...formData,
                name: e.target.value,
              })
            }
            className="
            glass-card
            w-full
            p-4
            bg-transparent
            outline-none
          "
          />

          <input
            type="email"
            placeholder="Email Address"
            value={formData.email}
            onChange={(e) =>
              setFormData({
                ...formData,
                email: e.target.value,
              })
            }
            className="
            glass-card
            w-full
            p-4
            bg-transparent
            outline-none
          "
          />

          <input
            type="text"
            placeholder="Phone Number"
            value={formData.phone}
            onChange={(e) =>
              setFormData({
                ...formData,
                phone: e.target.value,
              })
            }
            className="
            glass-card
            w-full
            p-4
            bg-transparent
            outline-none
          "
          />

          <input
            type="text"
            placeholder="Department"
            value={formData.department}
            onChange={(e) =>
              setFormData({
                ...formData,
                department:
                  e.target.value,
              })
            }
            className="
            glass-card
            w-full
            p-4
            bg-transparent
            outline-none
          "
          />

          <select
            value={formData.role}
            onChange={(e) =>
              setFormData({
                ...formData,
                role: e.target.value,
              })
            }
            className="
            glass-card
            w-full
            p-4
            bg-slate-900
            text-white
            outline-none
          "
          >
            <option>Admin</option>
            <option>Lawyer</option>
            <option>Consultant</option>
            <option>Manager</option>
          </select>

          <select
            value={formData.status}
            onChange={(e) =>
              setFormData({
                ...formData,
                status:
                  e.target.value,
              })
            }
            className="
            glass-card
            w-full
            p-4
            bg-slate-900
            text-white
            outline-none
          "
          >
            <option>Active</option>
            <option>Inactive</option>
          </select>

        </div>

        <div className="flex justify-end gap-4 mt-8">

          <button
            onClick={onClose}
            className="
            glass-card
            px-6
            py-3
          "
          >
            Cancel
          </button>

          <button
            onClick={handleSave}
            className="
            glass-card
            px-6
            py-3
            blue-glow
          "
          >
            Update User
          </button>

        </div>
      </div>
    </div>
  );
}

