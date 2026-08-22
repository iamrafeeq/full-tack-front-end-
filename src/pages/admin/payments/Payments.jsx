import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchAllPayments } from "../../../redux/slice/payments/paymentsSlice";
import AdminLayout from "../../../components/admin/AdminLayout";
import { fmtDate } from "../../../components/admin/invoices/invoiceHelpers";

const METHOD_LABELS = {
  credit_card:   "Credit Card",
  debit_card:    "Debit Card",
  easypaisa:     "EasyPaisa",
  jazzcash:      "JazzCash",
  bank_transfer: "Bank Transfer",
  cash:          "Cash",
};

const METHOD_COLORS = {
  credit_card:   "bg-blue-100 text-blue-700",
  debit_card:    "bg-indigo-100 text-indigo-700",
  easypaisa:     "bg-green-100 text-green-700",
  jazzcash:      "bg-red-100 text-red-700",
  bank_transfer: "bg-purple-100 text-purple-700",
  cash:          "bg-amber-100 text-amber-700",
};

const fmt = (n) =>
  `$${Number(n || 0).toLocaleString("en-US", { minimumFractionDigits: 2 })}`;

export default function AdminPayments() {
  const dispatch = useDispatch();
  const { allPayments, allLoading, allError } = useSelector((s) => s.payments);

  const [method,    setMethod]    = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate,   setEndDate]   = useState("");

  useEffect(() => {
    dispatch(fetchAllPayments({}));
  }, [dispatch]);

  const handleApply = () => {
    dispatch(fetchAllPayments({
      method:    method    || undefined,
      startDate: startDate || undefined,
      endDate:   endDate   || undefined,
    }));
  };

  const handleClear = () => {
    setMethod("");
    setStartDate("");
    setEndDate("");
    dispatch(fetchAllPayments({}));
  };

  return (
    <AdminLayout>

      {/* ── Filter bar ───────────────────────────────────────────────────── */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 mb-6 flex flex-wrap items-end gap-3">
        <div className="flex flex-col gap-1">
          <label className="text-xs text-gray-400 uppercase tracking-wide">Method</label>
          <select
            value={method}
            onChange={(e) => setMethod(e.target.value)}
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#C9A24B]"
          >
            <option value="">All Methods</option>
            {Object.entries(METHOD_LABELS).map(([val, label]) => (
              <option key={val} value={val}>{label}</option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs text-gray-400 uppercase tracking-wide">From</label>
          <input
            type="date"
            value={startDate}
            max={endDate || undefined}
            onChange={(e) => setStartDate(e.target.value)}
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#C9A24B]"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs text-gray-400 uppercase tracking-wide">To</label>
          <input
            type="date"
            value={endDate}
            min={startDate || undefined}
            onChange={(e) => setEndDate(e.target.value)}
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#C9A24B]"
          />
        </div>

        <div className="flex gap-2 self-end">
          <button
            onClick={handleApply}
            className="px-4 py-2 bg-[#0B1F2A] text-white text-sm rounded-lg hover:opacity-90"
          >
            Apply
          </button>
          <button
            onClick={handleClear}
            className="px-4 py-2 border border-gray-200 text-gray-600 text-sm rounded-lg hover:bg-gray-50"
          >
            Clear
          </button>
        </div>

        {!allLoading && (
          <span className="self-end text-xs text-gray-400 ml-auto">
            {allPayments.length} record{allPayments.length !== 1 ? "s" : ""}
          </span>
        )}
      </div>

      {/* ── Error ────────────────────────────────────────────────────────── */}
      {allError && (
        <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">
          {allError}
        </div>
      )}

      {/* ── Table ────────────────────────────────────────────────────────── */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-x-auto">
        {allLoading ? (
          <div className="p-6 space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-12 bg-gray-100 rounded-lg animate-pulse" />
            ))}
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 text-left">
                {["#", "Guest", "Room & Dates", "Amount", "Method", "Transaction ID", "Paid On"].map((h) => (
                  <th
                    key={h}
                    className="px-4 py-3 text-xs uppercase tracking-wide text-gray-400 font-medium whitespace-nowrap"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {allPayments.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-16 text-gray-400">
                    No payment records found.
                  </td>
                </tr>
              ) : (
                allPayments.map((payment, idx) => {
                  const txId = payment.transactionId || payment.stripePaymentIntentId || "—";
                  return (
                    <tr
                      key={payment._id}
                      className="border-b border-gray-50 hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-4 py-3 text-gray-400">{idx + 1}</td>

                      {/* Guest */}
                      <td className="px-4 py-3">
                        <p className="font-medium text-[#0B1F2A]">{payment.guest?.name || "—"}</p>
                        <p className="text-xs text-gray-400">{payment.guest?.email || ""}</p>
                      </td>

                      {/* Room & Dates */}
                      <td className="px-4 py-3">
                        <p className="font-medium text-[#0B1F2A]">
                          Room {payment.booking?.room?.roomNumber || "—"}
                        </p>
                        <p className="text-xs text-gray-400 whitespace-nowrap">
                          {fmtDate(payment.booking?.checkInDate)} → {fmtDate(payment.booking?.checkOutDate)}
                        </p>
                      </td>

                      {/* Amount */}
                      <td className="px-4 py-3 font-semibold text-[#0B1F2A] whitespace-nowrap">
                        {fmt(payment.amount)}
                      </td>

                      {/* Method badge */}
                      <td className="px-4 py-3">
                        <span className={`text-xs font-medium px-2.5 py-1 rounded-full whitespace-nowrap ${
                          METHOD_COLORS[payment.method] || "bg-gray-100 text-gray-600"
                        }`}>
                          {METHOD_LABELS[payment.method] || payment.method}
                        </span>
                      </td>

                      {/* Transaction ID (monospace, truncated) */}
                      <td className="px-4 py-3 max-w-[180px]">
                        <span
                          title={txId}
                          className="block font-mono text-xs text-gray-500 truncate"
                        >
                          {txId}
                        </span>
                      </td>

                      {/* Paid On */}
                      <td className="px-4 py-3 whitespace-nowrap text-gray-600">
                        {fmtDate(payment.paidAt)}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        )}
      </div>

    </AdminLayout>
  );
}
