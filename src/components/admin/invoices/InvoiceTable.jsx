import { useState } from "react";
import { fmt, fmtDate, STATUS_COLORS, downloadInvoicePdf } from "./invoiceHelpers";

export default function InvoiceTable({ invoices, loading, error, filter, onFilterChange, onViewDetail }) {
  const [pdfLoading, setPdfLoading] = useState(null); // holds invoice id being downloaded

  const paidCount   = invoices.filter((i) => i.paymentStatus === "paid").length;
  const pendingCount = invoices.filter((i) => i.paymentStatus === "pending").length;

  const displayed = invoices.filter((inv) =>
    filter === "all" ? true : inv.paymentStatus === filter
  );

  const totalRevenue = invoices.reduce((s, i) => s + (i.totalAmount || 0), 0);

  const filters = [
    { key: "all",     label: `All (${invoices.length})` },
    { key: "paid",    label: `Paid (${paidCount})` },
    { key: "pending", label: `Pending (${pendingCount})` },
  ];

  const handleDownload = async (inv) => {
    setPdfLoading(inv._id);
    try { await downloadInvoicePdf(inv._id); } catch (e) { console.error(e); }
    finally { setPdfLoading(null); }
  };

  return (
    <div>
      {/* Toolbar — filter only, no generate button */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-4 flex gap-2 flex-wrap">
        {filters.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => onFilterChange(key)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition ${
              filter === key
                ? "bg-[#0B1F2A] text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="py-20 text-center text-gray-400">Loading invoices…</div>
        ) : error ? (
          <div className="py-20 text-center text-red-500">{error}</div>
        ) : displayed.length === 0 ? (
          <div className="py-20 text-center">
            <p className="text-4xl mb-3">🧾</p>
            <p className="text-gray-500 font-medium">No invoices yet</p>
            <p className="text-gray-400 text-sm mt-1">Invoices are generated automatically at check-out</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50 text-xs uppercase tracking-wide text-gray-400">
                  <th className="px-5 py-3 text-left">Invoice</th>
                  <th className="px-5 py-3 text-left">Guest</th>
                  <th className="px-5 py-3 text-left">Stay</th>
                  <th className="px-5 py-3 text-right">Room Charge</th>
                  <th className="px-5 py-3 text-right">Total</th>
                  <th className="px-5 py-3 text-center">Status</th>
                  <th className="px-5 py-3 text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {displayed.map((inv) => (
                  <tr key={inv._id} className="border-b border-gray-50 hover:bg-gray-50/60 transition">
                    <td className="px-5 py-3 font-mono text-gray-500 text-xs">
                      #{inv._id?.slice(-6).toUpperCase()}
                    </td>
                    <td className="px-5 py-3">
                      <p className="font-medium text-[#0B1F2A]">{inv.guest?.name || "—"}</p>
                      <p className="text-gray-400 text-xs">{inv.guest?.email || "—"}</p>
                    </td>
                    <td className="px-5 py-3 text-gray-600">
                      {fmtDate(inv.booking?.checkInDate)} → {fmtDate(inv.booking?.checkOutDate)}
                    </td>
                    <td className="px-5 py-3 text-right">{fmt(inv.roomCharge)}</td>
                    <td className="px-5 py-3 text-right font-semibold text-[#0B1F2A]">
                      {fmt(inv.totalAmount)}
                    </td>
                    <td className="px-5 py-3 text-center">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold capitalize ${
                        STATUS_COLORS[inv.paymentStatus] || "bg-gray-100 text-gray-600"
                      }`}>
                        {inv.paymentStatus}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => onViewDetail(inv._id)}
                          className="px-3 py-1 rounded-lg border border-gray-200 text-xs text-gray-600 hover:bg-gray-50 transition"
                        >
                          View
                        </button>
                        <button
                          onClick={() => handleDownload(inv)}
                          disabled={pdfLoading === inv._id}
                          className="px-3 py-1 rounded-lg bg-[#0B1F2A] text-white text-xs font-medium hover:opacity-90 transition disabled:opacity-60"
                        >
                          {pdfLoading === inv._id ? "…" : "PDF"}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t border-gray-200 bg-gray-50">
                  <td colSpan={4} className="px-5 py-3 text-xs text-gray-400 uppercase tracking-wide">
                    Total Revenue ({paidCount} paid)
                  </td>
                  <td className="px-5 py-3 text-right font-semibold text-[#0B1F2A]">
                    {fmt(totalRevenue)}
                  </td>
                  <td colSpan={2} />
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
