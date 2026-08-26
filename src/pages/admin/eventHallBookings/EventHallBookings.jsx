import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchEventHallBookings,
  confirmEventHallBooking,
  startEventHallBooking,
  completeEventHallBooking,
  cancelEventHallBooking,
  clearActionErrors,
} from "../../../redux/slice/eventHallBookings/eventHallBookingSlice";
import AdminLayout from "../../../components/admin/AdminLayout";
import {
  StatCard, TableCard, Th, Badge, EmptyState, Modal, btn, fmtDate,
} from "../../../components/admin/AdminUI";
import Spinner from "../../../components/Spinner";
import SkeletonRow from "../../../components/SkeletonRow";
import { notifySuccess, notifyError } from "../../../utils/toast";

const STATUS_OPTIONS    = ["booked", "confirmed", "in-progress", "completed", "cancelled"];
const PAYMENT_COLORS    = { pending: "bg-orange-100 text-orange-700", paid: "bg-green-100 text-green-700" };
const EVENT_TYPE_LABELS = {
  wedding: "Wedding", conference: "Conference", birthday: "Birthday",
  corporate: "Corporate", other: "Other",
};

const fmtTime = (t) => {
  if (!t) return "—";
  const [h, m] = t.split(":").map(Number);
  const ampm = h >= 12 ? "PM" : "AM";
  return `${h % 12 || 12}:${String(m).padStart(2, "0")} ${ampm}`;
};

const fmt$ = (n) => `$${Number(n || 0).toLocaleString("en-US", { minimumFractionDigits: 2 })}`;

export default function AdminEventHallBookings() {
  const dispatch = useDispatch();
  const {
    bookings, total, loading, error,
    confirmLoading, confirmError,
    startLoading, startError,
    completeLoading, completeError,
    cancelLoading, cancelError,
  } = useSelector((s) => s.eventHallBookings);

  const [search,        setSearch]        = useState("");
  const [statusFilter,  setStatusFilter]  = useState("all");
  const [dateFilter,    setDateFilter]    = useState("");
  const [confirmCancel, setConfirmCancel] = useState(null);

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

  useEffect(() => { if (confirmError) notifyError(confirmError); }, [confirmError]);
  useEffect(() => { if (startError) notifyError(startError); }, [startError]);
  useEffect(() => { if (completeError) notifyError(completeError); }, [completeError]);
  useEffect(() => { if (cancelError) notifyError(cancelError); }, [cancelError]);
  useEffect(() => { if (error) notifyError(error); }, [error]);

  const filtered = bookings.filter((b) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      b.guest?.name?.toLowerCase().includes(q) ||
      b.guest?.email?.toLowerCase().includes(q) ||
      b.hall?.hallName?.toLowerCase().includes(q) ||
      b.eventType?.toLowerCase().includes(q)
    );
  });

  const counts = {
    total:      total || bookings.length,
    booked:     bookings.filter((b) => b.status === "booked").length,
    confirmed:  bookings.filter((b) => b.status === "confirmed").length,
    inProgress: bookings.filter((b) => b.status === "in-progress").length,
    completed:  bookings.filter((b) => b.status === "completed").length,
  };

  const handleCancel = () => {
    if (!confirmCancel) return;
    dispatch(cancelEventHallBooking(confirmCancel._id)).then((res) => {
      if (!res.error) {
        notifySuccess("Event hall booking cancelled.");
        setConfirmCancel(null);
      }
    });
  };

  const handleConfirm = (id) =>
    dispatch(confirmEventHallBooking(id)).then((res) => {
      if (!res.error) notifySuccess("Booking confirmed.");
    });

  const handleStart = (id) =>
    dispatch(startEventHallBooking(id)).then((res) => {
      if (!res.error) notifySuccess("Event started.");
    });

  const handleComplete = (id) =>
    dispatch(completeEventHallBooking(id)).then((res) => {
      if (!res.error) notifySuccess("Event completed.");
    });

  const todayStr = new Date().toISOString().split("T")[0];

  return (
    <AdminLayout>
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-4 mb-6">
        <StatCard title="Total"       value={counts.total}      icon="📋" accent="#0B1F2A" loading={loading} />
        <StatCard title="Booked"      value={counts.booked}     icon="📅" accent="#2563eb" loading={loading} />
        <StatCard title="Confirmed"   value={counts.confirmed}  icon="✅" accent="#C9A24B" loading={loading} />
        <StatCard title="In Progress" value={counts.inProgress} icon="🎉" accent="#7c3aed" loading={loading} />
        <StatCard title="Completed"   value={counts.completed}  icon="🏆" accent="#15803d" loading={loading} />
      </div>

      <div className="flex flex-wrap items-center gap-3 mb-6">
        <div className="relative flex-1 min-w-[180px] max-w-xs">
          <span className="absolute left-3 top-2.5 text-gray-400 text-sm">🔍</span>
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Guest, hall, event type…"
            className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:border-[#C9A24B]" />
        </div>

        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
          className="text-sm border border-gray-300 rounded-lg px-3 py-2 bg-white focus:outline-none focus:border-[#C9A24B]">
          <option value="all">All Status</option>
          {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s[0].toUpperCase() + s.slice(1)}</option>)}
        </select>

        <input type="date" value={dateFilter} onChange={(e) => setDateFilter(e.target.value)}
          className="w-full sm:w-auto text-sm border border-gray-300 rounded-lg px-3 py-2 bg-white focus:outline-none focus:border-[#C9A24B]" />

        {dateFilter && (
          <button onClick={() => setDateFilter("")} className={btn.secondary}>Clear Date</button>
        )}
        <button onClick={() => setDateFilter(todayStr)} className={btn.secondary}>Today</button>

        <span className="text-sm text-gray-400 whitespace-nowrap ml-auto">{filtered.length} bookings</span>
      </div>

      <TableCard>
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100 text-left">
                {["Guest", "Hall", "Event Date", "Time", "Type", "Guests", "Total", "Payment", "Status", "Actions"].map((h) => (
                  <Th key={h}>{h}</Th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading
                ? Array.from({ length: 5 }, (_, i) => <SkeletonRow key={i} cols={10} />)
                : filtered.length === 0 ? (
                <tr><td colSpan={10}>
                  <EmptyState icon="🏛️" title="No event hall bookings found" subtitle="Try adjusting filters." />
                </td></tr>
              ) : filtered.map((b) => {
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
                    <td className="px-4 py-3 text-gray-600 capitalize">{EVENT_TYPE_LABELS[b.eventType] || b.eventType}</td>
                    <td className="px-4 py-3 text-gray-600">{b.guestCount}</td>
                    <td className="px-4 py-3 font-medium text-[#0B1F2A] whitespace-nowrap">{fmt$(b.totalAmount)}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full capitalize ${PAYMENT_COLORS[b.paymentStatus] || "bg-gray-100 text-gray-600"}`}>
                        {b.paymentStatus || "pending"}
                      </span>
                    </td>
                    <td className="px-4 py-3"><Badge value={b.status} /></td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap items-center gap-1.5">
                        {b.status === "booked" && (
                          <button
                            onClick={() => handleConfirm(b._id)}
                            disabled={confirmLoading === b._id}
                            className="text-xs px-2.5 py-1.5 rounded-md bg-[#C9A24B] text-[#0B1F2A] font-medium hover:opacity-90 disabled:opacity-60 inline-flex items-center justify-center"
                          >
                            {confirmLoading === b._id ? <Spinner size="sm" color="#0B1F2A" /> : "Confirm"}
                          </button>
                        )}
                        {b.status === "confirmed" && (
                          <div className="relative group">
                            <button
                              onClick={() => !paymentPending && handleStart(b._id)}
                              disabled={startLoading === b._id || paymentPending}
                              className={`text-xs px-2.5 py-1.5 rounded-md font-medium transition-colors inline-flex items-center justify-center ${
                                paymentPending
                                  ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                                  : "bg-purple-600 text-white hover:bg-purple-700 disabled:opacity-60"
                              }`}
                            >
                              {startLoading === b._id ? <Spinner size="sm" color="white" /> : "Start Event"}
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
                            onClick={() => handleComplete(b._id)}
                            disabled={completeLoading === b._id}
                            className="text-xs px-2.5 py-1.5 rounded-md bg-green-600 text-white hover:bg-green-700 disabled:opacity-60 inline-flex items-center justify-center"
                          >
                            {completeLoading === b._id ? <Spinner size="sm" color="white" /> : "Complete"}
                          </button>
                        )}
                        {(b.status === "booked" || b.status === "confirmed") && (
                          <button onClick={() => setConfirmCancel(b)} className={btn.ghostDanger}>Cancel</button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
      </TableCard>

      {confirmCancel && (
        <Modal title="Cancel Event Hall Booking?" onClose={() => setConfirmCancel(null)} size="max-w-sm"
          footer={
            <>
              <button onClick={() => setConfirmCancel(null)} className={btn.secondary}>Keep It</button>
              <button onClick={handleCancel} disabled={cancelLoading === confirmCancel._id} className={`${btn.danger} inline-flex items-center gap-1.5 justify-center`}>
                {cancelLoading === confirmCancel._id ? <><Spinner size="sm" color="white" /> Cancelling…</> : "Yes, Cancel"}
              </button>
            </>
          }>
          <p className="text-sm text-gray-500">
            Cancel the booking for <strong>{confirmCancel.guest?.name}</strong> at{" "}
            <strong>{confirmCancel.hall?.hallName}</strong> on {fmtDate(confirmCancel.eventDate)}?
          </p>
        </Modal>
      )}
    </AdminLayout>
  );
}
