import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { useAuth } from "../../context/AuthContext";
import BookingFeedbackSection from "../../components/feedback/BookingFeedbackSection";
import {
  fetchBookings,
  cancelBooking,
  fetchBookingById,
  clearSingleBooking,
} from "../../redux/slice/Booking/bookingSlice";
import { fetchInvoices } from "../../redux/slice/invoice/invoiceSlice";
import { notifySuccess, notifyError } from "../../utils/toast";
import {
  fmt,
  fmtDate as fmtInvDate,
  fmtMethod,
  STATUS_COLORS,
  downloadInvoicePdf,
} from "../../components/admin/invoices/invoiceHelpers";
import SkeletonCard from "../../components/SkeletonCard";

// ── Constants ────────────────────────────────────────────────────────────────

const STATUS_STYLES = {
  booked:        "bg-blue-100 text-blue-700",
  "checked-in":  "bg-green-100 text-green-700",
  "checked-out": "bg-gray-100 text-gray-600",
  cancelled:     "bg-red-100 text-red-600",
};

const STATUS_LABEL = {
  booked:        "Upcoming",
  "checked-in":  "Active Stay",
  "checked-out": "Completed",
  cancelled:     "Cancelled",
};

const fmtDate = (iso) =>
  new Date(iso).toLocaleDateString("en-US", {
    month: "short", day: "numeric", year: "numeric",
  });

// ── Small helper for the receipt rows ────────────────────────────────────────
function ReceiptRow({ label, value }) {
  return (
    <div className="flex items-center justify-between text-sm py-1.5 border-b border-gray-50 last:border-0">
      <span className="text-gray-500">{label}</span>
      <span className="text-[#0B1F2A] font-medium">{value || "—"}</span>
    </div>
  );
}

// ── Page ─────────────────────────────────────────────────────────────────────
export default function MyBookings() {
  const dispatch = useDispatch();
  const { user } = useAuth();

  const {
    bookings, loading, error,
    cancelLoading,
    singleBooking, singleLoading,
  } = useSelector((s) => s.bookings);

  useEffect(() => { if (error) notifyError(error); }, [error]);

  const { invoices, loading: invLoading } = useSelector((s) => s.invoices);

  const [pdfLoading, setPdfLoading] = useState(null);
  const [confirmId,  setConfirmId]  = useState(null);
  const [detailOpen, setDetailOpen] = useState(false);

  useEffect(() => {
    dispatch(fetchBookings());
    dispatch(fetchInvoices());
  }, [dispatch]);

  // ── Split bookings client-side — single fetch ─────────────────────────────
  const active  = bookings.filter((b) => ["booked", "checked-in"].includes(b.status));
  const history = bookings.filter((b) => ["checked-out", "cancelled"].includes(b.status));

  // Invoice lookup: booking._id → invoice object
  const invoiceMap = invoices.reduce((acc, inv) => {
    if (inv.booking?._id) acc[inv.booking._id] = inv;
    return acc;
  }, {});

  // ── Stats strip ───────────────────────────────────────────────────────────
  const stats = [
    { label: "Total Bookings", value: bookings.length },
    { label: "Upcoming",       value: bookings.filter((b) => b.status === "booked").length },
    { label: "Active Stays",   value: bookings.filter((b) => b.status === "checked-in").length },
    { label: "Completed",      value: bookings.filter((b) => b.status === "checked-out").length },
  ];

  // ── Action handlers ───────────────────────────────────────────────────────
  const handleCancel = () => {
    if (!confirmId) return;
    dispatch(cancelBooking(confirmId)).then((res) => {
      if (!res.error) {
        notifySuccess("Booking cancelled successfully.");
        setConfirmId(null);
      } else {
        notifyError(res.payload || "Failed to cancel booking. Please try again.");
      }
    });
  };

  const openDetail = (id) => {
    dispatch(fetchBookingById(id));
    setDetailOpen(true);
  };

  const closeDetail = () => {
    setDetailOpen(false);
    dispatch(clearSingleBooking());
  };

  const handlePdf = async (invoiceId) => {
    setPdfLoading(invoiceId);
    try { await downloadInvoicePdf(invoiceId); }
    catch (e) { console.error(e); }
    finally { setPdfLoading(null); }
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-20">

      {/* ── Hero header ──────────────────────────────────────────────────────── */}
      <div className="bg-[#0B1F2A] text-white px-6 pt-10 pb-14">
        <div className="mx-auto max-w-5xl">
          <p className="text-[#C9A24B] text-xs uppercase tracking-widest mb-1">Guest Portal</p>
          <h1 className="font-serif text-3xl sm:text-4xl">My Bookings</h1>
          <p className="mt-1 text-gray-400 text-sm">
            Welcome back, <span className="text-white">{user?.name || "Guest"}</span>
          </p>

          <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-3">
            {stats.map((s) => (
              <div key={s.label} className="bg-white/5 border border-white/10 rounded-xl px-4 py-3">
                <p className="text-2xl font-semibold text-[#C9A24B]">{s.value}</p>
                <p className="text-xs text-gray-400 mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Main content ─────────────────────────────────────────────────────── */}
      <div className="mx-auto max-w-5xl px-6 -mt-6 space-y-10">

        {/* Loading skeletons */}
        {loading && (
          <div className="grid gap-4 sm:grid-cols-2">
            {Array.from({length: 4}, (_, i) => <SkeletonCard key={i} />)}
          </div>
        )}

        {!loading && !error && (
          <>
            {/* ══ Active Bookings ════════════════════════════════════════════════ */}
            <section>
              <div className="flex items-baseline gap- mb-4">
                <h2 className="font-serif text-2xl text-[#0B1F2A]">Active Bookings</h2>
                <span className="text-sm text-gray-400">({active.length})</span>
              </div>

              {active.length === 0 ? (
                history.length > 0 ? (
                  // Compact notice so history is immediately visible below
                  <div className="bg-white rounded-xl border border-dashed border-gray-200 px-5 py-6 flex flex-wrap items-center justify-between gap-4">
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-gray-500">No upcoming or active stays right now.</p>
                      <p className="text-xs text-gray-400 mt-0.5">Your previous stays are shown below.</p>
                    </div>
                    <Link
                      to="/rooms"
                      className="shrink-0 rounded-full bg-[#C9A24B] px-5 py-2 text-sm font-medium text-[#0B1F2A] hover:opacity-90 transition whitespace-nowrap"
                    >
                      Book a Stay
                    </Link>
                  </div>
                ) : (
                  // Full empty state only when there is truly no booking history either
                  <div className="bg-white rounded-xl border border-gray-100 py-14 text-center">
                    <p className="text-4xl mb-3">🛎️</p>
                    <p className="font-medium text-gray-500">No bookings yet</p>
                    <p className="text-sm text-gray-400 mt-1 mb-5">Ready for your first stay?</p>
                    <Link
                      to="/rooms"
                      className="inline-block rounded-full bg-[#C9A24B] px-6 py-2.5 text-sm font-medium text-[#0B1F2A] hover:opacity-90 transition"
                    >
                      Browse Rooms
                    </Link>
                  </div>
                )
              ) : (
                <div className="grid gap-4 sm:grid-cols-2">
                  {active.map((booking) => (
                    <div
                      key={booking._id}
                      className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 flex flex-col gap-4 hover:shadow-md transition-shadow"
                    >
                      {/* Room + status badges */}
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="font-serif text-xl text-[#0B1F2A]">Room {booking.room?.roomNumber}</p>
                          <p className="text-xs text-gray-400 capitalize mt-0.5">{booking.room?.type} room</p>
                        </div>
                        <div className="flex flex-col items-end gap-1">
                          <span className={`text-xs font-medium px-2.5 py-1 rounded-full capitalize whitespace-nowrap ${STATUS_STYLES[booking.status]}`}>
                            {STATUS_LABEL[booking.status] || booking.status}
                          </span>
                          <span className={`text-xs font-medium px-2.5 py-1 rounded-full whitespace-nowrap ${
                            booking.paymentStatus === "paid"
                              ? "bg-green-100 text-green-700"
                              : "bg-yellow-100 text-yellow-700"
                          }`}>
                            {booking.paymentStatus === "paid"
                              ? "Paid"
                              : `Due @ ${
                                  booking.paymentTiming === "checkin"  ? "check-in"  :
                                  booking.paymentTiming === "checkout" ? "check-out" : "—"
                                }`}
                          </span>
                        </div>
                      </div>

                      {/* Dates */}
                      <div className="flex items-stretch gap-3 text-sm">
                        <div className="flex-1 bg-gray-50 rounded-xl px-3 py-2.5">
                          <p className="text-xs text-gray-400 mb-0.5">Check-in</p>
                          <p className="font-medium text-[#0B1F2A]">{fmtDate(booking.checkInDate)}</p>
                        </div>
                        <div className="flex items-center text-gray-300 text-lg">→</div>
                        <div className="flex-1 bg-gray-50 rounded-xl px-3 py-2.5">
                          <p className="text-xs text-gray-400 mb-0.5">Check-out</p>
                          <p className="font-medium text-[#0B1F2A]">{fmtDate(booking.checkOutDate)}</p>
                        </div>
                      </div>

                      {/* Nights + total */}
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-500">
                          {booking.nights} night{booking.nights !== 1 ? "s" : ""}
                        </span>
                        <span className="text-lg font-semibold text-[#C9A24B]">
                          ${booking.totalAmount?.toLocaleString()}
                        </span>
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2 pt-3 border-t border-gray-50">
                        <button
                          onClick={() => openDetail(booking._id)}
                          className="flex-1 text-sm border border-[#0B1F2A] text-[#0B1F2A] rounded-lg py-2.5 hover:bg-[#0B1F2A] hover:text-white transition-colors font-medium"
                        >
                          View Receipt
                        </button>
                        {booking.status === "booked" && (
                          <button
                            onClick={() => setConfirmId(booking._id)}
                            className="flex-1 text-sm border border-red-300 text-red-500 rounded-lg py-2.5 hover:bg-red-50 transition-colors font-medium"
                          >
                            Cancel
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* ══ Booking History ════════════════════════════════════════════════ */}
            <section>
              <div className="flex items-baseline gap-2 mb-4">
                <h2 className="font-serif text-2xl text-[#0B1F2A]">Booking History</h2>
                <span className="text-sm text-gray-400">({history.length})</span>
              </div>

              {history.length === 0 ? (
                <div className="bg-white rounded-xl border border-gray-100 py-14 text-center">
                  <p className="text-4xl mb-3">📋</p>
                  <p className="font-medium text-gray-500">No booking history yet</p>
                  <p className="text-sm text-gray-400 mt-1">
                    Completed and cancelled bookings will appear here
                  </p>
                </div>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2">
                  {history.map((booking) => {
                    const inv = invoiceMap[booking._id];
                    return (
                      <div
                        key={booking._id}
                        className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 flex flex-col gap-4 hover:shadow-md transition-shadow"
                      >
                        {/* Room + status badge */}
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <p className="font-serif text-xl text-[#0B1F2A]">Room {booking.room?.roomNumber}</p>
                            <p className="text-xs text-gray-400 capitalize mt-0.5">{booking.room?.type} room</p>
                          </div>
                          <span className={`text-xs font-medium px-2.5 py-1 rounded-full capitalize whitespace-nowrap ${STATUS_STYLES[booking.status]}`}>
                            {STATUS_LABEL[booking.status] || booking.status}
                          </span>
                        </div>

                        {/* Dates */}
                        <div className="flex items-stretch gap-3 text-sm">
                          <div className="flex-1 bg-gray-50 rounded-xl px-3 py-2.5">
                            <p className="text-xs text-gray-400 mb-0.5">Check-in</p>
                            <p className="font-medium text-[#0B1F2A]">{fmtDate(booking.checkInDate)}</p>
                          </div>
                          <div className="flex items-center text-gray-300 text-lg">→</div>
                          <div className="flex-1 bg-gray-50 rounded-xl px-3 py-2.5">
                            <p className="text-xs text-gray-400 mb-0.5">Check-out</p>
                            <p className="font-medium text-[#0B1F2A]">{fmtDate(booking.checkOutDate)}</p>
                          </div>
                        </div>

                        {/* Nights + total */}
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-500">
                            {booking.nights} night{booking.nights !== 1 ? "s" : ""}
                          </span>
                          <span className="text-lg font-semibold text-[#0B1F2A]">
                            ${booking.totalAmount?.toLocaleString()}
                          </span>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-2 pt-3 border-t border-gray-50">
                          <button
                            onClick={() => openDetail(booking._id)}
                            className="flex-1 text-sm border border-gray-300 text-gray-600 rounded-lg py-2.5 hover:bg-gray-50 transition-colors font-medium"
                          >
                            View Receipt
                          </button>
                          {booking.status === "checked-out" && (
                            <Link
                              to={`/booking?room=${booking.room?._id}`}
                              className="flex-1 text-center text-sm bg-[#C9A24B] text-[#0B1F2A] rounded-lg py-2.5 hover:opacity-90 transition-opacity font-medium"
                            >
                              Book Again
                            </Link>
                          )}
                        </div>

                        {/* Feedback — only for checked-out bookings */}
                        {booking.status === "checked-out" && (
                          <div className="border-t border-dashed border-gray-200 pt-4">
                            <p className="text-xs text-gray-400 uppercase tracking-wide mb-2">
                              Your Feedback
                            </p>
                            <BookingFeedbackSection bookingId={booking._id} />
                          </div>
                        )}

                        {/* Invoice — only for checked-out bookings */}
                        {booking.status === "checked-out" && (
                          <div className="border-t border-dashed border-gray-200 pt-4">
                            {invLoading ? (
                              <div className="flex items-center gap-2 text-xs text-gray-400">
                                <div className="w-3 h-3 border-2 border-[#C9A24B] border-t-transparent rounded-full animate-spin" />
                                Loading invoice…
                              </div>
                            ) : inv ? (
                              <div className="space-y-3">
                                {/* Invoice header */}
                                <div className="flex items-center justify-between">
                                  <div>
                                    <p className="text-[10px] text-gray-400 uppercase tracking-widest">Invoice</p>
                                    <p className="font-mono text-xs text-gray-500 mt-0.5">
                                      #{inv._id?.slice(-6).toUpperCase()}
                                    </p>
                                  </div>
                                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full capitalize ${
                                    STATUS_COLORS[inv.paymentStatus] || "bg-gray-100 text-gray-600"
                                  }`}>
                                    {inv.paymentStatus === "paid" ? "Paid" : "Pending"}
                                  </span>
                                </div>
                                {inv.paymentDetails && inv.paymentStatus === "paid" && (
                                  <p className="text-xs text-gray-500">
                                    Paid via{" "}
                                    <span className="font-medium">{fmtMethod(inv.paymentDetails.method)}</span>
                                    {inv.paymentDetails.paidAt && (
                                      <> on {fmtInvDate(inv.paymentDetails.paidAt)}</>
                                    )}
                                  </p>
                                )}

                                {/* Charge breakdown */}
                                <div className="bg-gray-50 rounded-xl p-3 space-y-1.5 text-sm">
                                  <div className="flex justify-between text-gray-500">
                                    <span>Room Charge</span>
                                    <span>{fmt(inv.roomCharge)}</span>
                                  </div>
                                  {inv.extraCharges?.map((ex, i) => (
                                    <div key={i} className="flex justify-between text-gray-400 text-xs">
                                      <span>{ex.description}</span>
                                      <span>{fmt(ex.amount)}</span>
                                    </div>
                                  ))}
                                  <div className="border-t border-gray-200 pt-2 flex justify-between font-semibold text-[#0B1F2A]">
                                    <span>Total</span>
                                    <span className="text-[#C9A24B]">{fmt(inv.totalAmount)}</span>
                                  </div>
                                </div>

                                {/* Download */}
                                <button
                                  onClick={() => handlePdf(inv._id)}
                                  disabled={pdfLoading === inv._id}
                                  className="w-full text-sm border border-[#0B1F2A] text-[#0B1F2A] rounded-lg py-2 hover:bg-[#0B1F2A] hover:text-white transition-colors font-medium disabled:opacity-60"
                                >
                                  {pdfLoading === inv._id ? "Downloading…" : "Download PDF"}
                                </button>
                              </div>
                            ) : (
                              <p className="text-xs text-gray-400 italic">Invoice not yet available</p>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </section>
          </>
        )}
      </div>

      {/* ── Cancel confirmation modal ─────────────────────────────────────────── */}
      {confirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setConfirmId(null)}
          />
          <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-sm z-10 p-6">
            <h3 className="font-serif text-xl text-[#0B1F2A] mb-2">Cancel Reservation?</h3>
            <p className="text-sm text-gray-500 mb-6">
              This action cannot be undone. Your reservation will be cancelled immediately.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmId(null)}
                className="flex-1 border border-gray-300 text-sm py-2.5 rounded-lg hover:bg-gray-50 font-medium"
              >
                Keep It
              </button>
              <button
                onClick={handleCancel}
                disabled={cancelLoading}
                className="flex-1 bg-red-600 text-white text-sm py-2.5 rounded-lg hover:bg-red-700 disabled:opacity-60 font-medium"
              >
                {cancelLoading ? "Cancelling..." : "Yes, Cancel"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Booking receipt modal ─────────────────────────────────────────────── */}
      {detailOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={closeDetail}
          />
          <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-md z-10 max-h-[92vh] flex flex-col">

            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 sticky top-0 bg-white rounded-t-xl">
              <h2 className="font-serif text-lg text-[#0B1F2A]">Booking Receipt</h2>
              <button
                onClick={closeDetail}
                className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
              >
                ×
              </button>
            </div>

            {singleLoading && (
              <div className="flex justify-center py-16">
                <div className="w-8 h-8 border-4 border-[#C9A24B] border-t-transparent rounded-full animate-spin" />
              </div>
            )}

            {!singleLoading && singleBooking && (
              <div className="overflow-y-auto px-6 py-5 space-y-6">

                <div className="flex items-center justify-between">
                  <span className={`text-xs font-medium px-3 py-1.5 rounded-full capitalize ${STATUS_STYLES[singleBooking.status]}`}>
                    {STATUS_LABEL[singleBooking.status] || singleBooking.status}
                  </span>
                  <span className="text-xs text-gray-400">
                    Booked {fmtDate(singleBooking.createdAt)}
                  </span>
                </div>

                <div className="bg-[#0B1F2A] rounded-xl p-5 text-white">
                  <p className="text-[#C9A24B] text-xs uppercase tracking-widest mb-2">Room Details</p>
                  <p className="font-serif text-3xl">Room {singleBooking.room?.roomNumber}</p>
                  <p className="text-gray-300 text-sm capitalize mt-1">{singleBooking.room?.type} room</p>
                  <p className="text-[#C9A24B] font-medium mt-2">
                    ${singleBooking.room?.price}
                    <span className="text-gray-400 text-xs font-normal"> / night</span>
                  </p>
                </div>

                <div>
                  <p className="text-xs uppercase tracking-wide text-gray-400 mb-2">Guest</p>
                  <ReceiptRow label="Name"  value={singleBooking.guest?.name} />
                  <ReceiptRow label="Email" value={singleBooking.guest?.email} />
                </div>

                <div>
                  <p className="text-xs uppercase tracking-wide text-gray-400 mb-2">Stay</p>
                  <ReceiptRow label="Check-in"  value={fmtDate(singleBooking.checkInDate)} />
                  <ReceiptRow label="Check-out" value={fmtDate(singleBooking.checkOutDate)} />
                  <ReceiptRow
                    label="Duration"
                    value={`${singleBooking.nights} night${singleBooking.nights !== 1 ? "s" : ""}`}
                  />
                </div>

                <div className="bg-gray-50 rounded-xl p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 font-medium">Total Charged</span>
                    <span className="text-2xl font-semibold text-[#C9A24B]">
                      ${singleBooking.totalAmount?.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t border-gray-200">
                    <span className="text-sm text-gray-500">Payment</span>
                    <div className="flex items-center gap-2">
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                        singleBooking.paymentStatus === "paid"
                          ? "bg-green-100 text-green-700"
                          : "bg-yellow-100 text-yellow-700"
                      }`}>
                        {singleBooking.paymentStatus === "paid" ? "Paid" : "Pending"}
                      </span>
                      {singleBooking.paymentTiming && (
                        <span className="text-xs text-gray-400 capitalize">
                          ({singleBooking.paymentTiming === "now"
                            ? "paid at booking"
                            : `due at ${singleBooking.paymentTiming}`})
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {singleBooking.status === "booked" && (
                  <button
                    onClick={() => { closeDetail(); setConfirmId(singleBooking._id); }}
                    className="w-full border border-red-300 text-red-500 text-sm py-2.5 rounded-lg hover:bg-red-50 transition-colors font-medium"
                  >
                    Cancel This Booking
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
