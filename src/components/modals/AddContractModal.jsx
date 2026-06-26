import { useEffect, useState } from "react";
import Select from "react-select";

function AddContractModal({
  open,
  onClose,
  onSave,
  editData,
}) {
  const [formData, setFormData] = useState({
    contractType: "",
    customContractType: "",
    contractName: "",
    firstParty: "",
    secondParty: "",
    startDate: "",
    endDate: "",
    status: "Active",
    pdf: "",
    pdfUrl: "",
  });

  useEffect(() => {
    if (editData) {
      setFormData(editData);
    } else {
      setFormData({
        contractType: "",
        customContractType: "",
        contractName: "",
        firstParty: "",
        secondParty: "",
        startDate: "",
        endDate: "",
        status: "Active",
        pdf: "",
        pdfUrl: "",
      });
    }
  }, [editData]);

  if (!open) return null;

  const contractOptions = [
    { value: "Service Agreement", label: "Service Agreement" },
    { value: "Vendor Agreement", label: "Vendor Agreement" },
    { value: "Employment Agreement", label: "Employment Agreement" },
    { value: "NDA", label: "NDA" },
    { value: "Partnership Agreement", label: "Partnership Agreement" },
    { value: "Lease Agreement", label: "Lease Agreement" },
    { value: "Consultancy Agreement", label: "Consultancy Agreement" },
    { value: "Franchise Agreement", label: "Franchise Agreement" },
    { value: "Joint Venture Agreement", label: "Joint Venture Agreement" },
    { value: "Purchase Agreement", label: "Purchase Agreement" },
    { value: "Shareholders Agreement", label: "Shareholders Agreement" },
    { value: "Others", label: "Others" },
  ];

  const customSelectStyles = {
    control: (provided, state) => ({
      ...provided,
      background: "rgba(255,255,255,0.04)",
      backdropFilter: "blur(25px)",
      border: state.isFocused
        ? "1px solid rgba(59,130,246,.5)"
        : "1px solid rgba(255,255,255,.08)",
      borderRadius: "24px",
      minHeight: "56px",
      boxShadow: "none",
      color: "#fff",
    }),

    menu: (provided) => ({
      ...provided,
      background: "rgba(15,23,42,.95)",
      backdropFilter: "blur(30px)",
      borderRadius: "20px",
      overflow: "hidden",
      border: "1px solid rgba(255,255,255,.08)",
      zIndex: 9999,
    }),

    option: (provided, state) => ({
      ...provided,
      background: state.isFocused
        ? "rgba(59,130,246,.20)"
        : "transparent",
      color: "#fff",
      cursor: "pointer",
    }),

    singleValue: (provided) => ({
      ...provided,
      color: "#fff",
    }),

    placeholder: (provided) => ({
      ...provided,
      color: "rgba(255,255,255,.6)",
    }),

    input: (provided) => ({
      ...provided,
      color: "#fff",
    }),

    dropdownIndicator: (provided) => ({
      ...provided,
      color: "#fff",
    }),

    indicatorSeparator: () => ({
      display: "none",
    }),
  };

  const handleSave = () => {
    const finalData = {
      ...formData,
      contractType:
        formData.contractType === "Others"
          ? formData.customContractType
          : formData.contractType,
    };

    onSave(finalData);

    setFormData({
      contractType: "",
      customContractType: "",
      contractName: "",
      firstParty: "",
      secondParty: "",
      startDate: "",
      endDate: "",
      status: "Active",
      pdf: "",
      pdfUrl: "",
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-[9999] p-4">

      <div className="glass p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">

        <h2 className="text-2xl font-bold mb-6 text-white">
          {editData ? "Edit Contract" : "Add Contract"}
        </h2>

        <div className="space-y-4">

          <Select
            styles={customSelectStyles}
            options={contractOptions}
            placeholder="Select Contract Type"
            value={
              formData.contractType
                ? {
                    value: formData.contractType,
                    label: formData.contractType,
                  }
                : null
            }
            onChange={(selected) =>
              setFormData({
                ...formData,
                contractType: selected.value,
              })
            }
          />

          {formData.contractType === "Others" && (
            <input
              type="text"
              placeholder="Enter Custom Contract Type"
              value={formData.customContractType}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  customContractType: e.target.value,
                })
              }
              className="glass-card p-4 w-full text-white outline-none"
            />
          )}

          <input
            type="text"
            placeholder="Contract Name"
            value={formData.contractName}
            onChange={(e) =>
              setFormData({
                ...formData,
                contractName: e.target.value,
              })
            }
            className="glass-card p-4 w-full text-white outline-none"
          />

          <input
            type="text"
            placeholder="First Party"
            value={formData.firstParty}
            onChange={(e) =>
              setFormData({
                ...formData,
                firstParty: e.target.value,
              })
            }
            className="glass-card p-4 w-full text-white outline-none"
          />

          <input
            type="text"
            placeholder="Second Party"
            value={formData.secondParty}
            onChange={(e) =>
              setFormData({
                ...formData,
                secondParty: e.target.value,
              })
            }
            className="glass-card p-4 w-full text-white outline-none"
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

            <input
              type="date"
              value={formData.startDate}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  startDate: e.target.value,
                })
              }
              className="glass-card p-4 w-full text-white outline-none"
            />

            <input
              type="date"
              value={formData.endDate}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  endDate: e.target.value,
                })
              }
              className="glass-card p-4 w-full text-white outline-none"
            />

          </div>

          <select
            value={formData.status}
            onChange={(e) =>
              setFormData({
                ...formData,
                status: e.target.value,
              })
            }
            className="glass-card p-4 w-full text-white outline-none bg-transparent"
          >
            <option className="bg-slate-900">Active</option>
            <option className="bg-slate-900">Expired</option>
            <option className="bg-slate-900">Renewed</option>
            <option className="bg-slate-900">Terminated</option>
          </select>

          <input
            type="file"
            accept=".pdf"
            onChange={(e) => {
              const file = e.target.files[0];

              if (!file) return;

              const reader = new FileReader();

              reader.onload = () => {
                setFormData((prev) => ({
                  ...prev,
                  pdf: file.name,
                  pdfUrl: reader.result,
                }));
              };

              reader.readAsDataURL(file);
            }}
            className="glass-card p-4 w-full text-white"
          />

          {formData.pdf && (
            <div className="glass-card p-4 text-green-400">
              Selected File: {formData.pdf}
            </div>
          )}

        </div>

        <div className="flex flex-col sm:flex-row justify-end gap-3 mt-8">

          <button
            onClick={onClose}
            className="glass-card px-6 py-3 text-white"
          >
            Cancel
          </button>

          <button
            onClick={handleSave}
            className="glass-card px-6 py-3 text-white blue-glow"
          >
            Save Contract
          </button>

        </div>

      </div>

    </div>
  );
}

export default AddContractModal;