const ROLE_STYLES = {
  admin:        "bg-[#C9A24B]/15 text-[#9A7A2E]",
  manager:      "bg-blue-100 text-blue-700",
  receptionist: "bg-green-100 text-green-700",
  housekeeping: "bg-purple-100 text-purple-700",
  user:         "bg-gray-100 text-gray-600",
};

function Field({ label, value }) {
  return (
    <div>
      <dt className="text-xs uppercase tracking-wide text-gray-400 mb-0.5">{label}</dt>
      <dd className="text-sm text-[#0B1F2A] font-medium">{value || "—"}</dd>
    </div>
  );
}

export default function UserDetailModal({ user, onClose }) {
  if (!user) return null;

  const initials = user.name
    ? user.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : "?";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-lg z-10">
        {/* Header */}
        <div className="flex items-center gap-4 px-6 py-5 border-b border-gray-100">
          <div className="w-12 h-12 rounded-full bg-[#0B1F2A] text-[#C9A24B] flex items-center justify-center text-base font-semibold shrink-0">
            {initials}
          </div>
          <div>
            <h2 className="text-lg font-serif text-[#0B1F2A]">{user.name || "—"}</h2>
            <p className="text-sm text-gray-400">{user.email || "—"}</p>
          </div>
          <div className="ml-auto flex items-center gap-3">
            <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${ROLE_STYLES[user.role] || ROLE_STYLES.user}`}>
              {user.role || "user"}
            </span>
            <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${user.isActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-500"}`}>
              {user.isActive ? "Active" : "Inactive"}
            </span>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-xl leading-none"
            >
              ×
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="px-6 py-5">
          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
            <Field label="Full Name"            value={user.name} />
            <Field label="Email"                value={user.email} />
            <Field label="Phone"                value={user.phone} />
            <Field
              label="Date of Birth"
              value={user.Date_OF_Birth ? new Date(user.Date_OF_Birth).toLocaleDateString() : null}
            />
            <Field label="Nationality"          value={user.Nationality} />
            <Field label="CNIC / Passport No."  value={user.CNIC_Passport_Number} />
            <Field label="Address" value={user.Address} />
            <Field
              label="Joined"
              value={user.createdAt ? new Date(user.createdAt).toLocaleDateString() : null}
            />
          </dl>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 flex justify-end">
          <button
            onClick={onClose}
            className="bg-[#0B1F2A] text-white text-sm px-5 py-2 rounded-md hover:opacity-90"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
