import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchEventHallBookings,
  confirmEventHallBooking,
  startEventHallBooking,
  completeEventHallBooking,
  cancelEventHallBooking,
  clearActionErrors,
} from "../../redux/slice/eventHallBookings/eventHallBookingSlice";
import ReceptionistLayout from "../../components/receptionist/ReceptionistLayout";

const fmtDate = (iso) =>
  iso ? new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "—";

const fmtTime = (t) => {
  if (!t) return "—";
  const [h, m] = t.split(":").map(Number);
  const ampm = h >= 12 ? "PM" : "AM";
  return `${h % 12 || 12}:${String(m).padStart(2, "0")} ${ampm}`;
};

const STATUS_STYLES = {
  booked:        "bg-blue-100 text-blue-700",
  confirmed:     "bg-yellow-100 text-yellow-700",
  "in-progress": "bg-purple-100 text-purple-700",
  completed:     "bg-green-100 text-green-700",
  cancelled:     "bg-red-100 text-red-600",
};

const PAYMENT_STYLES = {
  pending: "bg-orange-100 text-orange-700",
  paid:    "bg-green-100 text-green-700",
};

const EVENT_TYPE_LABELS = {
  wedding: "Wedding", conference: "Conference", birthday: "Birthday",
  corporate: "Corporate", other: "Other",
};

const todayStr = () => new Date().toISOString().split("T")[0];

export default function ReceptionistEventHallBookings() {
  const dispatch = useDispatch();
  const {
    bookings, loading, error,
    confirmLoading, startLoading, completeLoading, cancelLoading,
    confirmError, startError, completeError, cancelError,
  } = useSelector((s) => s.eventHallBookings);

  const [statusFilter, setStatusFilter] = useState("all");
  const [dateFilter,   setDateFilter]   = useState(todayStr());

  const fetchParams = () => {
    const p = {};
    if (statusFilter !== "all") p.status = statusFilter;
    if (dateFilter)             p.date   = dateFilter;
    return p;
  };

  useEffect(() => {
    dispatch(fetchEventHallBookings(fetchParams()));
  }, [dispatch, statusFilter, dateFilter]);

  useEffect(() => () => dispatch(clearActionErrors()), [dispatch]);

  const actionError = confirmError || startError || completeError || cancelError;

  return (
    <ReceptionistLayout title="Event Hall Bookings">
      <div className="space-y-5">

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3">
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
            className="text-sm border border-gray-300 rounded-lg px-3 py-2 bg-white focus:outline-none focus:border-[#C9A24B]">
            <option value="all">All Status</option>
            {["booked","confirmed","in-progress","completed","cancelled"].map((s) => (
              <option key={s} value={s}>{s[0].toUpperCase() + s.slice(1)}</option>
            ))}
          </select>

          <input type="date" value={dateFilter} onChange={(e) => setDateFilter(e.target.value)}
            className="text-sm border border-gray-300 rounded-lg px-3 py-2 bg-white focus:outline-none focus:border-[#C9A24B]" />

          {dateFilter && (
            <button onClick={() => setDateFilter("")}
              className="text-sm border border-gray-300 rounded-lg px-3 py-2 bg-white hover:bg-gray-50 transition-colors">
              Clear Date
            </button>
          )}
          <button onClick={() => setDateFilter(todayStr())}
            className="text-sm border border-gray-300 rounded-lg px-3 py-2 bg-white hover:bg-gray-50 transition-colors">
            Today
          </button>
          <span className="text-sm text-gray-400 ml-auto">{bookings.length} bookings</span>
        </div>

        {actionError && (
          <div className="px-4 py-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">{actionError}</div>
        )}

        {loading && (
          <div className="flex justify-center py-12">
            <div className="w-8 h-8 rounded-full border-2 border-[#C9A24B] border-t-transparent animate-spin" />
          </div>
        )}

        {!loading && error && (
          <div className="px-4 py-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">{error}</div>
        )}

        {!loading && !error && bookings.length === 0 && (
          <div className="bg-white rounded-xl border border-gray-100 py-14 text-center">
            <p className="text-4xl mb-3">🏛️</p>
            <p className="font-medium text-gray-500">No event hall bookings found</p>
            <p className="text-sm text-gray-400 mt-1">Try adjusting the filters.</p>
          </div>
        )}

        {!loading && !error && bookings.length > 0 && (
          <div className="bg-white rounded-xl border border-gray-100 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100 text-left text-xs uppercase tracking-wide text-gray-500">
                    {["Guest", "Hall", "Date", "Time", "Type", "Guests", "Payment", "Status", "Actions"].map((h) => (
                      <th key={h} className="px-4 py-3 font-medium">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {bookings.map((b) => {
                    const paymentPending = b.paymentStatus !== "paid";
                    return (
                      <tr key={b._id} className="border-b border-gray-50 hover:bg-gray-50/60 transition-colors">
                        <td className="px-4 py-3">
                          <p className="font-medium text-[#0B1F2A]">{b.guest?.name || "—"}</p>
                          <p className="text-xs text-gray-400">{b.guest?.email || ""}</p>
                        </td>
                        <td className="px-4 py-3 font-medium text-[#0B1F2A]">{b.hall?.hallName || "—"}</td>
                        <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{fmtDate(b.eventDate)}</td>
                        <td className="px-4 py-3 text-gray-600 whitespace-nowrap text-xs">
                          {fmtTime(b.startTime)} – {fmtTime(b.endTime)}
                        </td>
                        <td className="px-4 py-3 text-gray-600 capitalize">
                          {EVENT_TYPE_LABELS[b.eventType] || b.eventType}
                        </td>
                        <td className="px-4 py-3 text-gray-600">{b.guestCount}</td>
                        <td className="px-4 py-3">
                          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full capitalize ${PAYMENT_STYLES[b.paymentStatus] || PAYMENT_STYLES.pending}`}>
                            {b.paymentStatus || "pending"}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full capitalize ${STATUS_STYLES[b.status] || "bg-gray-100 text-gray-600"}`}>
                            {b.status}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex flex-wrap items-center gap-1.5">
                            {b.status === "booked" && (
                              <button
                                onClick={() => dispatch(confirmEventHallBooking(b._id))}
                                disabled={confirmLoading === b._id}
                                className="text-xs px-2.5 py-1.5 rounded-md bg-[#C9A24B] text-[#0B1F2A] font-medium hover:opacity-90 disabled:opacity-60"
                              >
                                {confirmLoading === b._id ? "…" : "Confirm"}
                              </button>
                            )}
                            {b.status === "confirmed" && (
                              <div className="relative group">
                                <button
                                  onClick={() => !paymentPending && dispatch(startEventHallBooking(b._id))}
                                  disabled={startLoading === b._id || paymentPending}
                                  className={`text-xs px-2.5 py-1.5 rounded-md font-medium transition-colors ${
                                    paymentPending
                                      ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                                      : "bg-purple-600 text-white hover:bg-purple-700 disabled:opacity-60"
                                  }`}
                                >
                                  {startLoading === b._id ? "…" : "Start"}
                                </button>
                                {paymentPending && (
                                  <div className="absolute bottom-full left-0 mb-1.5 z-20 w-48 bg-[#0B1F2A] text-white text-xs rounded-md px-2.5 py-1.5 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-normal">
                                    Payment must be completed before starting the event.
                                  </div>
                                )}
                              </div>
                            )}
                            {b.status === "in-progress" && (
                              <button
                                onClick={() => dispatch(completeEventHallBooking(b._id))}
                                disabled={completeLoading === b._id}
                                className="text-xs px-2.5 py-1.5 rounded-md bg-green-600 text-white hover:bg-green-700 disabled:opacity-60"
                              >
                                {completeLoading === b._id ? "…" : "Complete"}
                              </button>
                            )}
                            {(b.status === "booked" || b.status === "confirmed") && (
                              <button
                                onClick={() => dispatch(cancelEventHallBooking(b._id))}
                                disabled={cancelLoading === b._id}
                                className="text-xs px-2.5 py-1.5 rounded-md border border-red-300 text-red-500 hover:bg-red-50 disabled:opacity-60"
                              >
                                {cancelLoading === b._id ? "…" : "Cancel"}
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </ReceptionistLayout>
  );
}
