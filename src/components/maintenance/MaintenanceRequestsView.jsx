import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchMaintenanceRequests,
  reportMaintenance,
  clearReportState,
  fetchHousekeepingStaff,
  assignMaintenance,
} from "../../redux/slice/maintenance/maintenanceSlice";
import { fetchAllRooms } from "../../redux/slice/roomSlice/roomSlice";

const STATUS_COLORS = {
  open:          "bg-red-100 text-red-700",
  "in-progress": "bg-yellow-100 text-yellow-700",
  resolved:      "bg-green-100 text-green-700",
};

const FILTERS = [
  { key: "",            label: "All" },
  { key: "open",        label: "Open" },
  { key: "in-progress", label: "In Progress" },
  { key: "resolved",    label: "Resolved" },
];

export default function MaintenanceRequestsView({ hideReportForm = false }) {
  const dispatch = useDispatch();
  const {
    requests = [],
    loading, error,
    reportLoading, reportError, reportSuccess,
    staffList = [],
    assignLoading, assignError,
  } = useSelector((s) => s.maintenance);
  const { rooms } = useSelector((s) => s.rooms);

  const [statusFilter,  setStatusFilter]  = useState("");
  const [showForm,      setShowForm]      = useState(false);
  const [reportRoom,    setReportRoom]    = useState("");
  const [reportIssue,   setReportIssue]   = useState("");
  const [assigningId,   setAssigningId]   = useState(null);
  const [selectedStaff, setSelectedStaff] = useState("");

  useEffect(() => {
    dispatch(fetchAllRooms());
    dispatch(fetchHousekeepingStaff());
  }, [dispatch]);

  useEffect(() => {
    dispatch(fetchMaintenanceRequests(statusFilter));
  }, [dispatch, statusFilter]);

  useEffect(() => {
    if (reportSuccess) {
      setReportRoom("");
      setReportIssue("");
      setShowForm(false);
      dispatch(fetchMaintenanceRequests(statusFilter));
      const t = setTimeout(() => dispatch(clearReportState()), 3000);
      return () => clearTimeout(t);
    }
  }, [reportSuccess, dispatch, statusFilter]);

  const handleReport = (e) => {
    e.preventDefault();
    if (!reportRoom || !reportIssue.trim()) return;
    dispatch(reportMaintenance({ room: reportRoom, issue: reportIssue.trim() }));
  };

  const openAssign = (req) => {
    setAssigningId(req._id);
    setSelectedStaff(req.assignedTo?._id || req.assignedTo?.id || "");
  };

  const cancelAssign = () => {
    setAssigningId(null);
    setSelectedStaff("");
  };

  const handleAssign = (id) => {
    if (!selectedStaff) return;
    dispatch(assignMaintenance({ id, assignedTo: selectedStaff })).then((result) => {
      if (!result.error) cancelAssign();
    });
  };

  return (
    <div className="space-y-6">
      {/* Header row */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-serif text-[#0B1F2A]">Maintenance Requests</h2>
        {!hideReportForm && (
          <button
            onClick={() => setShowForm((v) => !v)}
            className="px-4 py-2 bg-[#0B1F2A] text-white text-sm rounded-lg hover:opacity-90 transition"
          >
            {showForm ? "Cancel" : "+ Report Issue"}
          </button>
        )}
      </div>

      {/* Report form (collapsible) */}
      {!hideReportForm && showForm && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-sm font-medium text-[#0B1F2A] mb-4">Report Maintenance Issue</h3>
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
      )}

      {/* Action errors */}
      {assignError && (
        <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-md">
          {assignError}
        </div>
      )}

      {/* Filter bar */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 flex gap-2 flex-wrap">
        {FILTERS.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setStatusFilter(key)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition capitalize ${
              statusFilter === key
                ? "bg-[#0B1F2A] text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {label}
            {key === "" && ` (${requests.length})`}
          </button>
        ))}
      </div>

      {/* Requests table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-4 border-[#C9A24B] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-md m-4">
            {error}
          </div>
        ) : requests.length === 0 ? (
          <div className="py-20 text-center">
            <p className="text-4xl mb-3">🔧</p>
            <p className="text-gray-500 font-medium">No maintenance requests</p>
            <p className="text-gray-400 text-sm mt-1">
              {statusFilter ? `No ${statusFilter} requests found` : "All clear — no issues reported"}
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
                  <th className="px-5 py-3 text-left">Assigned To</th>
                  <th className="px-5 py-3 text-center">Status</th>
                  <th className="px-5 py-3 text-left whitespace-nowrap">Date</th>
                </tr>
              </thead>
              <tbody>
                {requests.map((req) => (
                  <tr
                    key={req._id}
                    className="border-b border-gray-50 hover:bg-gray-50/60 transition-colors"
                  >
                    {/* Room */}
                    <td className="px-5 py-3">
                      <p className="font-medium text-[#0B1F2A]">
                        Room {req.room?.roomNumber ?? "—"}
                      </p>
                      <p className="text-gray-400 text-xs capitalize">{req.room?.type}</p>
                    </td>

                    {/* Issue */}
                    <td className="px-5 py-3 text-gray-700 max-w-xs">
                      <p className="line-clamp-2">{req.issue}</p>
                    </td>

                    {/* Reported By */}
                    <td className="px-5 py-3">
                      <p className="font-medium text-[#0B1F2A]">{req.reportedBy?.name || "—"}</p>
                      <p className="text-gray-400 text-xs capitalize">{req.reportedBy?.role}</p>
                    </td>

                    {/* Assigned To + Assign/Reassign control */}
                    <td className="px-5 py-3">
                      {assigningId === req._id ? (
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <select
                            value={selectedStaff}
                            onChange={(e) => setSelectedStaff(e.target.value)}
                            className="text-xs border border-gray-200 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-[#C9A24B]"
                          >
                            <option value="">Select staff…</option>
                            {staffList.map((s) => (
                              <option key={s.id || s._id} value={s.id || s._id}>
                                {s.name}
                              </option>
                            ))}
                          </select>
                          <button
                            onClick={() => handleAssign(req._id)}
                            disabled={!selectedStaff || assignLoading === req._id}
                            className="text-xs px-2 py-1 bg-[#0B1F2A] text-white rounded hover:opacity-90 disabled:opacity-50 whitespace-nowrap"
                          >
                            {assignLoading === req._id ? "…" : "Confirm"}
                          </button>
                          <button
                            onClick={cancelAssign}
                            className="text-xs text-gray-400 hover:text-gray-600 px-1"
                          >
                            ✕
                          </button>
                        </div>
                      ) : req.assignedTo ? (
                        <div>
                          <p className="font-medium text-[#0B1F2A] text-sm">{req.assignedTo.name}</p>
                          <p className="text-xs text-gray-400 capitalize">{req.assignedTo.role}</p>
                          <button
                            onClick={() => openAssign(req)}
                            className="text-xs text-[#C9A24B] hover:underline"
                          >
                            Reassign
                          </button>
                        </div>
                      ) : (
                        <div>
                          <p className="text-xs text-gray-400 mb-0.5">Unassigned</p>
                          <button
                            onClick={() => openAssign(req)}
                            className="text-xs text-[#C9A24B] hover:underline"
                          >
                            + Assign
                          </button>
                        </div>
                      )}
                    </td>

                    {/* Status badge — read-only; only housekeeping can change status */}
                    <td className="px-5 py-3 text-center">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize ${
                          STATUS_COLORS[req.status] || "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {req.status}
                      </span>
                    </td>

                    {/* Date */}
                    <td className="px-5 py-3 text-gray-500 text-xs whitespace-nowrap">
                      {new Date(req.createdAt).toLocaleDateString("en-US", {
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
    </div>
  );
}
