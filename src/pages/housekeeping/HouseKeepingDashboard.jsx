import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import HousekeepingLayout from "../../components/housekeeping/HousekeepingLayout";
import {
  fetchCleaningRooms,
  markRoomClean,
} from "../../redux/slice/housekeeping/housekeepingSlice";
import {
  reportMaintenance,
  clearReportState,
  fetchMyTasks,
  updateMaintenanceStatus,
} from "../../redux/slice/maintenance/maintenanceSlice";
import { fetchAllRooms } from "../../redux/slice/roomSlice/roomSlice";

const STATUS_COLORS = {
  open:          "bg-red-100 text-red-700",
  "in-progress": "bg-yellow-100 text-yellow-700",
  resolved:      "bg-green-100 text-green-700",
};

const TASK_FILTERS = [
  { key: "",            label: "All" },
  { key: "open",        label: "Open" },
  { key: "in-progress", label: "In Progress" },
  { key: "resolved",    label: "Resolved" },
];

export default function HouseKeepingDashboard() {
  const dispatch = useDispatch();
  const { cleaningRooms, loading, error, markLoading, markError } =
    useSelector((s) => s.housekeeping);
  const {
    reportLoading, reportError, reportSuccess,
    myTasks = [],
    myTasksLoading, myTasksError,
    updateLoading,
  } = useSelector((s) => s.maintenance);
  const { rooms } = useSelector((s) => s.rooms);

  const [reportRoom,  setReportRoom]  = useState("");
  const [reportIssue, setReportIssue] = useState("");
  const [taskFilter,  setTaskFilter]  = useState("");

  useEffect(() => {
    dispatch(fetchCleaningRooms());
    dispatch(fetchAllRooms());
  }, [dispatch]);

  useEffect(() => {
    dispatch(fetchMyTasks(taskFilter));
  }, [dispatch, taskFilter]);

  useEffect(() => {
    if (reportSuccess) {
      setReportRoom("");
      setReportIssue("");
      const t = setTimeout(() => dispatch(clearReportState()), 3000);
      return () => clearTimeout(t);
    }
  }, [reportSuccess, dispatch]);

  const handleReport = (e) => {
    e.preventDefault();
    if (!reportRoom || !reportIssue.trim()) return;
    dispatch(reportMaintenance({ room: reportRoom, issue: reportIssue.trim() }));
  };

  return (
    <HousekeepingLayout title="Dashboard">
      <div className="space-y-8">

        {/* ── Rooms to Clean ─────────────────────────────────────── */}
        <section>
          <h2 className="text-lg font-serif text-[#0B1F2A] mb-4">Rooms to Clean</h2>

          {markError && (
            <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-md mb-4">
              {markError}
            </div>
          )}

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            {loading ? (
              <div className="flex justify-center py-20">
                <div className="w-8 h-8 border-4 border-[#C9A24B] border-t-transparent rounded-full animate-spin" />
              </div>
            ) : error ? (
              <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-md m-4">
                {error}
              </div>
            ) : cleaningRooms.length === 0 ? (
              <div className="py-20 text-center">
                <p className="text-4xl mb-3">✅</p>
                <p className="text-gray-500 font-medium">No rooms need cleaning right now</p>
                <p className="text-gray-400 text-sm mt-1">All rooms are clean and ready</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-100 bg-gray-50 text-xs uppercase tracking-wide text-gray-400">
                      <th className="px-5 py-3 text-left">Room #</th>
                      <th className="px-5 py-3 text-left">Type</th>
                      <th className="px-5 py-3 text-left">Floor</th>
                      <th className="px-5 py-3 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {cleaningRooms.map((room) => (
                      <tr
                        key={room._id}
                        className="border-b border-gray-50 hover:bg-gray-50/60 transition-colors"
                      >
                        <td className="px-5 py-3 font-medium text-[#0B1F2A]">
                          {room.roomNumber}
                        </td>
                        <td className="px-5 py-3 capitalize text-gray-600">{room.type}</td>
                        <td className="px-5 py-3 text-gray-500">{room.floor ?? "—"}</td>
                        <td className="px-5 py-3 text-center">
                          <button
                            onClick={() => dispatch(markRoomClean(room._id))}
                            disabled={markLoading === room._id}
                            className="px-4 py-1.5 bg-green-600 text-white text-xs font-medium rounded-lg hover:bg-green-700 disabled:opacity-60 transition"
                          >
                            {markLoading === room._id ? "Marking…" : "Mark Clean"}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </section>

        {/* ── My Maintenance Tasks ────────────────────────────────── */}
        <section>
          <h2 className="text-lg font-serif text-[#0B1F2A] mb-4">My Maintenance Tasks</h2>

          {/* Filter bar */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 flex gap-2 flex-wrap mb-4">
            {TASK_FILTERS.map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setTaskFilter(key)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition capitalize ${
                  taskFilter === key
                    ? "bg-[#0B1F2A] text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {label}
                {key === "" && ` (${myTasks.length})`}
              </button>
            ))}
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            {myTasksLoading ? (
              <div className="flex justify-center py-20">
                <div className="w-8 h-8 border-4 border-[#C9A24B] border-t-transparent rounded-full animate-spin" />
              </div>
            ) : myTasksError ? (
              <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-md m-4">
                {myTasksError}
              </div>
            ) : myTasks.length === 0 ? (
              <div className="py-20 text-center">
                <p className="text-4xl mb-3">🔧</p>
                <p className="text-gray-500 font-medium">No tasks assigned to you</p>
                <p className="text-gray-400 text-sm mt-1">
                  {taskFilter
                    ? `No ${taskFilter} tasks found`
                    : "You have no maintenance tasks right now"}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-100 bg-gray-50 text-xs uppercase tracking-wide text-gray-400">
                      <th className="px-5 py-3 text-left">Room</th>
                      <th className="px-5 py-3 text-left">Issue</th>
                      <th className="px-5 py-3 text-left">Reported By</th>
                      <th className="px-5 py-3 text-center">Status</th>
                      <th className="px-5 py-3 text-left whitespace-nowrap">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {myTasks.map((task) => (
                      <tr
                        key={task._id}
                        className="border-b border-gray-50 hover:bg-gray-50/60 transition-colors"
                      >
                        <td className="px-5 py-3">
                          <p className="font-medium text-[#0B1F2A]">
                            Room {task.room?.roomNumber ?? "—"}
                          </p>
                          <p className="text-gray-400 text-xs capitalize">{task.room?.type}</p>
                        </td>
                        <td className="px-5 py-3 text-gray-700 max-w-xs">
                          <p className="line-clamp-2">{task.issue}</p>
                        </td>
                        <td className="px-5 py-3">
                          <p className="font-medium text-[#0B1F2A]">{task.reportedBy?.name || "—"}</p>
                          <p className="text-gray-400 text-xs capitalize">{task.reportedBy?.role}</p>
                        </td>
                        <td className="px-5 py-3 text-center">
                          <div className="flex flex-col items-center gap-1">
                            <span
                              className={`px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize ${
                                STATUS_COLORS[task.status] || "bg-gray-100 text-gray-600"
                              }`}
                            >
                              {task.status}
                            </span>
                            <select
                              value={task.status}
                              onChange={(e) =>
                                dispatch(updateMaintenanceStatus({ id: task._id, status: e.target.value }))
                              }
                              disabled={updateLoading === task._id}
                              className="text-xs border border-gray-200 rounded px-1 py-0.5 text-gray-600 focus:outline-none focus:ring-1 focus:ring-[#C9A24B] disabled:opacity-50 cursor-pointer"
                            >
                              <option value="open">Open</option>
                              <option value="in-progress">In Progress</option>
                              <option value="resolved">Resolved</option>
                            </select>
                          </div>
                        </td>
                        <td className="px-5 py-3 text-gray-500 text-xs whitespace-nowrap">
                          {new Date(task.createdAt).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </section>

        {/* ── Report Maintenance Issue ────────────────────────────── */}
        <section>
          <h2 className="text-lg font-serif text-[#0B1F2A] mb-4">Report Maintenance Issue</h2>
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            {reportError && (
              <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-md mb-4">
                {reportError}
              </div>
            )}
            {reportSuccess && (
              <div className="bg-green-50 border border-green-200 text-green-700 text-sm px-4 py-3 rounded-md mb-4">
                Issue reported successfully. The room has been flagged for maintenance.
              </div>
            )}
            <form onSubmit={handleReport} className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-xs text-gray-500 mb-1">Room</label>
                <select
                  value={reportRoom}
                  onChange={(e) => setReportRoom(e.target.value)}
                  required
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#C9A24B]"
                >
                  <option value="">Select a room</option>
                  {rooms.map((r) => (
                    <option key={r._id} value={r._id}>
                      Room {r.roomNumber} — {r.type}
                    </option>
                  ))}
                </select>
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs text-gray-500 mb-1">Issue Description</label>
                <textarea
                  value={reportIssue}
                  onChange={(e) => setReportIssue(e.target.value)}
                  required
                  rows={3}
                  placeholder="Describe the issue in detail…"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#C9A24B] resize-none"
                />
              </div>
              <div className="sm:col-span-2 flex justify-end">
                <button
                  type="submit"
                  disabled={reportLoading}
                  className="px-5 py-2 bg-[#C9A24B] text-[#0B1F2A] font-medium text-sm rounded-lg hover:opacity-90 disabled:opacity-60"
                >
                  {reportLoading ? "Submitting…" : "Submit Report"}
                </button>
              </div>
            </form>
          </div>
        </section>

      </div>
    </HousekeepingLayout>
  );
}
