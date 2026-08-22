import { useState } from "react";
import { fmt, fmtDate, fmtMethod, downloadInvoicePdf } from "../admin/invoices/invoiceHelpers";

export default function InvoiceConfirmModal({ invoice, onClose }) {
  const [pdfLoading, setPdfLoading] = useState(false);

  const handlePdf = async () => {
    setPdfLoading(true);
    try {
      await downloadInvoicePdf(invoice._id);
    } catch (_) {}
    finally {
      setPdfLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-sm z-10 p-6">
        <div className="text-center mb-5">
          <div className="text-4xl mb-2">✅</div>
          <h3 className="text-lg font-serif text-[#0B1F2A]">Check-Out Complete</h3>
          <p className="text-xs text-gray-400 mt-1">
            Invoice #{invoice._id?.slice(-6).toUpperCase()}
          </p>
        </div>

        <div className="bg-gray-50 rounded-lg p-4 space-y-2 text-sm mb-5">
          <div className="flex justify-between">
            <span className="text-gray-500">Room Charge</span>
            <span className="font-medium">{fmt(invoice.roomCharge)}</span>
          </div>
          {invoice.extraCharges?.map((ex, i) => (
            <div key={i} className="flex justify-between text-gray-500">
              <span>{ex.description}</span>
              <span>{fmt(ex.amount)}</span>
            </div>
          ))}
          {invoice.taxAmount > 0 && (
            <div className="flex justify-between text-gray-500">
              <span>Tax ({invoice.taxPercentage}%)</span>
              <span>{fmt(invoice.taxAmount)}</span>
            </div>
          )}
          <div className="border-t border-gray-200 pt-2 flex justify-between font-semibold text-[#0B1F2A]">
            <span>Total</span>
            <span>{fmt(invoice.totalAmount)}</span>
          </div>
          <div className="flex justify-between pt-1">
            <span className="text-gray-500">Payment</span>
            <span
              className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                invoice.paymentStatus === "paid"
                  ? "bg-green-100 text-green-700"
                  : "bg-orange-100 text-orange-700"
              }`}
            >
              {invoice.paymentStatus === "paid" ? "Paid" : "Pending"}
            </span>
          </div>
          {invoice.paymentDetails && invoice.paymentStatus === "paid" && (
            <p className="text-xs text-gray-500 text-right">
              via <span className="font-medium">{fmtMethod(invoice.paymentDetails.method)}</span>
              {invoice.paymentDetails.paidAt && (
                <> · {fmtDate(invoice.paymentDetails.paidAt)}</>
              )}
            </p>
          )}
        </div>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 border border-gray-200 text-sm py-2 rounded-lg hover:bg-gray-50"
          >
            Close
          </button>
          <button
            onClick={handlePdf}
            disabled={pdfLoading}
            className="flex-1 bg-[#0B1F2A] text-white text-sm py-2 rounded-lg hover:opacity-90 disabled:opacity-60"
          >
            {pdfLoading ? "Downloading…" : "Download PDF"}
          </button>
        </div>
      </div>
    </div>
  );
}
