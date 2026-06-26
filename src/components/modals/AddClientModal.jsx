import { useState, useEffect } from "react";
import { FaTimes, FaUserPlus } from "react-icons/fa";

export default function AddClientModal({
  open,
  onClose,
  onSave,
  editData,
}) {
  const [formData, setFormData] = useState({
  name: "",
  contactPerson: "",
  company: "",
  email: "",
  phone: "",
  onboardingDate: "",
  status: "Active",
});

  useEffect(() => {
    if (editData) {
      setFormData(editData);
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
  }, [editData, open]);

  if (!open) return null;

  const handleSave = () => {
    onSave(formData);

    setFormData({
      name: "",
      company: "",
      email: "",
      phone: "",
      status: "Active",
    });

    onClose();
  };

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

            <div
              className="
              glass-icon
              text-cyan-400
              "
            >
              <FaUserPlus />
            </div>

            <div>
              <h2 className="text-3xl font-bold">
                {editData
                  ? "Edit Client"
                  : "Add New Client"}
              </h2>

              <p className="text-gray-400 text-sm mt-1">
                Client Information Management
              </p>
            </div>

          </div>

          <button
            onClick={onClose}
            className="
            glass-icon
            hover:scale-110
            transition-all
            "
          >
            <FaTimes />
          </button>

        </div>

        {/* Form */}

        <div className="space-y-5">

          <input
            type="text"
            placeholder="Client Name"
            value={formData.name}
            onChange={(e) =>
              setFormData({
                ...formData,
                name: e.target.value,
              })
            }
            className="
            w-full
            glass-card
            p-4
            outline-none
            placeholder:text-gray-400
            "
          />

          <input
            type="text"
            placeholder="Company Name"
            value={formData.company}
            onChange={(e) =>
              setFormData({
                ...formData,
                company: e.target.value,
              })
            }
            className="
            w-full
            glass-card
            p-4
            outline-none
            placeholder:text-gray-400
            "
          />

          <input
  type="text"
  placeholder="Contact Person Name"
  value={formData.contactPerson}
  onChange={(e) =>
    setFormData({
      ...formData,
      contactPerson: e.target.value,
    })
  }
  className="
  w-full
  glass-card
  p-4
  outline-none
  placeholder:text-gray-400
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
            w-full
            glass-card
            p-4
            outline-none
            placeholder:text-gray-400
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
            w-full
            glass-card
            p-4
            outline-none
            placeholder:text-gray-400
            "
          />
          <input
  type="date"
  value={formData.onboardingDate}
  onChange={(e) =>
    setFormData({
      ...formData,
      onboardingDate: e.target.value,
    })
  }
  className="
  w-full
  glass-card
  p-4
  outline-none
  "
/>

          <select
            value={formData.status}
            onChange={(e) =>
              setFormData({
                ...formData,
                status: e.target.value,
              })
            }
            className="
            w-full
            glass-card
            p-4
            outline-none
            cursor-pointer
            "
          >
            <option
              value="Active"
              className="bg-slate-900"
            >
              Active
            </option>

            <option
              value="Inactive"
              className="bg-slate-900"
            >
              Inactive
            </option>
          </select>

        </div>

        {/* Footer */}

        <div className="flex justify-end gap-4 mt-8">

          <button
            onClick={onClose}
            className="
            glass-card
            px-6
            py-3
            hover:scale-105
            transition-all
            "
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
            {editData
              ? "Update Client"
              : "Save Client"}
          </button>

        </div>
      </div>
    </div>
  );
}