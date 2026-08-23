import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchTableReservations,
  seatTableReservation,
  completeTableReservation,
  cancelTableReservation,
  clearActionErrors,
} from "../../redux/slice/tableReservations/tableReservationSlice";
import ReceptionistLayout from "../../components/receptionist/ReceptionistLayout";
import { Card, THead, Spinner, ErrBanner, Empty, fmtDate } from "../../components/receptionist/shared";

const STATUS_STYLES = {
  reserved:  "bg-blue-100 text-blue-700",
  seated:    "bg-green-100 text-green-700",
  completed: "bg-gray-100 text-gray-600",
  cancelled: "bg-red-100 text-red-600",
};

const fmtTime = (t) => {
  if (!t) return "—";
  const [h, m] = t.split(":").map(Number);
  const ampm = h >= 12 ? "PM" : "AM";
  return `${h % 12 || 12}:${String(m).padStart(2, "0")} ${ampm}`;
};

const todayStr = () => new Date().toISOString().split("T")[0];

export default function ReceptionistTableReservations() {
  const dispatch = useDispatch();
  const {
    reservations, loading, error,
    seatLoading, seatError,
    completeLoading, completeError,
    cancelLoading, cancelError,
  } = useSelector((s) => s.tableReservations);

  const [dateFilter, setDateFilter] = useState(todayStr());
  const [statusFilter, setStatusFilter] = useState("all");

  const fetch = () => {
    const p = {};
    if (dateFilter)              p.date   = dateFilter;
    if (statusFilter !== "all")  p.status = statusFilter;
    dispatch(fetchTableReservations(p));
  };

  useEffect(() => { fetch(); }, [dateFilter, statusFilter]);
  useEffect(() => () => dispatch(clearActionErrors()), [dispatch]);

  const filtered = reservations.filter((r) => {
    return statusFilter === "all" || r.status === statusFilter;
  });

  return (
    <ReceptionistLayout title="Table Reservations">
      <div className="flex flex-wrap gap-3 mb-6 items-center">
        <input type="date" value={dateFilter} onChange={(e) => setDateFilter(e.target.value)}
          className="text-sm border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:border-[#C9A24B]" />
        <button onClick={() => setDateFilter(todayStr())}
          className="text-sm border border-gray-200 rounded-lg px-3 py-2 hover:bg-gray-50">Today</button>
        <button onClick={() => setDateFilter("")}
          className="text-sm border border-gray-200 rounded-lg px-3 py-2 hover:bg-gray-50">All Dates</button>

        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
          className="text-sm border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:border-[#C9A24B]">
          <option value="all">All Status</option>
          <option value="reserved">Reserved</option>
          <option value="seated">Seated</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>

        <span className="text-sm text-gray-400 ml-auto">{filtered.length} reservation{filtered.length !== 1 ? "s" : ""}</span>
      </div>

      {seatError    && <ErrBanner msg={seatError} />}
      {completeError && <ErrBanner msg={completeError} />}
      {cancelError  && <ErrBanner msg={cancelError} />}

      <Card title="Table Reservations" icon="🪑" count={filtered.length}>
        {loading ? (
          <Spinner />
        ) : error ? (
          <div className="px-6 py-4"><ErrBanner msg={error} /></div>
        ) : filtered.length === 0 ? (
          <Empty msg="No reservations for the selected filters." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <THead cols={["Guest", "Table", "Date", "Time", "Party", "Status", "Actions"]} />
              <tbody>
                {filtered.map((r) => (
                  <tr key={r._id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
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
                    <td className="px-4 py-3">
                      <span className={`text-xs font-medium px-2.5 py-1 rounded-full capitalize ${STATUS_STYLES[r.status]}`}>
                        {r.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2 flex-wrap">
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
                          <button
                            onClick={() => dispatch(cancelTableReservation(r._id))}
                            disabled={cancelLoading === r._id}
                            className="text-xs px-2.5 py-1.5 rounded-md border border-red-200 text-red-500 hover:bg-red-50 disabled:opacity-60"
                          >
                            {cancelLoading === r._id ? "…" : "Cancel"}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </ReceptionistLayout>
  );
}
