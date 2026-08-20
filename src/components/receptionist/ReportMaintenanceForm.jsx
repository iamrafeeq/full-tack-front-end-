import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  reportMaintenance,
  clearReportState,
} from "../../redux/slice/maintenance/maintenanceSlice";
import { Card, ErrBanner } from "./shared";

export default function ReportMaintenanceForm() {
  const dispatch = useDispatch();
  const { rooms } = useSelector((s) => s.rooms);
  const { reportLoading, reportError, reportSuccess } = useSelector(
    (s) => s.maintenance
  );

  const [showForm,  setShowForm]  = useState(false);
  const [room,      setRoom]      = useState("");
  const [issue,     setIssue]     = useState("");

  useEffect(() => {
    if (reportSuccess) {
      setRoom("");
      setIssue("");
      setShowForm(false);
      const t = setTimeout(() => dispatch(clearReportState()), 4000);
      return () => clearTimeout(t);
    }
  }, [reportSuccess, dispatch]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!room || !issue.trim()) return;
    dispatch(reportMaintenance({ room, issue: issue.trim() }));
  };

  const openForm = () => {
    dispatch(clearReportState());
    setShowForm(true);
  };

  return (
    <Card
      title="Report Maintenance Issue"
      icon="🔧"
      action={
        <button
          onClick={showForm ? () => setShowForm(false) : openForm}
          className="text-xs px-3 py-1.5 rounded-md border border-[#C9A24B] text-[#C9A24B] hover:bg-[#C9A24B]/10 transition"
        >
          {showForm ? "Close" : "+ Report Issue"}
        </button>
      }
    >
      <div className="px-6 py-4">
        {reportSuccess && (
          <div className="mb-4 px-4 py-2.5 bg-green-50 border border-green-200 rounded-md text-sm text-green-700">
            Issue reported successfully. The room has been flagged for maintenance.
          </div>
        )}

        {!showForm ? (
          <p className="text-sm text-gray-400 text-center py-2">
            Click "+ Report Issue" to flag a room for maintenance.
          </p>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {reportError && <ErrBanner msg={reportError} />}

            <div>
              <label className="block text-xs uppercase tracking-wide text-gray-500 mb-1.5 font-medium">
                Room *
              </label>
              <select
                required
                value={room}
                onChange={(e) => setRoom(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm bg-white focus:outline-none focus:border-[#C9A24B]"
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
              <label className="block text-xs uppercase tracking-wide text-gray-500 mb-1.5 font-medium">
                Issue Description *
              </label>
              <textarea
                required
                rows={3}
                value={issue}
                onChange={(e) => setIssue(e.target.value)}
                placeholder="Describe the issue in detail…"
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-[#C9A24B] resize-none"
              />
            </div>

            <div className="flex justify-end gap-3 pt-1">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="border border-gray-300 text-sm px-5 py-2 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={reportLoading}
                className="bg-[#C9A24B] text-[#0B1F2A] text-sm font-semibold px-5 py-2 rounded-lg hover:opacity-90 disabled:opacity-60"
              >
                {reportLoading ? "Submitting…" : "Submit Report"}
              </button>
            </div>
          </form>
        )}
      </div>
    </Card>
  );
}
