
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchMaintenanceRequests,
  reportMaintenance,
  updateMaintenanceStatus,
  fetchHousekeepingStaff,
  assignMaintenance,
  deleteMaintenance,
  clearReportState,
} from "../../redux/slice/maintenance/maintenanceSlice";
import { fetchPublicRooms } from "../../redux/slice/roomSlice/roomSlice";
import {
  StatCard, TableCard, Th, Badge, Pills, Spinner, ErrorBanner, SuccessBanner,
  EmptyState, Modal, btn, input, label, fmtDate,
} from "../admin/AdminUI";

const TABS = [
  { value: "", label: "All" },
  { value: "open", label: "Open" },
  { value: "in-progress", label: "In Progress" },
  { value: "resolved", label: "Resolved" },
];

const STATUS_OPTIONS = ["open", "in-progress", "resolved"];

export default function Maintenance() {
  const dispatch = useDispatch();
  const {
    requests, loading, error,
    reportLoading, reportError, reportSuccess,
    updateLoading, updateError,
    staffList, staffLoading,
    assignLoading, assignError,
    deleteLoading, deleteError,
  } = useSelector((s) => s.maintenance);
  const { rooms } = useSelector((s) => s.rooms);

  const [statusTab, setStatusTab] = useState("");
  const [form, setForm] = useState({ room: "", issue: "" });
  const [assignTarget,    setAssignTarget]    = useState(null);
  const [assignee,        setAssignee]        = useState("");
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);

  useEffect(() => {
    dispatch(fetchPublicRooms());
    dispatch(fetchHousekeepingStaff());
  }, [dispatch]);

  useEffect(() => {
    dispatch(fetchMaintenanceRequests(statusTab));
  }, [dispatch, statusTab]);

  // Clear the success banner after 3s and refresh the list
  useEffect(() => {
    if (!reportSuccess) return;
    setForm({ room: "", issue: "" });
    dispatch(fetchMaintenanceRequests(statusTab));
    const id = setTimeout(() => dispatch(clearReportState()), 3000);
    return () => clearTimeout(id);
  }, [reportSuccess, dispatch, statusTab]);

  const submit = (e) => {
    e.preventDefault();
    if (!form.room || !form.issue.trim()) return;
    dispatch(reportMaintenance({ room: form.room, issue: form.issue.trim() }));
  };

  const counts = {
    open: requests.filter((r) => r.status === "open").length,
    progress: requests.filter((r) => r.status === "in-progress").length,
    resolved: requests.filter((r) => r.status === "resolved").length,
  };

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-6">
        <StatCard title="Open" value={counts.open} icon="🚨" accent="#dc2626" loading={loading} />
        <StatCard title="In Progress" value={counts.progress} icon="🔧" accent="#a16207" loading={loading} />
        <StatCard title="Resolved" value={counts.resolved} icon="✅" accent="#15803d" loading={loading} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[340px_1fr] gap-6 items-start">
        {/* Report form */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="font-serif text-lg text-[#0B1F2A]">Report New Issue</h3>
          <p className="text-[13px] text-gray-500 mt-1.5 mb-5">
            Housekeeping and reception see it the moment you submit.
          </p>

          <SuccessBanner>{reportSuccess ? "Issue reported. The team has been notified." : null}</SuccessBanner>
          <ErrorBanner>{reportError}</ErrorBanner>

          <form onSubmit={submit} className="space-y-4">
            <div>
              <label className={label}>Room</label>
              <select
                value={form.room}
                onChange={(e) => setForm((f) => ({ ...f, room: e.target.value }))}
                required
                className={input}
              >
                <option value="">Select a room…</option>
                {rooms.map((r) => (
                  <option key={r._id} value={r._id}>
                    Room {r.roomNumber} — {r.type}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className={label}>Issue</label>
              <textarea
                rows={4}
                value={form.issue}
                onChange={(e) => setForm((f) => ({ ...f, issue: e.target.value }))}
                placeholder="What needs fixing?"
                required
                className={`${input} resize-none`}
              />
            </div>

            <button type="submit" disabled={reportLoading} className={`${btn.primary} w-full`}>
              {reportLoading ? "Submitting…" : "Submit Request"}
            </button>
          </form>
        </div>

        {/* Requests table */}
        <div>
          <div className="flex flex-wrap items-center gap-3 mb-4">
            <Pills options={TABS} value={statusTab} onChange={setStatusTab} />
            <span className="text-sm text-gray-400 ml-auto">
              {requests.length} request{requests.length === 1 ? "" : "s"}
            </span>
          </div>

          <ErrorBanner>{updateError || assignError || deleteError}</ErrorBanner>

          {loading && <Spinner />}
          {!loading && error && (
            <ErrorBanner onRetry={() => dispatch(fetchMaintenanceRequests(statusTab))}>{error}</ErrorBanner>
          )}

          {!loading && !error && (
            <TableCard>
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100 text-left">
                    {["Room", "Issue", "Status", "Reported by", "Assigned to", "Reported", "Actions"].map((h) => (
                      <Th key={h}>{h}</Th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {requests.length === 0 ? (
                    <tr>
                      <td colSpan={7}>
                        <EmptyState icon="🔧" title="Nothing to fix" subtitle="No maintenance requests for this filter." />
                      </td>
                    </tr>
                  ) : (
                    requests.map((r) => (
                      <tr key={r._id} className="border-b border-gray-50 hover:bg-gray-50/60 transition-colors">
                        <td className="px-4 py-3.5 font-semibold text-[#0B1F2A] whitespace-nowrap">
                          {r.room?.roomNumber ? `Room ${r.room.roomNumber}` : "—"}
                        </td>
                        <td className="px-4 py-3.5 text-gray-600 max-w-xs">{r.issue}</td>
                        <td className="px-4 py-3.5">
                          <select
                            value={r.status}
                            onChange={(e) => dispatch(updateMaintenanceStatus({ id: r._id, status: e.target.value }))}
                            disabled={updateLoading === r._id}
                            className={`text-xs px-2.5 py-1 rounded-full border-0 font-semibold cursor-pointer focus:outline-none ${
                              r.status === "open" ? "bg-red-100 text-red-600"
                              : r.status === "in-progress" ? "bg-yellow-100 text-yellow-700"
                              : "bg-green-100 text-green-700"
                            }`}
                          >
                            {STATUS_OPTIONS.map((s) => (
                              <option key={s} value={s}>{s.replace("-", " ")}</option>
                            ))}
                          </select>
                        </td>
                        <td className="px-4 py-3.5 text-gray-500 whitespace-nowrap">{r.reportedBy?.name || "—"}</td>
                        <td className="px-4 py-3.5 text-gray-500 whitespace-nowrap">
                          {r.assignedTo?.name || <span className="text-gray-300">Unassigned</span>}
                        </td>
                        <td className="px-4 py-3.5 text-xs text-gray-400 whitespace-nowrap">{fmtDate(r.createdAt)}</td>
                        <td className="px-4 py-3.5">
                          <div className="flex items-center gap-2 flex-wrap">
                            <button
                              onClick={() => { setAssignTarget(r); setAssignee(r.assignedTo?._id || ""); }}
                              disabled={assignLoading === r._id}
                              className={btn.ghostGold}
                            >
                              {r.assignedTo ? "Reassign" : "Assign"}
                            </button>
                            {r.status === "resolved" && (
                              deleteConfirmId === r._id ? (
                                <span className="flex items-center gap-1">
                                  <button
                                    onClick={() => dispatch(deleteMaintenance(r._id)).then((res) => { if (!res.error) setDeleteConfirmId(null); })}
                                    disabled={deleteLoading === r._id}
                                    className="text-xs px-2.5 py-1 rounded bg-red-600 text-white hover:bg-red-700 disabled:opacity-60 transition-colors"
                                  >
                                    {deleteLoading === r._id ? "…" : "Yes"}
                                  </button>
                                  <button
                                    onClick={() => setDeleteConfirmId(null)}
                                    className="text-xs px-2.5 py-1 rounded border border-gray-300 text-gray-500 hover:bg-gray-50 transition-colors"
                                  >
                                    No
                                  </button>
                                </span>
                              ) : (
                                <button
                                  onClick={() => setDeleteConfirmId(r._id)}
                                  className="text-xs px-2.5 py-1 rounded border border-red-200 text-red-500 hover:bg-red-50 transition-colors"
                                >
                                  Delete
                                </button>
                              )
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </TableCard>
          )}
        </div>
      </div>

      {assignTarget && (
        <Modal
          title={`Assign Room ${assignTarget.room?.roomNumber || ""}`}
          onClose={() => setAssignTarget(null)}
          footer={
            <>
              <button onClick={() => setAssignTarget(null)} className={btn.secondary}>Cancel</button>
              <button
                onClick={() =>
                  dispatch(assignMaintenance({ id: assignTarget._id, assignedTo: assignee })).then(
                    (r) => !r.error && setAssignTarget(null)
                  )
                }
                disabled={!assignee || assignLoading === assignTarget._id}
                className={btn.primary}
              >
                {assignLoading === assignTarget._id ? "Assigning…" : "Assign"}
              </button>
            </>
          }
        >
          <p className="text-sm text-gray-500">{assignTarget.issue}</p>
          <div>
            <label className={label}>Housekeeping staff</label>
            <select value={assignee} onChange={(e) => setAssignee(e.target.value)} className={input}>
              <option value="">{staffLoading ? "Loading staff…" : "Select a team member…"}</option>
              {staffList.map((st) => (
                <option key={st._id} value={st._id}>{st.name}</option>
              ))}
            </select>
          </div>
        </Modal>
      )}
    </>
  );
}
