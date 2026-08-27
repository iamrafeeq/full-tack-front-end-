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
      {genOpen && (() => {
        const eligible = bookings.filter(
          (b) => b.status === "checked-out" || b.status === "checked-in"
        );
        const selected = eligible.find((b) => b._id === bookingId) || null;
        const roomCharge = selected?.totalAmount ?? 0;
        const grandTotal = roomCharge + extrasTotal;

        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg flex flex-col max-h-[92vh]">

              {/* ── Header ── */}
              <div className="bg-[#0B1F2A] rounded-t-2xl px-6 py-5 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-[#C9A24B]/20 border border-[#C9A24B]/30 flex items-center justify-center text-lg">
                    🧾
                  </div>
                  <div>
                    <h3 className="text-white font-serif text-lg leading-tight">Generate Invoice</h3>
                    <p className="text-[#C9A24B]/70 text-xs mt-0.5">Create a billing record for a stay</p>
                  </div>
                </div>
                <button
                  onClick={() => setGenOpen(false)}
                  className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white/70 hover:text-white flex items-center justify-center transition-colors text-sm"
                >
                  ✕
                </button>
              </div>

              {/* ── Body ── */}
              <div className="overflow-y-auto flex-1 px-6 py-5 space-y-5">

                {/* Booking selector */}
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-widest text-gray-400 mb-2">
                    Select Booking
                  </label>
                  <select
                    value={bookingId}
                    onChange={(e) => setBookingId(e.target.value)}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#C9A24B]/40 bg-white text-[#0B1F2A] appearance-none"
                  >
                    <option value="">— Choose a booking —</option>
                    {eligible.map((b) => (
                      <option key={b._id} value={b._id}>
                        {b.guest?.name || "Guest"} · Room {b.room?.roomNumber || "?"} · {fmtDate(b.checkInDate)} → {fmtDate(b.checkOutDate)}
                      </option>
                    ))}
                  </select>
                  {eligible.length === 0 && (
                    <p className="mt-2 text-xs text-amber-600 bg-amber-50 border border-amber-100 rounded-lg px-3 py-2">
                      No checked-in / checked-out bookings without an invoice.
                    </p>
                  )}
                </div>

                {/* Selected booking card */}
                {selected && (
                  <div className="rounded-xl border border-[#C9A24B]/25 bg-[#FBF8F2] overflow-hidden">
                    <div className="px-4 py-2 bg-[#C9A24B]/10 border-b border-[#C9A24B]/20 flex items-center gap-1.5">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-[#C9A24B]">Booking Summary</span>
                    </div>
                    <div className="px-4 py-3 grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
                      <div>
                        <p className="text-[10px] uppercase tracking-wide text-gray-400 mb-0.5">Guest</p>
                        <p className="font-medium text-[#0B1F2A]">{selected.guest?.name || "—"}</p>
                        <p className="text-xs text-gray-400">{selected.guest?.email || ""}</p>
                      </div>
                      <div>
                        <p className="text-[10px] uppercase tracking-wide text-gray-400 mb-0.5">Room</p>
                        <p className="font-medium text-[#0B1F2A]">Room {selected.room?.roomNumber || "—"}</p>
                        <p className="text-xs text-gray-400 capitalize">{selected.room?.type || ""}</p>
                      </div>
                      <div>
                        <p className="text-[10px] uppercase tracking-wide text-gray-400 mb-0.5">Stay</p>
                        <p className="font-medium text-[#0B1F2A]">{fmtDate(selected.checkInDate)} → {fmtDate(selected.checkOutDate)}</p>
                        <p className="text-xs text-gray-400">{selected.nights} night{selected.nights !== 1 ? "s" : ""}</p>
                      </div>
                      <div>
                        <p className="text-[10px] uppercase tracking-wide text-gray-400 mb-0.5">Room Charge</p>
                        <p className="font-semibold text-[#0B1F2A]">{money(selected.totalAmount)}</p>
                        <p className="text-xs text-gray-400">base amount</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Extra charges */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-[11px] font-bold uppercase tracking-widest text-gray-400">
                      Extra Charges
                      <span className="ml-1.5 font-normal normal-case text-gray-300">(optional)</span>
                    </label>
                    <button
                      onClick={() => setExtras((rows) => [...rows, { description: "", amount: "" }])}
                      className="text-xs font-medium text-[#C9A24B] hover:text-[#0B1F2A] transition-colors flex items-center gap-1"
                    >
                      + Add line
                    </button>
                  </div>

                  {extras.length > 0 ? (
                    <div className="rounded-xl border border-gray-100 overflow-hidden divide-y divide-gray-50">
                      {extras.map((row, i) => (
                        <div key={i} className="flex items-center gap-2 px-3 py-2 bg-white hover:bg-gray-50/60 transition-colors">
                          <input
                            type="text"
                            value={row.description}
                            onChange={(e) =>
                              setExtras((rows) => rows.map((r, j) => (j === i ? { ...r, description: e.target.value } : r)))
                            }
                            placeholder="e.g. Room Service, Minibar, Laundry"
                            className="flex-1 text-sm bg-transparent focus:outline-none placeholder-gray-300 text-[#0B1F2A] min-w-0"
                          />
                          <div className="flex items-center gap-1 shrink-0">
                            <span className="text-gray-300 text-sm">$</span>
                            <input
                              type="number"
                              min="0"
                              value={row.amount}
                              onChange={(e) =>
                                setExtras((rows) => rows.map((r, j) => (j === i ? { ...r, amount: e.target.value } : r)))
                              }
                              placeholder="0"
                              className="w-20 text-sm bg-transparent focus:outline-none text-right text-[#0B1F2A] placeholder-gray-300 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                            />
                          </div>
                          <button
                            onClick={() => setExtras((rows) => rows.filter((_, j) => j !== i))}
                            className="w-6 h-6 rounded-full text-gray-300 hover:text-red-400 hover:bg-red-50 flex items-center justify-center transition-colors text-xs shrink-0"
                            aria-label="Remove"
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="rounded-xl border border-dashed border-gray-200 px-4 py-4 text-center">
                      <p className="text-sm text-gray-300">No extra charges added</p>
                    </div>
                  )}
                </div>

                {/* Invoice total preview */}
                {selected && (
                  <div className="rounded-xl bg-[#0B1F2A] overflow-hidden">
                    <div className="px-4 py-3 space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-white/50">Room charge</span>
                        <span className="text-white/80">{money(roomCharge)}</span>
                      </div>
                      {extrasTotal > 0 && (
                        <div className="flex justify-between text-sm">
                          <span className="text-white/50">Extra charges</span>
                          <span className="text-white/80">{money(extrasTotal)}</span>
                        </div>
                      )}
                      <div className="border-t border-white/10 pt-2 flex justify-between items-baseline">
                        <span className="text-[11px] font-bold uppercase tracking-widest text-[#C9A24B]">Total</span>
                        <span className="text-2xl font-serif text-white">{money(grandTotal)}</span>
                      </div>
                    </div>
                    <div className="h-1 bg-[#C9A24B]/30">
                      <div className="h-full bg-[#C9A24B] transition-all duration-500" style={{ width: extrasTotal > 0 ? `${Math.min((extrasTotal / grandTotal) * 100, 100)}%` : "0%" }} />
                    </div>
                  </div>
                )}
              </div>

              {/* ── Footer ── */}
              <div className="px-6 py-4 border-t border-gray-100 flex gap-3 justify-end shrink-0 bg-gray-50/50 rounded-b-2xl">
                <button
                  onClick={() => setGenOpen(false)}
                  className={btn.secondary}
                >
                  Cancel
                </button>
                <button
                  onClick={submitGenerate}
                  disabled={!bookingId || generateLoading}
                  className="inline-flex items-center gap-1.5 justify-center px-5 py-2 rounded-lg bg-[#C9A24B] text-[#0B1F2A] text-sm font-semibold hover:bg-[#b8913e] disabled:opacity-50 transition-colors"
                >
                  {generateLoading
                    ? <><Spinner size="sm" color="#0B1F2A" /> Generating…</>
                    : <>✓ Generate Invoice</>}
                </button>
              </div>
            </div>
          </div>
        );
      })()}
    </AdminLayout>
  );
}
