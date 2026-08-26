import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { useAuth } from "../../context/AuthContext";
import {
  fetchTableReservations,
  cancelTableReservation,
  clearActionErrors,
} from "../../redux/slice/tableReservations/tableReservationSlice";
import { notifySuccess, notifyError } from "../../utils/toast";
import SkeletonCard from "../../components/SkeletonCard";

const STATUS_STYLES = {
  reserved:  "bg-blue-100 text-blue-700",
  seated:    "bg-green-100 text-green-700",
  completed: "bg-gray-100 text-gray-600",
  cancelled: "bg-red-100 text-red-600",
};

const STATUS_LABEL = {
  reserved:  "Upcoming",
  seated:    "Seated Now",
  completed: "Completed",
  cancelled: "Cancelled",
};

const LOC_ICON  = { indoor: "🏠", outdoor: "🌿", "private-room": "🚪" };
const LOC_LABEL = { indoor: "Indoor", outdoor: "Outdoor", "private-room": "Private Room" };

const fmtDate = (iso) =>
  new Date(iso).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });

const fmtTime = (t) => {
  if (!t) return "—";
  const [h, m] = t.split(":").map(Number);
  const ampm = h >= 12 ? "PM" : "AM";
  return `${h % 12 || 12}:${String(m).padStart(2, "0")} ${ampm}`;
};

export default function MyTableReservations() {
  const dispatch = useDispatch();
  const { user } = useAuth();

  const { reservations, loading, error, cancelLoading, cancelError } =
    useSelector((s) => s.tableReservations);

  useEffect(() => { if (error) notifyError(error); }, [error]);
  useEffect(() => { if (cancelError) notifyError(cancelError); }, [cancelError]);

  const [confirmId, setConfirmId] = useState(null);

  useEffect(() => {
    dispatch(fetchTableReservations());
    dispatch(clearActionErrors());
  }, [dispatch]);

  const active  = reservations.filter((r) => ["reserved", "seated"].includes(r.status));
  const history = reservations.filter((r) => ["completed", "cancelled"].includes(r.status));

  const stats = [
    { label: "Total",     value: reservations.length },
    { label: "Upcoming",  value: reservations.filter((r) => r.status === "reserved").length },
    { label: "Seated",    value: reservations.filter((r) => r.status === "seated").length },
    { label: "Completed", value: reservations.filter((r) => r.status === "completed").length },
  ];

  const handleCancel = () => {
    if (!confirmId) return;
    dispatch(cancelTableReservation(confirmId)).then((res) => {
      if (!res.error) {
        notifySuccess("Table reservation cancelled.");
        setConfirmId(null);
      }
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      {/* Hero */}
      <div className="bg-[#0B1F2A] text-white px-6 pt-10 pb-14">
        <div className="mx-auto max-w-5xl">
          <p className="text-[#C9A24B] text-xs uppercase tracking-widest mb-1">Guest Portal</p>
          <h1 className="font-serif text-3xl sm:text-4xl">My Table Reservations</h1>
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
            {Array.from({length: 3}, (_, i) => <SkeletonCard key={i} />)}
          </div>
        )}

        {!loading && !error && (
          <>
            {/* Active */}
            <section>
              <div className="flex items-baseline gap-2 mb-4">
                <h2 className="font-serif text-2xl text-[#0B1F2A]">Active Reservations</h2>
                <span className="text-sm text-gray-400">({active.length})</span>
              </div>

              {active.length === 0 ? (
                <div className="bg-white rounded-xl border border-dashed border-gray-200 px-5 py-6 flex flex-wrap items-center justify-between gap-4">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-500">No upcoming table reservations.</p>
                    <p className="text-xs text-gray-400 mt-0.5">Book a table for your next visit.</p>
                  </div>
                  <Link to="/reserve-table"
                    className="shrink-0 rounded-full bg-[#C9A24B] px-5 py-2 text-sm font-medium text-[#0B1F2A] hover:opacity-90 transition whitespace-nowrap">
                    Reserve a Table
                  </Link>
                </div>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2">
                  {active.map((r) => (
                    <div key={r._id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 flex flex-col gap-4 hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="text-2xl">{LOC_ICON[r.table?.location] || "🪑"}</span>
                          <div>
                            <p className="font-serif text-xl text-[#0B1F2A]">Table {r.table?.tableNumber}</p>
                            <p className="text-xs text-gray-400">{LOC_LABEL[r.table?.location] || r.table?.location}</p>
                          </div>
                        </div>
                        <span className={`text-xs font-medium px-2.5 py-1 rounded-full capitalize whitespace-nowrap ${STATUS_STYLES[r.status]}`}>
                          {STATUS_LABEL[r.status] || r.status}
                        </span>
                      </div>

                      <div className="flex items-stretch gap-3 text-sm">
                        <div className="flex-1 bg-gray-50 rounded-xl px-3 py-2.5">
                          <p className="text-xs text-gray-400 mb-0.5">Date</p>
                          <p className="font-medium text-[#0B1F2A]">{fmtDate(r.reservationDate)}</p>
                        </div>
                        <div className="flex-1 bg-gray-50 rounded-xl px-3 py-2.5">
                          <p className="text-xs text-gray-400 mb-0.5">Time</p>
                          <p className="font-medium text-[#0B1F2A]">{fmtTime(r.reservationTime)}</p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500">{r.partySize} {r.partySize === 1 ? "guest" : "guests"}</span>
                        {r.table?.capacity && (
                          <span className="text-xs text-gray-400">Table seats {r.table.capacity}</span>
                        )}
                      </div>

                      {r.specialRequests && (
                        <p className="text-xs text-gray-500 bg-gray-50 rounded-lg px-3 py-2 italic">"{r.specialRequests}"</p>
                      )}

                      {r.status === "reserved" && (
                        <div className="pt-3 border-t border-gray-50">
                          <button onClick={() => setConfirmId(r._id)}
                            className="w-full text-sm border border-red-300 text-red-500 rounded-lg py-2.5 hover:bg-red-50 transition-colors font-medium">
                            Cancel Reservation
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
                <h2 className="font-serif text-2xl text-[#0B1F2A]">Reservation History</h2>
                <span className="text-sm text-gray-400">({history.length})</span>
              </div>

              {history.length === 0 ? (
                <div className="bg-white rounded-xl border border-gray-100 py-14 text-center">
                  <p className="text-4xl mb-3">📋</p>
                  <p className="font-medium text-gray-500">No past reservations yet</p>
                  <p className="text-sm text-gray-400 mt-1">Completed and cancelled reservations will appear here</p>
                </div>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2">
                  {history.map((r) => (
                    <div key={r._id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 flex flex-col gap-4 hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="text-2xl">{LOC_ICON[r.table?.location] || "🪑"}</span>
                          <div>
                            <p className="font-serif text-xl text-[#0B1F2A]">Table {r.table?.tableNumber}</p>
                            <p className="text-xs text-gray-400">{LOC_LABEL[r.table?.location] || r.table?.location}</p>
                          </div>
                        </div>
                        <span className={`text-xs font-medium px-2.5 py-1 rounded-full capitalize whitespace-nowrap ${STATUS_STYLES[r.status]}`}>
                          {STATUS_LABEL[r.status] || r.status}
                        </span>
                      </div>

                      <div className="flex items-stretch gap-3 text-sm">
                        <div className="flex-1 bg-gray-50 rounded-xl px-3 py-2.5">
                          <p className="text-xs text-gray-400 mb-0.5">Date</p>
                          <p className="font-medium text-[#0B1F2A]">{fmtDate(r.reservationDate)}</p>
                        </div>
                        <div className="flex-1 bg-gray-50 rounded-xl px-3 py-2.5">
                          <p className="text-xs text-gray-400 mb-0.5">Time</p>
                          <p className="font-medium text-[#0B1F2A]">{fmtTime(r.reservationTime)}</p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500">{r.partySize} {r.partySize === 1 ? "guest" : "guests"}</span>
                      </div>

                      {r.status === "completed" && (
                        <Link to="/reserve-table"
                          className="text-center text-sm bg-[#C9A24B] text-[#0B1F2A] rounded-lg py-2.5 hover:opacity-90 transition-opacity font-medium">
                          Reserve Again
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

      {/* Cancel confirmation modal */}
      {confirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setConfirmId(null)} />
          <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-sm z-10 p-6">
            <h3 className="font-serif text-xl text-[#0B1F2A] mb-2">Cancel Reservation?</h3>
            <p className="text-sm text-gray-500 mb-6">This action cannot be undone. Your table will be released.</p>
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
