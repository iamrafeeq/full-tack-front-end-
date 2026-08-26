import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchInvoices,
  generateInvoice,
  markInvoicePaid,
  clearInvoiceError,
} from "../../../redux/slice/invoice/invoiceSlice";
import { fetchBookings } from "../../../redux/slice/Booking/bookingSlice";
import AdminLayout from "../../../components/admin/AdminLayout";
import {
  StatCard, TableCard, Th, Badge, Pills, EmptyState, Modal,
  btn, input, label, money, fmtDate,
} from "../../../components/admin/AdminUI";
import Spinner from "../../../components/Spinner";
import SkeletonRow from "../../../components/SkeletonRow";
import { notifySuccess, notifyError } from "../../../utils/toast";

const TABS = [
  { value: "all",     label: "All" },
  { value: "paid",    label: "Paid" },
  { value: "pending", label: "Pending" },
];

export default function Invoices() {
  const dispatch = useDispatch();
  const { invoices, loading, error, generateLoading, generateError, markPaidLoading, markPaidError } =
    useSelector((s) => s.invoices);
  const { bookings } = useSelector((s) => s.bookings);

  const [tab,       setTab]       = useState("all");
  const [detail,    setDetail]    = useState(null);
  const [genOpen,   setGenOpen]   = useState(false);
  const [bookingId, setBookingId] = useState("");
  const [extras,    setExtras]    = useState([{ description: "", amount: "" }]);

  useEffect(() => { dispatch(fetchInvoices()); }, [dispatch]);
  useEffect(() => { if (error) notifyError(error); }, [error]);
  useEffect(() => { if (markPaidError) notifyError(markPaidError); }, [markPaidError]);
  useEffect(() => { if (generateError) notifyError(generateError); }, [generateError]);

  useEffect(() => {
    if (genOpen) {
      dispatch(fetchBookings());
      dispatch(clearInvoiceError());
    }
  }, [genOpen, dispatch]);

  const filtered = useMemo(
    () => invoices.filter((i) => tab === "all" || (i.paymentStatus || "pending") === tab),
    [invoices, tab]
  );

  const totals = useMemo(() => {
    const sum  = (arr) => arr.reduce((t, i) => t + (i.totalAmount ?? i.total ?? 0), 0);
    const paid    = invoices.filter((i) => i.paymentStatus === "paid");
    const pending = invoices.filter((i) => i.paymentStatus !== "paid");
    return {
      all:     { count: invoices.length, amount: sum(invoices) },
      paid:    { count: paid.length,     amount: sum(paid) },
      pending: { count: pending.length,  amount: sum(pending) },
    };
  }, [invoices]);

  const extrasTotal = extras.reduce((t, r) => t + (Number(r.amount) || 0), 0);

  const submitGenerate = () => {
    const cleaned = extras
      .filter((r) => r.description.trim() && Number(r.amount) > 0)
      .map((r) => ({ description: r.description.trim(), amount: Number(r.amount) }));
    dispatch(generateInvoice({ bookingId, extraCharges: cleaned })).then((r) => {
      if (!r.error) {
        notifySuccess("Invoice generated successfully!");
        setGenOpen(false);
        setBookingId("");
        setExtras([{ description: "", amount: "" }]);
      }
    });
  };

  return (
    <AdminLayout>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-6">
        <StatCard
          title="Total Invoices"
          value={totals.all.count}
          sub={`${money(totals.all.amount)} billed`}
          icon="🧾"
          accent="#0B1F2A"
          loading={loading}
        />
        <StatCard
          title="Paid"
          value={totals.paid.count}
          sub={`${money(totals.paid.amount)} collected`}
          icon="✅"
          accent="#15803d"
          loading={loading}
        />
        <StatCard
          title="Outstanding"
          value={totals.pending.count}
          sub={`${money(totals.pending.amount)} pending`}
          icon="⏳"
          accent="#c2410c"
          loading={loading}
        />
      </div>

      <div className="flex flex-wrap items-center gap-3 mb-6">
        <Pills options={TABS} value={tab} onChange={setTab} />
        <button onClick={() => setGenOpen(true)} className={`${btn.primary} ml-auto`}>
          + Generate Invoice
        </button>
      </div>

      <TableCard>
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100 text-left">
                {["Invoice #", "Guest", "Room", "Tax", "Total", "Issued", "Status", "Actions"].map((h) => (
                  <Th key={h}>{h}</Th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading
                ? Array.from({ length: 5 }, (_, i) => <SkeletonRow key={i} cols={8} />)
                : filtered.length === 0 ? (
                <tr>
                  <td colSpan={8}>
                    <EmptyState
                      icon="🧾"
                      title="No invoices here"
                      subtitle="Invoices are created automatically at check-out, or generate one manually."
                      action={
                        <button onClick={() => setGenOpen(true)} className={btn.primary}>
                          Generate Invoice
                        </button>
                      }
                    />
                  </td>
                </tr>
              ) : (
                filtered.map((inv) => (
                  <tr key={inv._id} className="border-b border-gray-50 hover:bg-gray-50/60 transition-colors">
                    <td className="px-4 py-3.5 font-semibold text-[#0B1F2A] whitespace-nowrap">
                      {inv.invoiceNumber || inv._id?.slice(-8).toUpperCase()}
                    </td>
                    <td className="px-4 py-3.5 text-gray-600 whitespace-nowrap">
                      {inv.guest?.name || inv.booking?.guest?.name || "—"}
                    </td>
                    <td className="px-4 py-3.5 text-gray-500 whitespace-nowrap">
                      {inv.booking?.room?.roomNumber ? `Room ${inv.booking.room.roomNumber}` : "—"}
                    </td>
                    <td className="px-4 py-3.5 text-gray-500 whitespace-nowrap">{money(inv.taxAmount)}</td>
                    <td className="px-4 py-3.5 font-semibold text-[#0B1F2A] whitespace-nowrap">
                      {money(inv.totalAmount ?? inv.total)}
                    </td>
                    <td className="px-4 py-3.5 text-xs text-gray-400 whitespace-nowrap">{fmtDate(inv.createdAt)}</td>
                    <td className="px-4 py-3.5">
                      <Badge value={inv.paymentStatus === "paid" ? "paid" : "pending"} />
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-2 justify-end">
                        <button onClick={() => setDetail(inv)} className={btn.secondary}>View</button>
                        {inv.paymentStatus !== "paid" && (
                          <button
                            onClick={() => dispatch(markInvoicePaid(inv._id)).then((r) => { if (!r.error) notifySuccess("Invoice marked as paid."); })}
                            disabled={markPaidLoading}
                            className={`${btn.ghostGold} inline-flex items-center gap-1.5`}
                          >
                            {markPaidLoading ? <><Spinner size="sm" color="#C9A24B" /> Marking…</> : "Mark paid"}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
      </TableCard>

      {/* Invoice detail modal */}
      {detail && (
        <Modal
          title={`Invoice ${detail.invoiceNumber || detail._id?.slice(-8).toUpperCase()}`}
          onClose={() => setDetail(null)}
          footer={
            <>
              <button onClick={() => setDetail(null)} className={btn.secondary}>Close</button>
              <button onClick={() => window.print()} className={btn.gold}>Download PDF</button>
            </>
          }
        >
          <div className="space-y-3">
            <div className="flex justify-between gap-3">
              <span className="text-[13px] text-gray-500">Guest</span>
              <span className="text-sm font-medium text-[#0B1F2A]">
                {detail.guest?.name || detail.booking?.guest?.name || "—"}
              </span>
            </div>
            <div className="flex justify-between gap-3">
              <span className="text-[13px] text-gray-500">Stay</span>
              <span className="text-sm text-[#0B1F2A]">
                {fmtDate(detail.booking?.checkInDate)} → {fmtDate(detail.booking?.checkOutDate)}
              </span>
            </div>
          </div>

          <div className="border-t border-gray-100 pt-4 space-y-2.5">
            <div className="flex justify-between gap-3">
              <span className="text-[13px] text-gray-500">Room charge</span>
              <span className="text-sm text-[#0B1F2A]">{money(detail.roomCharge)}</span>
            </div>
            {(detail.extraCharges || []).map((c, i) => (
              <div key={i} className="flex justify-between gap-3">
                <span className="text-[13px] text-gray-500">{c.description}</span>
                <span className="text-sm text-[#0B1F2A]">{money(c.amount)}</span>
              </div>
            ))}
            <div className="flex justify-between gap-3">
              <span className="text-[13px] text-gray-500">
                Tax{detail.taxPercentage != null ? ` (${detail.taxPercentage}%)` : ""}
              </span>
              <span className="text-sm text-[#0B1F2A]">{money(detail.taxAmount)}</span>
            </div>
          </div>

          <div className="border-t border-gray-100 pt-4 flex items-center justify-between gap-3">
            <span className="text-[13px] text-gray-500">Total</span>
            <span className="font-serif text-2xl text-[#0B1F2A]">
              {money(detail.totalAmount ?? detail.total)}
            </span>
          </div>

          <Badge value={detail.paymentStatus === "paid" ? "paid" : "pending"} />
        </Modal>
      )}

      {/* Generate invoice modal */}
      {genOpen && (
        <Modal
          title="Generate Invoice"
          onClose={() => setGenOpen(false)}
          size="max-w-lg"
          footer={
            <>
              <button onClick={() => setGenOpen(false)} className={btn.secondary}>Cancel</button>
              <button onClick={submitGenerate} disabled={!bookingId || generateLoading} className={`${btn.primary} inline-flex items-center gap-1.5 justify-center`}>
                {generateLoading ? <><Spinner size="sm" color="white" /> Generating…</> : "Generate"}
              </button>
            </>
          }
        >
          <div>
            <label className={label}>Booking</label>
            <select value={bookingId} onChange={(e) => setBookingId(e.target.value)} className={input}>
              <option value="">Select a booking…</option>
              {bookings
                .filter((b) => b.status === "checked-out" || b.status === "checked-in")
                .map((b) => (
                  <option key={b._id} value={b._id}>
                    {b.guest?.name} — Room {b.room?.roomNumber} ({fmtDate(b.checkInDate)} → {fmtDate(b.checkOutDate)})
                  </option>
                ))}
            </select>
          </div>

          <div>
            <label className={label}>Extra charges</label>
            <div className="space-y-2">
              {extras.map((row, i) => (
                <div key={i} className="flex gap-2">
                  <input
                    type="text"
                    value={row.description}
                    onChange={(e) =>
                      setExtras((rows) => rows.map((r, j) => (j === i ? { ...r, description: e.target.value } : r)))
                    }
                    placeholder="Minibar, laundry…"
                    className={`${input} flex-1`}
                  />
                  <input
                    type="number"
                    min="0"
                    value={row.amount}
                    onChange={(e) =>
                      setExtras((rows) => rows.map((r, j) => (j === i ? { ...r, amount: e.target.value } : r)))
                    }
                    placeholder="0"
                    className={`${input} w-28`}
                  />
                  <button
                    onClick={() => setExtras((rows) => rows.filter((_, j) => j !== i))}
                    className={btn.ghostDanger}
                    aria-label="Remove charge"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
            <div className="flex items-center justify-between mt-3">
              <button
                onClick={() => setExtras((rows) => [...rows, { description: "", amount: "" }])}
                className={btn.secondary}
              >
                + Add charge
              </button>
              <span className="text-sm text-gray-500">
                Extras: <span className="font-semibold text-[#0B1F2A]">{money(extrasTotal)}</span>
              </span>
            </div>
            <p className="text-xs text-gray-400 mt-2">
              Tax is applied by the backend using the percentage in Settings.
            </p>
          </div>
        </Modal>
      )}
    </AdminLayout>
  );
}
