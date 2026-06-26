export default function ViewUserModal({
  open,
  onClose,
  user,
}) {
  if (!open || !user) return null;

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
        <div className="flex justify-between items-center mb-8">

          <h2 className="text-3xl font-bold">
            User Details
          </h2>

          <button
            onClick={onClose}
            className="
            glass-card
            px-4
            py-2
          "
          >
            Close
          </button>

        </div>

        <div className="grid md:grid-cols-2 gap-5">

          <div className="glass-card p-4">
            <p className="text-slate-400 text-sm">
              Full Name
            </p>

            <h3 className="text-lg font-semibold mt-1">
              {user.name}
            </h3>
          </div>

          <div className="glass-card p-4">
            <p className="text-slate-400 text-sm">
              Email
            </p>

            <h3 className="text-lg font-semibold mt-1">
              {user.email}
            </h3>
          </div>

          <div className="glass-card p-4">
            <p className="text-slate-400 text-sm">
              Phone Number
            </p>

            <h3 className="text-lg font-semibold mt-1">
              {user.phone}
            </h3>
          </div>

          <div className="glass-card p-4">
            <p className="text-slate-400 text-sm">
              Department
            </p>

            <h3 className="text-lg font-semibold mt-1">
              {user.department}
            </h3>
          </div>

          <div className="glass-card p-4">
            <p className="text-slate-400 text-sm">
              Role
            </p>

            <h3 className="text-lg font-semibold mt-1">
              {user.role}
            </h3>
          </div>

          <div className="glass-card p-4">
            <p className="text-slate-400 text-sm">
              Status
            </p>

            <span
              className={`
              inline-block
              mt-2
              px-4
              py-2
              rounded-full
              text-sm
              ${
                user.status === "Active"
                  ? "bg-green-500/20 text-green-400"
                  : "bg-red-500/20 text-red-400"
              }
            `}
            >
              {user.status}
            </span>
          </div>

          <div className="glass-card p-4 md:col-span-2">
            <p className="text-slate-400 text-sm">
              Joined Date
            </p>

            <h3 className="text-lg font-semibold mt-1">
              {user.createdAt}
            </h3>
          </div>

        </div>
      </div>
    </div>
  );
}

