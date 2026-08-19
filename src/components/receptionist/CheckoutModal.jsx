import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { checkOutBooking } from "../../redux/slice/Booking/bookingSlice";
import { fmt } from "../admin/invoices/invoiceHelpers";
import { ErrBanner } from "./shared";

export default function CheckoutModal({ booking, onClose, onSuccess }) {
  const dispatch = useDispatch();
  const { checkOutLoading, checkOutError } = useSelector((s) => s.bookings);
  const [coExtras, setCoExtras] = useState([{ description: "", amount: "" }]);

  const addRow    = () => setCoExtras((p) => [...p, { description: "", amount: "" }]);
  const removeRow = (i) => setCoExtras((p) => p.filter((_, idx) => idx !== i));
  const updateRow = (i, field, val) =>
    setCoExtras((p) => p.map((x, idx) => (idx === i ? { ...x, [field]: val } : x)));

  const handleSubmit = async () => {
    const validExtras = coExtras
      .filter((ex) => ex.description.trim() && ex.amount !== "")
      .map((ex) => ({ description: ex.description.trim(), amount: Number(ex.amount) }));
    try {
      const result = await dispatch(
        checkOutBooking({ id: booking._id, extraCharges: validExtras })
      ).unwrap();
      onClose();
      onSuccess(result.invoice);
    } catch (_) {}
  };

  const extraSum     = coExtras.reduce((s, e) => s + (Number(e.amount) || 0), 0);
  const grandTotal   = (booking.totalAmount || 0) + extraSum;
  const paymentBlocked =
    booking.paymentTiming === "checkout" && booking.paymentStatus !== "paid";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-lg z-10 max-h-[92vh] flex flex-col">

        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-serif text-[#0B1F2A]">Complete Check-Out</h3>
            <p className="text-xs text-gray-400 mt-0.5">
              {booking.guest?.name} · Room {booking.room?.roomNumber}
            </p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl">✕</button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto px-6 py-5 space-y-5 flex-1">
          {paymentBlocked && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              Payment required before checkout. Use <strong>Collect Pay</strong> first, then check out.
            </div>
          )}
          {checkOutError && <ErrBanner msg={checkOutError} />}

          {/* Room charge */}
          <div className="bg-gray-50 rounded-lg px-4 py-3 flex justify-between text-sm">
            <span className="text-gray-500">
              Room Charge ({booking.nights} night{booking.nights !== 1 ? "s" : ""})
            </span>
            <span className="font-semibold text-[#0B1F2A]">{fmt(booking.totalAmount)}</span>
          </div>

          {/* Extra charges */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-gray-700">Extra Charges</p>
              <button type="button" onClick={addRow} className="text-xs text-[#C9A24B] hover:underline">
                + Add row
              </button>
            </div>
            <div className="space-y-2">
              {coExtras.map((ex, i) => (
                <div key={i} className="flex gap-2 items-center">
                  <input
                    type="text"
                    value={ex.description}
                    onChange={(e) => updateRow(i, "description", e.target.value)}
                    placeholder="e.g. Mini Bar, Laundry"
                    className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#C9A24B]/40"
                  />
                  <input
                    type="number"
                    min="0"
                    value={ex.amount}
                    onChange={(e) => updateRow(i, "amount", e.target.value)}
                    placeholder="$"
                    className="w-24 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#C9A24B]/40"
                  />
                  {coExtras.length > 1 && (
                    <button onClick={() => removeRow(i)} className="text-red-400 hover:text-red-600 text-lg leading-none">
                      ×
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Grand total */}
          <div className="flex items-center justify-between border-t border-gray-100 pt-3">
            <span className="text-sm font-medium text-gray-600">Grand Total</span>
            <span className="text-xl font-semibold text-[#C9A24B]">{fmt(grandTotal)}</span>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 border border-gray-200 text-sm px-4 py-2 rounded-lg hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={checkOutLoading || paymentBlocked}
            className="flex-1 bg-blue-600 text-white text-sm px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-60"
          >
            {checkOutLoading ? "Processing…" : "Complete Check-Out"}
          </button>
        </div>
      </div>
    </div>
  );
}
