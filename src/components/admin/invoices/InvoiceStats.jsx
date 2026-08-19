export default function InvoiceStats({ total, paid, unpaid, loading }) {
  const stats = [
    { label: "Total Invoices", value: total,  icon: "🧾" },
    { label: "Paid",           value: paid,   icon: "✅" },
    { label: "Outstanding",    value: unpaid, icon: "⏳" },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
      {stats.map(({ label, value, icon }) => (
        <div
          key={label}
          className="bg-white rounded-lg p-5 shadow-sm border border-gray-100 flex items-center gap-4"
        >
          <span className="text-2xl">{icon}</span>
          <div>
            <p className="text-xs text-gray-400 uppercase tracking-wide">{label}</p>
            <p className="text-2xl font-serif text-[#0B1F2A]">
              {loading ? "…" : value}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
