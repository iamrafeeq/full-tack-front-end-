import { useState } from "react";
import { fmt, fmtDate, STATUS_COLORS, downloadInvoicePdf } from "./invoiceHelpers";

export default function InvoiceDetailModal({ invoice, onClose }) {
  const [pdfLoading, setPdfLoading] = useState(false);

  if (!invoice) return null;

  const handleDownload = async () => {
    setPdfLoading(true);
    try { await downloadInvoicePdf(invoice._id); } catch (e) { console.error(e); }
    finally { setPdfLoading(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h3 className="text-lg font-serif text-[#0B1F2A]">
            Invoice #{invoice._id?.slice(-6).toUpperCase()}
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl">✕</button>
        </div>

        <div className="px-6 py-5 space-y-4">
          {/* Guest + stay */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-400 text-xs uppercase tracking-wide mb-1">Guest</p>
              <p className="font-medium text-[#0B1F2A]">{invoice.guest?.name || "—"}</p>
              <p className="text-gray-500">{invoice.guest?.email || "—"}</p>
            </div>
            <div>
              <p className="text-gray-400 text-xs uppercase tracking-wide mb-1">Stay</p>
              <p className="font-medium text-[#0B1F2A]">{fmtDate(invoice.booking?.checkInDate)}</p>
              <p className="text-gray-500">→ {fmtDate(invoice.booking?.checkOutDate)}</p>
              {invoice.booking?.nights && (
                <p className="text-gray-400 text-xs">
                  {invoice.booking.nights} night{invoice.booking.nights !== 1 ? "s" : ""}
                </p>
              )}
            </div>
          </div>

          {/* Charge breakdown */}
          <div className="bg-gray-50 rounded-lg p-4 space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Room Charge</span>
              <span className="font-medium">{fmt(invoice.roomCharge)}</span>
            </div>
            {invoice.extraCharges?.length > 0 && (
              <div className="border-t border-gray-200 pt-2 mt-2">
                <p className="text-xs text-gray-400 mb-1">Extra Charges</p>
                {invoice.extraCharges.map((ex, i) => (
                  <div key={i} className="flex justify-between text-gray-600">
                    <span>{ex.description}</span>
                    <span>{fmt(ex.amount)}</span>
                  </div>
                ))}
              </div>
            )}
            {invoice.taxAmount > 0 && (
              <div className="flex justify-between text-gray-600">
                <span>Tax ({invoice.taxPercentage}%)</span>
                <span>{fmt(invoice.taxAmount)}</span>
              </div>
            )}
            <div className="border-t border-gray-200 pt-2 flex justify-between font-semibold text-[#0B1F2A]">
              <span>Total</span>
              <span>{fmt(invoice.totalAmount)}</span>
            </div>
          </div>

          {/* Status + date */}
          <div className="flex items-center justify-between">
            <span className={`px-3 py-1 rounded-full text-xs font-semibold capitalize ${
              STATUS_COLORS[invoice.paymentStatus] || "bg-gray-100 text-gray-600"
            }`}>
              {invoice.paymentStatus}
            </span>
            <span className="text-xs text-gray-400">Issued {fmtDate(invoice.createdAt)}</span>
          </div>
        </div>

        {/* Footer — Download only, no mark-paid */}
        <div className="px-6 py-4 border-t border-gray-100 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 rounded-lg border border-gray-200 text-sm text-gray-600 hover:bg-gray-50"
          >
            Close
          </button>
          <button
            onClick={handleDownload}
            disabled={pdfLoading}
            className="flex-1 px-4 py-2 rounded-lg bg-[#0B1F2A] text-white text-sm font-medium hover:opacity-90 disabled:opacity-60"
          >
            {pdfLoading ? "Downloading…" : "Download PDF"}
          </button>
        </div>
      </div>
    </div>
  );
}
