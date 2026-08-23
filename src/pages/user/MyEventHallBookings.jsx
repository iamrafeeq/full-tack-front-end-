import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { useAuth } from "../../context/AuthContext";
import {
  fetchEventHallBookings,
  cancelEventHallBooking,
  clearActionErrors,
} from "../../redux/slice/eventHallBookings/eventHallBookingSlice";

const STATUS_STYLES = {
  booked:       "bg-blue-100 text-blue-700",
  confirmed:    "bg-[#C9A24B]/15 text-[#7a5c1e]",
  "in-progress":"bg-purple-100 text-purple-700",
  completed:    "bg-gray-100 text-gray-600",
  cancelled:    "bg-red-100 text-red-600",
};

const STATUS_LABEL = {
  booked:        "Awaiting Confirmation",
  confirmed:     "Confirmed",
  "in-progress": "In Progress",
  completed:     "Completed",
  cancelled:     "Cancelled",
};

const PAYMENT_STYLES = {
  pending: "bg-orange-100 text-orange-700",
  paid:    "bg-green-100 text-green-700",
};

const EVENT_TYPE_LABELS = {
  wedding: "Wedding", conference: "Conference", birthday: "Birthday Party",
  corporate: "Corporate Event", other: "Other",
};

const fmtDate = (iso) =>
  iso ? new Date(iso).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }) : "—";

const fmtTime = (t) => {
  if (!t) return "—";
  const [h, m] = t.split(":").map(Number);
  const ampm = h >= 12 ? "PM" : "AM";
  return `${h % 12 || 12}:${String(m).padStart(2, "0")} ${ampm}`;
};

const fmt$ = (n) =>
  n !== undefined && n !== null
    ? `$${Number(n).toLocaleString("en-US", { minimumFractionDigits: 2 })}`
    : "—";

export default function MyEventHallBookings() {
  const dispatch = useDispatch();
  const { user }  = useAuth();

  const { bookings, loading, error, cancelLoading, cancelError } =
    useSelector((s) => s.eventHallBookings);

  const [confirmId, setConfirmId] = useState(null);

  useEffect(() => {
    dispatch(fetchEventHallBookings());
    dispatch(clearActionErrors());
  }, [dispatch]);

  const active  = bookings.filter((b) => ["booked", "confirmed", "in-progress"].includes(b.status));
  const history = bookings.filter((b) => ["completed", "cancelled"].includes(b.status));

  const stats = [
    { label: "Total",     value: bookings.length },
    { label: "Upcoming",  value: bookings.filter((b) => b.status === "booked").length },
    { label: "Confirmed", value: bookings.filter((b) => b.status === "confirmed").length },
    { label: "Completed", value: bookings.filter((b) => b.status === "completed").length },
  ];

  const handleCancel = () => {
    if (!confirmId) return;
    dispatch(cancelEventHallBooking(confirmId)).then((res) => {
      if (!res.error) setConfirmId(null);
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      {/* Hero */}
      <div className="bg-[#0B1F2A] text-white px-6 pt-10 pb-14">
        <div className="mx-auto max-w-5xl">
          <p className="text-[#C9A24B] text-xs uppercase tracking-widest mb-1">Guest Portal</p>
          <h1 className="font-serif text-3xl sm:text-4xl">My Event Hall Bookings</h1>
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

      <div className="mx-auto max-w-5xl px-6 -mt-6 space-y-10 pb-16">

        {loading && (
          <div className="grid gap-4 sm:grid-cols-2">
            {[1, 2].map((i) => (
              <div key={i} className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 space-y-3 animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-1/2" />
                <div className="h-3 bg-gray-100 rounded w-1/3" />
                <div className="h-16 bg-gray-100 rounded" />
              </div>
            ))}
          </div>
        )}

        {!loading && error && (
          <div className="px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">{error}</div>
        )}

        {cancelError && (
          <div className="px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">{cancelError}</div>
        )}

        {!loading && !error && (
          <>
            {/* Active */}
            <section>
              <div className="flex items-baseline gap-2 mb-4">
                <h2 className="font-serif text-2xl text-[#0B1F2A]">Active Bookings</h2>
                <span className="text-sm text-gray-400">({active.length})</span>
              </div>

              {active.length === 0 ? (
                <div className="bg-white rounded-xl border border-dashed border-gray-200 px-5 py-6 flex items-center justify-between gap-10">
                  <div>
                    <p className="text-sm font-medium text-gray-500">No upcoming event hall bookings.</p>
                    <p className="text-xs text-gray-400 mt-0.5">Book a hall for your next event.</p>
                  </div>
                  <Link to="/book-event-hall"
                    className="shrink-0 rounded-full bg-[#C9A24B] px-5 py-2 text-sm font-medium text-[#0B1F2A] hover:opacity-90 transition whitespace-nowrap">
                    Book an Event Hall
                  </Link>
                </div>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2">
                  {active.map((b) => (
                    <div key={b._id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 flex flex-col gap-4 hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="font-serif text-xl text-[#0B1F2A]">{b.hall?.hallName || "Event Hall"}</p>
                          <p className="text-xs text-gray-400 capitalize mt-0.5">
                            {EVENT_TYPE_LABELS[b.eventType] || b.eventType}
                          </p>
                        </div>
                        <div className="flex flex-col items-end gap-1">
                          <span className={`text-xs font-medium px-2.5 py-1 rounded-full capitalize whitespace-nowrap ${STATUS_STYLES[b.status]}`}>
                            {STATUS_LABEL[b.status] || b.status}
                          </span>
                          <span className={`text-xs font-medium px-2.5 py-1 rounded-full capitalize whitespace-nowrap ${PAYMENT_STYLES[b.paymentStatus] || PAYMENT_STYLES.pending}`}>
                            {b.paymentStatus === "paid" ? "Paid" : "Payment Pending"}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-stretch gap-3 text-sm">
                        <div className="flex-1 bg-gray-50 rounded-xl px-3 py-2.5">
                          <p className="text-xs text-gray-400 mb-0.5">Date</p>
                          <p className="font-medium text-[#0B1F2A]">{fmtDate(b.eventDate)}</p>
                        </div>
                        <div className="flex-1 bg-gray-50 rounded-xl px-3 py-2.5">
                          <p className="text-xs text-gray-400 mb-0.5">Time</p>
                          <p className="font-medium text-[#0B1F2A]">{fmtTime(b.startTime)} – {fmtTime(b.endTime)}</p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500">{b.guestCount} {b.guestCount === 1 ? "guest" : "guests"}</span>
                        <span className="font-semibold text-[#0B1F2A]">{fmt$(b.totalAmount)}</span>
                      </div>

                      {b.specialRequests && (
                        <p className="text-xs text-gray-500 bg-gray-50 rounded-lg px-3 py-2 italic">"{b.specialRequests}"</p>
                      )}

                      {(b.status === "booked" || b.status === "confirmed") && (
                        <div className="pt-3 border-t border-gray-50">
                          <button onClick={() => setConfirmId(b._id)}
                            className="w-full text-sm border border-red-300 text-red-500 rounded-lg py-2.5 hover:bg-red-50 transition-colors font-medium">
                            Cancel Booking
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* History */}
            <section>
              <div className="flex items-baseline gap-2 mb-4">
                <h2 className="font-serif text-2xl text-[#0B1F2A]">Booking History</h2>
                <span className="text-sm text-gray-400">({history.length})</span>
              </div>

              {history.length === 0 ? (
                <div className="bg-white rounded-xl border border-gray-100 py-14 text-center">
                  <p className="text-4xl mb-3">🏛️</p>
                  <p className="font-medium text-gray-500">No past event hall bookings yet</p>
                  <p className="text-sm text-gray-400 mt-1">Completed and cancelled bookings will appear here</p>
                </div>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2">
                  {history.map((b) => (
                    <div key={b._id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 flex flex-col gap-4 hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="font-serif text-xl text-[#0B1F2A]">{b.hall?.hallName || "Event Hall"}</p>
                          <p className="text-xs text-gray-400 capitalize mt-0.5">
                            {EVENT_TYPE_LABELS[b.eventType] || b.eventType}
                          </p>
                        </div>
                        <span className={`text-xs font-medium px-2.5 py-1 rounded-full capitalize whitespace-nowrap ${STATUS_STYLES[b.status]}`}>
                          {STATUS_LABEL[b.status] || b.status}
                        </span>
                      </div>

                      <div className="flex items-stretch gap-3 text-sm">
                        <div className="flex-1 bg-gray-50 rounded-xl px-3 py-2.5">
                          <p className="text-xs text-gray-400 mb-0.5">Date</p>
                          <p className="font-medium text-[#0B1F2A]">{fmtDate(b.eventDate)}</p>
                        </div>
                        <div className="flex-1 bg-gray-50 rounded-xl px-3 py-2.5">
                          <p className="text-xs text-gray-400 mb-0.5">Time</p>
                          <p className="font-medium text-[#0B1F2A]">{fmtTime(b.startTime)} – {fmtTime(b.endTime)}</p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500">{b.guestCount} {b.guestCount === 1 ? "guest" : "guests"}</span>
                        <span className="font-semibold text-[#0B1F2A]">{fmt$(b.totalAmount)}</span>
                      </div>

                      {b.status === "completed" && (
                        <Link to="/book-event-hall"
                          className="text-center text-sm bg-[#C9A24B] text-[#0B1F2A] rounded-lg py-2.5 hover:opacity-90 transition-opacity font-medium">
                          Book Again
                        </Link>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </section>
          </>
        )}
      </div>

      {/* Cancel modal */}
      {confirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setConfirmId(null)} />
          <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-sm z-10 p-6">
            <h3 className="font-serif text-xl text-[#0B1F2A] mb-2">Cancel Booking?</h3>
            <p className="text-sm text-gray-500 mb-6">
              This action cannot be undone. Your event hall will be released and a refund processed if applicable.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setConfirmId(null)}
                className="flex-1 border border-gray-300 text-sm py-2.5 rounded-lg hover:bg-gray-50 font-medium">
                Keep It
              </button>
              <button onClick={handleCancel} disabled={cancelLoading === confirmId}
                className="flex-1 bg-red-600 text-white text-sm py-2.5 rounded-lg hover:bg-red-700 disabled:opacity-60 font-medium">
                {cancelLoading === confirmId ? "Cancelling…" : "Yes, Cancel"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
