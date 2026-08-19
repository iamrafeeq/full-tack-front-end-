import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  generateInvoice,
  clearInvoiceError,
} from "../../../redux/slice/invoice/invoiceSlice";
import { fetchBookings } from "../../../redux/slice/Booking/bookingSlice";
import { fmtDate } from "./invoiceHelpers";

export default function GenerateInvoiceModal({ onClose }) {
  const dispatch = useDispatch();

  const { generateLoading, generateError, invoices } = useSelector((s) => s.invoices);
  const { bookings, loading: bookingsLoading } = useSelector((s) => s.bookings);

  const [bookingId, setBookingId] = useState("");
  const [extras, setExtras]       = useState([{ description: "", amount: "" }]);
  const [success, setSuccess]     = useState(false);

  useEffect(() => {
    dispatch(fetchBookings());
  }, [dispatch]);

  // Only checked-out bookings that don't already have an invoice
  const invoicedBookingIds = new Set(invoices.map((inv) => inv.booking?._id || inv.booking));
  const eligibleBookings = bookings.filter(
    (b) => b.status === "checked-out" && !invoicedBookingIds.has(b._id)
  );

  const addExtra = () =>
    setExtras((prev) => [...prev, { description: "", amount: "" }]);

  const removeExtra = (i) =>
    setExtras((prev) => prev.filter((_, idx) => idx !== i));

  const updateExtra = (i, field, value) =>
    setExtras((prev) =>
      prev.map((e, idx) => (idx === i ? { ...e, [field]: value } : e))
    );

  const handleSubmit = async (e) => {
    e.preventDefault();
    dispatch(clearInvoiceError());

    const validExtras = extras
      .filter((ex) => ex.description.trim() && ex.amount !== "")
      .map((ex) => ({ description: ex.description.trim(), amount: Number(ex.amount) }));

    const result = await dispatch(
      generateInvoice({ bookingId, extraCharges: validExtras })
    );

    if (result.meta.requestStatus === "fulfilled") {
      setSuccess(true);
      setTimeout(onClose, 1200);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h3 className="text-lg font-serif text-[#0B1F2A]">Generate Invoice</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl">✕</button>
        </div>

        {success ? (
          <div className="px-6 py-10 text-center">
            <div className="text-4xl mb-3">✅</div>
            <p className="text-green-700 font-medium">Invoice generated successfully!</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="px-6 py-5 space-y-5">
            {generateError && (
              <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded">{generateError}</p>
            )}

            {/* Booking selector */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Select Booking <span className="text-red-500">*</span>
              </label>

              {bookingsLoading ? (
                <div className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-400">
                  Loading bookings…
                </div>
              ) : eligibleBookings.length === 0 ? (
                <div className="w-full border border-amber-200 bg-amber-50 rounded-lg px-3 py-2 text-sm text-amber-700">
                  No checked-out bookings without an invoice found.
                </div>
              ) : (
                <select
                  value={bookingId}
                  onChange={(e) => setBookingId(e.target.value)}
                  required
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#C9A24B]/40 bg-white"
                >
                  <option value="">— Choose a booking —</option>
                  {eligibleBookings.map((b) => (
                    <option key={b._id} value={b._id}>
                      {b.guest?.name || "Guest"} · Room {b.room?.roomNumber || "?"} ·{" "}
                      {fmtDate(b.checkInDate)} → {fmtDate(b.checkOutDate)} · ${b.totalAmount}
                    </option>
                  ))}
                </select>
              )}

              {/* Show selected booking summary */}
              {bookingId && (() => {
                const selected = eligibleBookings.find((b) => b._id === bookingId);
                if (!selected) return null;
                return (
                  <div className="mt-2 bg-gray-50 rounded-lg px-3 py-2 text-xs text-gray-600 space-y-0.5">
                    <p><span className="text-gray-400">Guest:</span> {selected.guest?.name} ({selected.guest?.email})</p>
                    <p><span className="text-gray-400">Room:</span> {selected.room?.roomNumber} · {selected.room?.type}</p>
                    <p><span className="text-gray-400">Nights:</span> {selected.nights}</p>
                    <p><span className="text-gray-400">Room charge:</span> ${selected.totalAmount}</p>
                  </div>
                );
              })()}
            </div>

            {/* Extra charges */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-gray-700">
                  Extra Charges <span className="text-gray-400 font-normal">(optional)</span>
                </label>
                <button
                  type="button"
                  onClick={addExtra}
                  className="text-xs text-[#C9A24B] hover:underline"
                >
                  + Add line
                </button>
              </div>
              <div className="space-y-2">
                {extras.map((ex, i) => (
                  <div key={i} className="flex gap-2 items-center">
                    <input
                      type="text"
                      value={ex.description}
                      onChange={(e) => updateExtra(i, "description", e.target.value)}
                      placeholder="e.g. Room Service, Mini Bar"
                      className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#C9A24B]/40"
                    />
                    <input
                      type="number"
                      min="0"
                      value={ex.amount}
                      onChange={(e) => updateExtra(i, "amount", e.target.value)}
                      placeholder="$"
                      className="w-24 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#C9A24B]/40"
                    />
                    {extras.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeExtra(i)}
                        className="text-red-400 hover:text-red-600 text-lg leading-none"
                      >
                        ×
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2 rounded-lg border border-gray-200 text-sm text-gray-600 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={generateLoading || eligibleBookings.length === 0}
                className="flex-1 px-4 py-2 rounded-lg bg-[#0B1F2A] text-white text-sm font-medium hover:bg-[#0B1F2A]/90 disabled:opacity-60"
              >
                {generateLoading ? "Generating…" : "Generate Invoice"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
