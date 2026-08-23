import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchBookings,
  checkInBooking,
  checkOutBooking,
  cancelBooking,
  fetchBookingById,
  clearSingleBooking,
  payBooking,
} from "../../../redux/slice/Booking/bookingSlice";
import AdminLayout from "../../../components/admin/AdminLayout";
import { fmt, fmtMethod, downloadInvoicePdf } from "../../../components/admin/invoices/invoiceHelpers";
import { fetchPaymentByBooking, clearBookingPayment } from "../../../redux/slice/payments/paymentsSlice";
import { deleteBooking, clearDeleteError } from "../../../redux/slice/Booking/completeBooking/deleteBookingSlice";

// Status badge styles
const STATUS_STYLES = {
  "booked":      "bg-blue-100 text-blue-700",
  "checked-in":  "bg-green-100 text-green-700",
  "checked-out": "bg-gray-100 text-gray-600",
  "cancelled":   "bg-red-100 text-red-600",
};

const STATUS_FILTERS = ["all", "booked", "checked-in", "checked-out", "cancelled"];

// Format date string to readable format
const fmtDate = (dateStr) => {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short", day: "numeric", year: "numeric",
  });
};

export default function AdminBookings() {
  const dispatch = useDispatch();
  const {
    bookings, loading, error,
    singleBooking, singleLoading,
    checkInLoading, checkInError,
    checkOutLoading, checkOutError,
    cancelLoading, cancelError,
    payLoading, payError,
  } = useSelector((state) => state.bookings);

  const { bookingPayment, bookingPaymentLoading } = useSelector((state) => state.payments);
  const { loading: deleteLoading, error: deleteError } = useSelector((state) => state.deleteBooking);

  const [search,          setSearch]          = useState("");
  const [statusFilter,    setStatusFilter]    = useState("all");
  const [detailModal,     setDetailModal]     = useState(false);
  const [confirmId,       setConfirmId]       = useState(null);
  const [confirmStatus,   setConfirmStatus]   = useState(null);
  // Collect payment modal
  const [payModal,        setPayModal]        = useState({ open: false, bookingId: null });
  const [payMethod,       setPayMethod]       = useState("cash");
  // Checkout modal (extra charges)
  const [coModal,         setCoModal]         = useState({ open: false, booking: null });
  const [coExtras,        setCoExtras]        = useState([{ description: "", amount: "" }]);
  const [invoiceConfirm,  setInvoiceConfirm]  = useState({ open: false, invoice: null, booking: null });
  const [pdfLoading,      setPdfLoading]      = useState(false);
  const [deleteConfirm,   setDeleteConfirm]   = useState(false);

  useEffect(() => {
    dispatch(fetchBookings());
  }, [dispatch]);

  // ── Client-side filtering ───────────────────────────────────────────────────
  const filtered = bookings.filter((b) => {
    const guestName  = b.guest?.name?.toLowerCase()  || "";
    const guestEmail = b.guest?.email?.toLowerCase() || "";
    const roomNum    = b.room?.roomNumber?.toLowerCase()  || "";
    const matchSearch = !search ||
      guestName.includes(search.toLowerCase()) ||
      guestEmail.includes(search.toLowerCase()) ||
      roomNum.includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || b.status === statusFilter;
    return matchSearch && matchStatus;
  });

  // ── Action handlers ─────────────────────────────────────────────────────────
  const handleCheckIn  = (id) => dispatch(checkInBooking(id));

  const openCheckOutModal = (booking) => {
    setCoModal({ open: true, booking });
    setCoExtras([{ description: "", amount: "" }]);
  };
  const closeCheckOutModal = () => setCoModal({ open: false, booking: null });

  const addCoExtra    = () => setCoExtras(p => [...p, { description: "", amount: "" }]);
  const removeCoExtra = (i) => setCoExtras(p => p.filter((_, idx) => idx !== i));
  const updateCoExtra = (i, field, val) =>
    setCoExtras(p => p.map((e, idx) => idx === i ? { ...e, [field]: val } : e));

  const handleCheckOutSubmit = async () => {
    const validExtras = coExtras
      .filter(ex => ex.description.trim() && ex.amount !== "")
      .map(ex => ({ description: ex.description.trim(), amount: Number(ex.amount) }));
    try {
      const result = await dispatch(checkOutBooking({
        id: coModal.booking._id,
        extraCharges: validExtras,
      })).unwrap();
      const savedBooking = coModal.booking;
      closeCheckOutModal();
      setInvoiceConfirm({ open: true, invoice: result.invoice, booking: savedBooking });
    } catch (_) {
      // error shown via checkOutError banner in modal
    }
  };

  const handlePdfDownload = async (invoiceId) => {
    setPdfLoading(true);
    try { await downloadInvoicePdf(invoiceId); } catch (e) { console.error(e); }
    finally { setPdfLoading(false); }
  };
  const handleCancel = () => {
    if (!confirmId) return;
    dispatch(cancelBooking(confirmId)).then((res) => {
      if (!res.error) { setConfirmId(null); setConfirmStatus(null); }
    });
  };

  const openCancel = (id, status) => {
    setConfirmId(id);
    setConfirmStatus(status);
  };

  const openDetail = (id) => {
    dispatch(fetchBookingById(id));
    dispatch(fetchPaymentByBooking(id));
    setDetailModal(true);
  };
  const closeDetail = () => {
    setDetailModal(false);
    setDeleteConfirm(false);
    dispatch(clearSingleBooking());
    dispatch(clearBookingPayment());
    dispatch(clearDeleteError());
  };

  const handleDeleteBooking = async () => {
    if (!singleBooking) return;
    const result = await dispatch(deleteBooking(singleBooking._id));
    if (!result.error) {
      closeDetail();
      dispatch(fetchBookings());
    }
  };

  const handleCollectPay = () => {
    if (!payModal.bookingId) return;
    dispatch(payBooking({ bookingId: payModal.bookingId, paymentMethod: payMethod })).then((res) => {
      if (!res.error) setPayModal({ open: false, bookingId: null });
    });
  };

  const anyActionError = checkInError || checkOutError || cancelError || payError;

  return (
    <AdminLayout>

      {/* ── Top bar ────────────────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        {/* Search */}
        <div className="relative flex-1 min-w-[180px] max-w-xs">
          <span className="absolute left-3 top-2.5 text-gray-400 text-sm">🔍</span>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Guest name, email or room…"
            className="w-full pl-8 pr-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:border-[#C9A24B]"
          />
        </div>

        {/* Status filter */}
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="text-sm border border-gray-300 rounded-md px-3 py-2 bg-white focus:outline-none focus:border-[#C9A24B]"
        >
          {STATUS_FILTERS.map((s) => (
            <option key={s} value={s}>
              {s === "all" ? "All Statuses" : s.charAt(0).toUpperCase() + s.slice(1)}
            </option>
          ))}
        </select>

        <span className="text-sm text-gray-400 whitespace-nowrap">
          {filtered.length} booking{filtered.length !== 1 ? "s" : ""}
        </span>
      </div>

      {/* ── Error banners ───────────────────────────────────────────────────── */}
      {anyActionError && (
        <div className="mb-4 px-4 py-2.5 bg-red-50 border border-red-200 rounded-md text-sm text-red-600">
          {anyActionError}
        </div>
      )}

      {/* ── Loading ─────────────────────────────────────────────────────────── */}
      {loading && (
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 border-4 border-[#C9A24B] border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {/* ── Fetch error ─────────────────────────────────────────────────────── */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-md">
          {error}
        </div>
      )}

      {/* ── Table ───────────────────────────────────────────────────────────── */}
      {!loading && !error && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 text-left">
                {["#", "Guest", "Room", "Check-In", "Check-Out", "Nights", "Total", "Status", "Payment", "Actions"].map((h) => (
                  <th key={h} className="px-4 py-3 text-xs uppercase tracking-wide text-gray-400 font-medium whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={10} className="text-center py-12 text-gray-400">
                    No bookings found.
                  </td>
                </tr>
              ) : (
                filtered.map((booking, idx) => (
                  <tr key={booking._id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">

                    <td className="px-4 py-3 text-gray-400">{idx + 1}</td>

                    {/* Guest */}
                    <td className="px-4 py-3">
                      <p className="font-medium text-[#0B1F2A]">{booking.guest?.name || "—"}</p>
                      <p className="text-xs text-gray-400">{booking.guest?.email || ""}</p>
                    </td>

                    {/* Room */}
                    <td className="px-4 py-3">
                      <p className="font-medium text-[#0B1F2A]">{booking.room?.roomNumber || "—"}</p>
                      <p className="text-xs capitalize text-gray-400">{booking.room?.type || ""}</p>
                    </td>

                    {/* Dates */}
                    <td className="px-4 py-3 whitespace-nowrap text-gray-600">{fmtDate(booking.checkInDate)}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-gray-600">{fmtDate(booking.checkOutDate)}</td>

                    {/* Nights */}
                    <td className="px-4 py-3 text-gray-500">{booking.nights}</td>

                    {/* Total */}
                    <td className="px-4 py-3 font-medium text-[#0B1F2A]">
                      ${booking.totalAmount?.toLocaleString() || "—"}
                    </td>

                    {/* Status badge */}
                    <td className="px-4 py-3">
                      <span className={`text-xs font-medium px-2.5 py-1 rounded-full capitalize ${STATUS_STYLES[booking.status] || "bg-gray-100 text-gray-500"}`}>
                        {booking.status}
                      </span>
                    </td>

                    {/* Payment status */}
                    <td className="px-4 py-3">
                      <div className="flex flex-col gap-1">
                        <span className={`text-xs font-medium px-2.5 py-1 rounded-full w-fit ${
                          booking.paymentStatus === "paid"
                            ? "bg-green-100 text-green-700"
                            : "bg-yellow-100 text-yellow-700"
                        }`}>
                          {booking.paymentStatus === "paid" ? "Paid" : "Due"}
                        </span>
                        {booking.paymentTiming && (
                          <span className="text-xs text-gray-400 capitalize">
                            @ {booking.paymentTiming === "now" ? "booking" : booking.paymentTiming}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2 flex-wrap">

                        {/* View detail */}
                        <button
                          onClick={() => openDetail(booking._id)}
                          className="text-xs px-2.5 py-1.5 rounded-md border border-gray-300 text-gray-500 hover:bg-gray-50"
                        >
                          View
                        </button>

                        {/* Collect Payment — shown when unpaid and booking is active */}
                        {booking.paymentStatus === "pending" && booking.status !== "cancelled" && booking.status !== "checked-out" && (
                          <button
                            onClick={() => { setPayModal({ open: true, bookingId: booking._id }); setPayMethod("cash"); }}
                            className="text-xs px-2.5 py-1.5 rounded-md bg-amber-500 text-white hover:bg-amber-600"
                          >
                            Collect Payment
                          </button>
                        )}

                        {/* Check In — only when booked */}
                        {booking.status === "booked" && (
                          <button
                            onClick={() => handleCheckIn(booking._id)}
                            disabled={checkInLoading}
                            className="text-xs px-2.5 py-1.5 rounded-md bg-green-600 text-white hover:bg-green-700 disabled:opacity-60"
                          >
                            Check In
                          </button>
                        )}

                        {/* Check Out — opens extra-charges modal */}
                        {booking.status === "checked-in" && (
                          <button
                            onClick={() => openCheckOutModal(booking)}
                            className="text-xs px-2.5 py-1.5 rounded-md bg-blue-600 text-white hover:bg-blue-700"
                          >
                            Check Out
                          </button>
                        )}

                        {/* Cancel — only before check-in */}
                        {booking.status === "booked" && (
                          <button
                            onClick={() => openCancel(booking._id, booking.status)}
                            className="text-xs px-2.5 py-1.5 rounded-md border border-red-300 text-red-500 hover:bg-red-50"
                          >
                            Cancel
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* ── Cancel confirmation dialog ────────────────────────────────────── */}
      {confirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => { setConfirmId(null); setConfirmStatus(null); }}
          />
          <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-sm z-10 p-6">
            {confirmStatus === "checked-in" ? (
              <>
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-2xl">⚠️</span>
                  <h3 className="text-lg font-serif text-red-700">Cancel Active Stay?</h3>
                </div>
                <p className="text-sm text-gray-600 mb-2">
                  This guest is <strong>currently checked in</strong>. Cancelling will:
                </p>
                <ul className="text-sm text-gray-500 list-disc list-inside mb-6 space-y-1">
                  <li>Immediately cancel the booking record</li>
                  <li>Mark the room as <strong>cleaning</strong> so it can be re-used</li>
                </ul>
              </>
            ) : (
              <>
                <h3 className="text-lg font-serif text-[#0B1F2A] mb-2">Cancel Booking?</h3>
                <p className="text-sm text-gray-500 mb-6">
                  This will cancel the upcoming reservation. The guest will need to rebook if they change their mind.
                </p>
              </>
            )}
            <div className="flex justify-end gap-3">
              <button
                onClick={() => { setConfirmId(null); setConfirmStatus(null); }}
                className="border border-gray-300 text-sm px-4 py-2 rounded-md hover:bg-gray-50"
              >
                Keep It
              </button>
              <button
                onClick={handleCancel}
                disabled={cancelLoading}
                className="bg-red-600 text-white text-sm px-4 py-2 rounded-md hover:bg-red-700 disabled:opacity-60"
              >
                {cancelLoading ? "Cancelling…" : "Yes, Cancel"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Booking detail modal ──────────────────────────────────────────── */}
      {detailModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={closeDetail} />
          <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-lg z-10 overflow-hidden">

            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="text-lg font-serif text-[#0B1F2A]">Booking Details</h2>
              <button onClick={closeDetail} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">×</button>
            </div>

            {/* Body */}
            <div className="px-6 py-5">
              {singleLoading ? (
                <div className="flex justify-center py-10">
                  <div className="w-8 h-8 border-4 border-[#C9A24B] border-t-transparent rounded-full animate-spin" />
                </div>
              ) : singleBooking ? (
                <div className="space-y-4 text-sm">
                  {/* Status */}
                  <div className="flex items-center gap-2">
                    <span className={`text-xs font-medium px-3 py-1 rounded-full capitalize ${STATUS_STYLES[singleBooking.status] || ""}`}>
                      {singleBooking.status}
                    </span>
                    <span className="text-gray-400 text-xs">Booking ID: {singleBooking._id}</span>
                  </div>

                  <div className="grid grid-cols-2 gap-4 pt-2">
                    <div>
                      <p className="text-xs uppercase tracking-wide text-gray-400 mb-1">Guest Name</p>
                      <p className="font-medium text-[#0B1F2A]">{singleBooking.guest?.name || "—"}</p>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-wide text-gray-400 mb-1">Email</p>
                      <p className="font-medium text-[#0B1F2A]">{singleBooking.guest?.email || "—"}</p>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-wide text-gray-400 mb-1">Room</p>
                      <p className="font-medium text-[#0B1F2A]">
                        Room {singleBooking.room?.roomNumber} <span className="capitalize text-gray-500">({singleBooking.room?.type})</span>
                      </p>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-wide text-gray-400 mb-1">Price / Night</p>
                      <p className="font-medium text-[#0B1F2A]">${singleBooking.room?.price}</p>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-wide text-gray-400 mb-1">Check-In</p>
                      <p className="font-medium text-[#0B1F2A]">{fmtDate(singleBooking.checkInDate)}</p>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-wide text-gray-400 mb-1">Check-Out</p>
                      <p className="font-medium text-[#0B1F2A]">{fmtDate(singleBooking.checkOutDate)}</p>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-wide text-gray-400 mb-1">Nights</p>
                      <p className="font-medium text-[#0B1F2A]">{singleBooking.nights}</p>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-wide text-gray-400 mb-1">Total Amount</p>
                      <p className="font-semibold text-[#C9A24B] text-base">${singleBooking.totalAmount?.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-wide text-gray-400 mb-1">Booked On</p>
                      <p className="font-medium text-[#0B1F2A]">{fmtDate(singleBooking.createdAt)}</p>
                    </div>
                  </div>

                  {/* Payment info */}
                  <div className="pt-3 border-t border-gray-100">
                    <p className="text-xs uppercase tracking-wide text-gray-400 mb-2">Payment</p>
                    {bookingPaymentLoading ? (
                      <p className="text-xs text-gray-400">Loading…</p>
                    ) : bookingPayment ? (
                      <div className="flex flex-col gap-1">
                        <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-green-100 text-green-700 w-fit">
                          Paid
                        </span>
                        <p className="text-xs text-gray-500">
                          via {fmtMethod(bookingPayment.method)}
                          {bookingPayment.paidAt && ` · ${fmtDate(bookingPayment.paidAt)}`}
                        </p>
                      </div>
                    ) : (
                      <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-yellow-100 text-yellow-700 w-fit">
                        Not yet paid
                      </span>
                    )}
                  </div>
                </div>
              ) : (
                <p className="text-center text-gray-400 py-8">Could not load booking details.</p>
              )}
            </div>

            {/* Delete footer — only for completed bookings */}
            {singleBooking && (singleBooking.status === "checked-out" || singleBooking.status === "cancelled") && (
              <div className="px-6 py-4 border-t border-gray-100">
                {deleteError && (
                  <p className="text-xs text-red-500 mb-2 text-center">{deleteError}</p>
                )}
                {!deleteConfirm ? (
                  <button
                    onClick={() => setDeleteConfirm(true)}
                    className="w-full py-2 rounded-lg border border-red-200 text-red-600 text-sm font-medium hover:bg-red-50 transition-colors"
                  >
                    Delete Booking
                  </button>
                ) : (
                  <div className="flex flex-col gap-2">
                    <p className="text-xs text-gray-500 text-center">
                      This will permanently delete the booking record. This action cannot be undone.
                    </p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setDeleteConfirm(false)}
                        className="flex-1 py-2 rounded-lg border border-gray-200 text-gray-600 text-sm hover:bg-gray-50 transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleDeleteBooking}
                        disabled={deleteLoading}
                        className="flex-1 py-2 rounded-lg bg-red-600 text-white text-sm font-medium hover:bg-red-700 disabled:opacity-60 transition-colors"
                      >
                        {deleteLoading ? "Deleting…" : "Yes, Delete"}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Checkout + extra charges modal ───────────────────────────────── */}
      {coModal.open && coModal.booking && (() => {
        const b = coModal.booking;
        const extraSum = coExtras.reduce((s, e) => s + (Number(e.amount) || 0), 0);
        const grandTotal = (b.totalAmount || 0) + extraSum;
        const paymentBlocked = b.paymentTiming === "checkout" && b.paymentStatus !== "paid";
        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={closeCheckOutModal} />
            <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-lg z-10 max-h-[92vh] flex flex-col">
              {/* Header */}
              <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-serif text-[#0B1F2A]">Complete Check-Out</h3>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {b.guest?.name} · Room {b.room?.roomNumber}
                  </p>
                </div>
                <button onClick={closeCheckOutModal} className="text-gray-400 hover:text-gray-600 text-xl">✕</button>
              </div>

              <div className="overflow-y-auto px-6 py-5 space-y-5 flex-1">
                {/* Payment warning */}
                {paymentBlocked && (
                  <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    Payment is required before checkout. Use <strong>Collect Payment</strong> first, then check out.
                  </div>
                )}

                {/* Error banner */}
                {checkOutError && (
                  <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                    {checkOutError}
                  </div>
                )}

                {/* Room charge row */}
                <div className="bg-gray-50 rounded-lg px-4 py-3 flex justify-between text-sm">
                  <span className="text-gray-500">Room Charge ({b.nights} night{b.nights !== 1 ? "s" : ""})</span>
                  <span className="font-semibold text-[#0B1F2A]">{fmt(b.totalAmount)}</span>
                </div>

                {/* Extra charges form */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-medium text-gray-700">Extra Charges</p>
                    <button
                      type="button"
                      onClick={addCoExtra}
                      className="text-xs text-[#C9A24B] hover:underline"
                    >
                      + Add row
                    </button>
                  </div>
                  <div className="space-y-2">
                    {coExtras.map((ex, i) => (
                      <div key={i} className="flex gap-2 items-center">
                        <input
                          type="text"
                          value={ex.description}
                          onChange={e => updateCoExtra(i, "description", e.target.value)}
                          placeholder="e.g. Mini Bar, Laundry"
                          className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#C9A24B]/40"
                        />
                        <input
                          type="number"
                          min="0"
                          value={ex.amount}
                          onChange={e => updateCoExtra(i, "amount", e.target.value)}
                          placeholder="$"
                          className="w-24 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#C9A24B]/40"
                        />
                        {coExtras.length > 1 && (
                          <button onClick={() => removeCoExtra(i)} className="text-red-400 hover:text-red-600 text-lg leading-none">×</button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Grand total preview */}
                <div className="flex items-center justify-between border-t border-gray-100 pt-3">
                  <span className="text-sm font-medium text-gray-600">Grand Total</span>
                  <span className="text-xl font-semibold text-[#C9A24B]">{fmt(grandTotal)}</span>
                </div>
              </div>

              {/* Footer */}
              <div className="px-6 py-4 border-t border-gray-100 flex gap-3">
                <button
                  onClick={closeCheckOutModal}
                  className="flex-1 border border-gray-200 text-sm px-4 py-2 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCheckOutSubmit}
                  disabled={checkOutLoading || paymentBlocked}
                  className="flex-1 bg-blue-600 text-white text-sm px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-60"
                >
                  {checkOutLoading ? "Processing…" : "Complete Check-Out"}
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* ── Invoice confirmation modal ─────────────────────────────────────── */}
      {invoiceConfirm.open && invoiceConfirm.invoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setInvoiceConfirm({ open: false, invoice: null, booking: null })} />
          <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-sm z-10 p-6">
            <div className="text-center mb-5">
              <div className="text-4xl mb-2">✅</div>
              <h3 className="text-lg font-serif text-[#0B1F2A]">Check-Out Complete</h3>
              <p className="text-xs text-gray-400 mt-1">Invoice #{invoiceConfirm.invoice._id?.slice(-6).toUpperCase()}</p>
            </div>

            <div className="bg-gray-50 rounded-lg p-4 space-y-2 text-sm mb-5">
              <div className="flex justify-between">
                <span className="text-gray-500">Room Charge</span>
                <span className="font-medium">{fmt(invoiceConfirm.invoice.roomCharge)}</span>
              </div>
              {invoiceConfirm.invoice.extraCharges?.map((ex, i) => (
                <div key={i} className="flex justify-between text-gray-500">
                  <span>{ex.description}</span>
                  <span>{fmt(ex.amount)}</span>
                </div>
              ))}
              <div className="border-t border-gray-200 pt-2 flex justify-between font-semibold text-[#0B1F2A]">
                <span>Total</span>
                <span>{fmt(invoiceConfirm.invoice.totalAmount)}</span>
              </div>
              <div className="flex justify-between pt-1">
                <span className="text-gray-500">Payment</span>
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                  invoiceConfirm.invoice.paymentStatus === "paid"
                    ? "bg-green-100 text-green-700"
                    : "bg-orange-100 text-orange-700"
                }`}>
                  {invoiceConfirm.invoice.paymentStatus === "paid" ? "Paid" : "Pending"}
                </span>
              </div>
              {invoiceConfirm.invoice.paymentDetails && invoiceConfirm.invoice.paymentStatus === "paid" && (
                <p className="text-xs text-gray-500 text-right">
                  via <span className="font-medium">{fmtMethod(invoiceConfirm.invoice.paymentDetails.method)}</span>
                  {invoiceConfirm.invoice.paymentDetails.paidAt && (
                    <> · {fmtDate(invoiceConfirm.invoice.paymentDetails.paidAt)}</>
                  )}
                </p>
              )}
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setInvoiceConfirm({ open: false, invoice: null, booking: null })}
                className="flex-1 border border-gray-200 text-sm py-2 rounded-lg hover:bg-gray-50"
              >
                Close
              </button>
              <button
                onClick={() => handlePdfDownload(invoiceConfirm.invoice._id)}
                disabled={pdfLoading}
                className="flex-1 bg-[#0B1F2A] text-white text-sm py-2 rounded-lg hover:opacity-90 disabled:opacity-60"
              >
                {pdfLoading ? "Downloading…" : "Download PDF"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Collect Payment modal ─────────────────────────────────────────── */}
      {payModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setPayModal({ open: false, bookingId: null })}
          />
          <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-sm z-10 p-6">
            <h3 className="text-lg font-serif text-[#0B1F2A] mb-1">Collect Payment</h3>
            <p className="text-sm text-gray-400 mb-5">Select payment method received from the guest.</p>

            {payError && (
              <p className="mb-4 text-sm text-red-600 bg-red-50 px-3 py-2 rounded">{payError}</p>
            )}

            <div className="space-y-2 mb-6">
              {[
                { value: "cash",          label: "Cash" },
                { value: "credit_card",   label: "Credit Card" },
                { value: "debit_card",    label: "Debit Card" },
                { value: "easypaisa",     label: "EasyPaisa" },
                { value: "jazzcash",      label: "JazzCash" },
                { value: "bank_transfer", label: "Bank Transfer" },
              ].map((m) => (
                <label
                  key={m.value}
                  className={`flex items-center gap-3 px-4 py-2.5 rounded-lg border-2 cursor-pointer transition ${
                    payMethod === m.value
                      ? "border-[#C9A24B] bg-[#C9A24B]/5"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <input
                    type="radio"
                    name="payMethod"
                    value={m.value}
                    checked={payMethod === m.value}
                    onChange={(e) => setPayMethod(e.target.value)}
                    className="accent-[#C9A24B]"
                  />
                  <span className="text-sm text-[#0B1F2A] font-medium">{m.label}</span>
                </label>
              ))}
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setPayModal({ open: false, bookingId: null })}
                className="flex-1 border border-gray-300 text-sm px-4 py-2 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleCollectPay}
                disabled={payLoading}
                className="flex-1 bg-[#0B1F2A] text-white text-sm px-4 py-2 rounded-md hover:opacity-90 disabled:opacity-60"
              >
                {payLoading ? "Recording…" : "Confirm Payment"}
              </button>
            </div>
          </div>
        </div>
      )}

    </AdminLayout>
  );
}
