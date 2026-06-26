import { FaTrashAlt } from "react-icons/fa";

export default function DeleteConfirmModal({
  open,
  onClose,
  onConfirm,
}) {
  if (!open) return null;

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
        w-[500px]
        p-8
        text-center
      "
      >
        <div
          className="
          w-20
          h-20
          mx-auto
          mb-6
          rounded-full
          glass-card
          flex
          items-center
          justify-center
          text-red-400
          text-3xl
        "
        >
          <FaTrashAlt />
        </div>

        <h2 className="text-3xl font-bold mb-3">
          Delete User
        </h2>

        <p className="text-slate-400 mb-8">
          Are you sure you want to delete
          this user? This action cannot be
          undone.
        </p>

        <div className="flex justify-center gap-4">

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
            onClick={onConfirm}
            className="
            glass-card
            px-6
            py-3
            text-red-400
            border
            border-red-500/30
          "
          >
            Delete User
          </button>

        </div>
      </div>
    </div>
  );
}

