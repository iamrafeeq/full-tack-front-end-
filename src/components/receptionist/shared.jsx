 // Shared micro-components and helpers used across all receptionist feature components

export const fmtDate = (d) =>
  d
    ? new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
    : "—";

export const PAYMENT_METHODS = [
  { value: "cash",          label: "Cash" },
  { value: "credit_card",   label: "Credit Card" },
  { value: "debit_card",    label: "Debit Card" },
  { value: "easypaisa",     label: "EasyPaisa" },
  { value: "jazzcash",      label: "JazzCash" },
  { value: "bank_transfer", label: "Bank Transfer" },
];

export function Card({ title, icon, count, action, children }) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-6">
      <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-lg">{icon}</span>
          <h2 className="text-base font-semibold text-[#0B1F2A]">{title}</h2>
          {count !== undefined && (
            <span className="text-xs bg-[#C9A24B]/15 text-[#0B1F2A] px-2 py-0.5 rounded-full font-medium">
              {count}
            </span>
          )}
        </div>
        {action && <div>{action}</div>}
      </div>
      {children}
    </div>
  );
}

export function THead({ cols }) {
  return (
    <thead>
      <tr className="border-b border-gray-100">
        {cols.map((h) => (
          <th
            key={h}
            className="px-4 py-3 text-xs uppercase tracking-wide text-gray-400 font-medium text-left whitespace-nowrap"
          >
            {h}
          </th>
        ))}
      </tr>
    </thead>
  );
}

export function GuestCell({ guest }) {
  return (
    <td className="px-4 py-3">
      <p className="font-medium text-[#0B1F2A]">{guest?.name || "—"}</p>
      <p className="text-xs text-gray-400">{guest?.email || ""}</p>
    </td>
  );
}

export function RoomCell({ room }) {
  return (
    <td className="px-4 py-3">
      <p className="font-medium text-[#0B1F2A]">Room {room?.roomNumber || "—"}</p>
      <p className="text-xs capitalize text-gray-400">{room?.type || ""}</p>
    </td>
  );
}

export function PayBadge({ status }) {
  return (
    <span
      className={`text-xs font-medium px-2.5 py-1 rounded-full ${
        status === "paid" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"
      }`}
    >
      {status === "paid" ? "Paid" : "Due"}
    </span>
  );
}

export function Spinner() {
  return (
    <div className="flex justify-center py-10">
      <div className="w-7 h-7 border-4 border-[#C9A24B] border-t-transparent rounded-full animate-spin" />
    </div>
  );
}

export function ErrBanner({ msg }) {
  return (
    <div className="px-4 py-2.5 bg-red-50 border border-red-200 rounded-md text-sm text-red-600">
      {msg}
    </div>
  );
}

export function Empty({ msg }) {
  return <p className="text-center text-gray-400 text-sm py-8 px-6">{msg}</p>;
}
