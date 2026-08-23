import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchTableReservations,
  seatTableReservation,
  completeTableReservation,
  cancelTableReservation,
  clearActionErrors,
} from "../../../redux/slice/tableReservations/tableReservationSlice";
import AdminLayout from "../../../components/admin/AdminLayout";
import {
  StatCard, TableCard, Th, Badge, Spinner, ErrorBanner, EmptyState, Modal, btn, fmtDate,
} from "../../../components/admin/AdminUI";

const STATUS_OPTIONS = ["reserved", "seated", "completed", "cancelled"];

const fmtTime = (t) => {
  if (!t) return "—";
  const [h, m] = t.split(":").map(Number);
  const ampm = h >= 12 ? "PM" : "AM";
  return `${h % 12 || 12}:${String(m).padStart(2, "0")} ${ampm}`;
};

export default function AdminTableReservations() {
  const dispatch = useDispatch();
  const {
    reservations, total, loading, error,
    seatLoading, seatError,
    completeLoading, completeError,
    cancelLoading, cancelError,
  } = useSelector((s) => s.tableReservations);

  const [search,       setSearch]       = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateFilter,   setDateFilter]   = useState("");
  const [confirmCancel, setConfirmCancel] = useState(null);

  const fetchParams = () => {
    const p = {};
    if (statusFilter !== "all") p.status = statusFilter;
    if (dateFilter)             p.date   = dateFilter;
    return p;
  };

  useEffect(() => {
    dispatch(fetchTableReservations(fetchParams()));
  }, [dispatch, statusFilter, dateFilter]);

  useEffect(() => () => dispatch(clearActionErrors()), [dispatch]);

  const filtered = reservations.filter((r) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      r.guest?.name?.toLowerCase().includes(q) ||
      r.guest?.email?.toLowerCase().includes(q) ||
      r.table?.tableNumber?.toLowerCase().includes(q)
    );
  });

  const counts = {
    total:     total || reservations.length,
    reserved:  reservations.filter((r) => r.status === "reserved").length,
    seated:    reservations.filter((r) => r.status === "seated").length,
    completed: reservations.filter((r) => r.status === "completed").length,
  };

  const handleCancel = () => {
    if (!confirmCancel) return;
    dispatch(cancelTableReservation(confirmCancel._id)).then((res) => {
      if (!res.error) setConfirmCancel(null);
    });
  };

  const todayStr = new Date().toISOString().split("T")[0];

  return (
    <AdminLayout>
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 mb-6">
        <StatCard title="Total"     value={counts.total}     icon="📋" accent="#0B1F2A" loading={loading} />
        <StatCard title="Reserved"  value={counts.reserved}  icon="🪑" accent="#2563eb" loading={loading} />
        <StatCard title="Seated"    value={counts.seated}    icon="🍽️" accent="#C9A24B" loading={loading} />
        <StatCard title="Completed" value={counts.completed} icon="✅" accent="#15803d" loading={loading} />
      </div>

      <div className="flex flex-wrap items-center gap-3 mb-6">
        <div className="relative flex-1 min-w-[180px] max-w-xs">
          <span className="absolute left-3 top-2.5 text-gray-400 text-sm">🔍</span>
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Guest name, email, table…"
            className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:border-[#C9A24B]" />
        </div>

        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
          className="text-sm border border-gray-300 rounded-lg px-3 py-2 bg-white focus:outline-none focus:border-[#C9A24B]">
          <option value="all">All Status</option>
          {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s[0].toUpperCase() + s.slice(1)}</option>)}
        </select>

        <input type="date" value={dateFilter} onChange={(e) => setDateFilter(e.target.value)}
          className="text-sm border border-gray-300 rounded-lg px-3 py-2 bg-white focus:outline-none focus:border-[#C9A24B]" />

        {dateFilter && (
          <button onClick={() => setDateFilter("")} className={btn.secondary}>Clear Date</button>
        )}

        <button onClick={() => setDateFilter(todayStr)} className={btn.secondary}>Today</button>

        <span className="text-sm text-gray-400 whitespace-nowrap ml-auto">{filtered.length} reservations</span>
      </div>

      <ErrorBanner>{seatError}</ErrorBanner>
      <ErrorBanner>{completeError}</ErrorBanner>
      <ErrorBanner>{cancelError}</ErrorBanner>

      {loading && <Spinner />}
      {!loading && error && (
        <ErrorBanner onRetry={() => dispatch(fetchTableReservations(fetchParams()))}>{error}</ErrorBanner>
      )}

      {!loading && !error && (
        <TableCard>
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100 text-left">
                {["Guest", "Table", "Date", "Time", "Party", "Duration", "Special Requests", "Status", "Actions"].map((h) => (
                  <Th key={h}>{h}</Th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={9}>
                  <EmptyState icon="🪑" title="No reservations found" subtitle="Try adjusting filters." />
                </td></tr>
              ) : filtered.map((r) => (
                <tr key={r._id} className="border-b border-gray-50 hover:bg-gray-50/60 transition-colors">
                  <td className="px-4 py-3">
                    <p className="font-medium text-[#0B1F2A]">{r.guest?.name || "—"}</p>
                    <p className="text-xs text-gray-400">{r.guest?.email || ""}</p>
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-medium text-[#0B1F2A]">Table {r.table?.tableNumber || "—"}</p>
                    <p className="text-xs capitalize text-gray-400">{r.table?.location?.replace("-", " ") || ""}</p>
                  </td>
                  <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{fmtDate(r.reservationDate)}</td>
                  <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{fmtTime(r.reservationTime)}</td>
                  <td className="px-4 py-3 text-gray-600">{r.partySize}</td>
                  <td className="px-4 py-3 text-gray-500 whitespace-nowrap">{r.durationMinutes ? `${r.durationMinutes} min` : "—"}</td>
                  <td className="px-4 py-3 text-gray-500 max-w-[160px] truncate">{r.specialRequests || "—"}</td>
                  <td className="px-4 py-3"><Badge value={r.status} /></td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap items-center gap-1.5">
                      {r.status === "reserved" && (
                        <button
                          onClick={() => dispatch(seatTableReservation(r._id))}
                          disabled={seatLoading === r._id}
                          className="text-xs px-2.5 py-1.5 rounded-md bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-60"
                        >
                          {seatLoading === r._id ? "…" : "Seat"}
                        </button>
                      )}
                      {r.status === "seated" && (
                        <button
                          onClick={() => dispatch(completeTableReservation(r._id))}
                          disabled={completeLoading === r._id}
                          className="text-xs px-2.5 py-1.5 rounded-md bg-green-600 text-white hover:bg-green-700 disabled:opacity-60"
                        >
                          {completeLoading === r._id ? "…" : "Complete"}
                        </button>
                      )}
                      {(r.status === "reserved" || r.status === "seated") && (
                        <button onClick={() => setConfirmCancel(r)} className={btn.ghostDanger}>Cancel</button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </TableCard>
      )}

      {confirmCancel && (
        <Modal title="Cancel Reservation?" onClose={() => setConfirmCancel(null)} size="max-w-sm"
          footer={
            <>
              <button onClick={() => setConfirmCancel(null)} className={btn.secondary}>Keep It</button>
              <button onClick={handleCancel} disabled={cancelLoading === confirmCancel._id} className={btn.danger}>
                {cancelLoading === confirmCancel._id ? "Cancelling…" : "Yes, Cancel"}
              </button>
            </>
          }>
          <p className="text-sm text-gray-500">
            Cancel the reservation for <strong>{confirmCancel.guest?.name}</strong> at Table {confirmCancel.table?.tableNumber} on {fmtDate(confirmCancel.reservationDate)} at {fmtTime(confirmCancel.reservationTime)}?
          </p>
        </Modal>
      )}
    </AdminLayout>
  );
}
