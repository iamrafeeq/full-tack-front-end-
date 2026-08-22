import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import HousekeepingLayout from "../../components/housekeeping/HousekeepingLayout";
import {
  reportMaintenance,
  clearReportState,
} from "../../redux/slice/maintenance/maintenanceSlice";
import { fetchPublicRooms } from "../../redux/slice/roomSlice/roomSlice";

const PRIORITY_OPTIONS = [
  { value: "low",    label: "Low",    desc: "Non-urgent, can wait",          color: "text-gray-600" },
  { value: "medium", label: "Medium", desc: "Should be addressed today",     color: "text-yellow-600" },
  { value: "high",   label: "High",   desc: "Urgent — needs immediate fix",  color: "text-red-600" },
];

export default function ReportIssue() {
  const dispatch = useDispatch();
  const { reportLoading, reportError, reportSuccess } = useSelector((s) => s.maintenance);
  const { rooms } = useSelector((s) => s.rooms);

  const [form, setForm] = useState({ room: "", issue: "", priority: "medium" });

  useEffect(() => {
    dispatch(fetchPublicRooms());
  }, [dispatch]);

  useEffect(() => {
    if (reportSuccess) {
      setForm({ room: "", issue: "", priority: "medium" });
      const t = setTimeout(() => dispatch(clearReportState()), 4000);
      return () => clearTimeout(t);
    }
  }, [reportSuccess, dispatch]);

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.room || !form.issue.trim()) return;
    dispatch(reportMaintenance({ room: form.room, issue: form.issue.trim() }));
  };

  return (
    <HousekeepingLayout title="Report Issue">
      <div className="max-w-2xl">
        {/* Page header */}
        <div className="mb-6">
          <h1 className="text-2xl font-serif text-[#0B1F2A]">Report a Maintenance Issue</h1>
          <p className="text-sm text-gray-500 mt-1">
            The maintenance team will be notified as soon as you submit.
          </p>
        </div>

        {/* Success banner */}
        {reportSuccess && (
          <div className="mb-5 flex items-start gap-3 rounded-xl bg-green-50 border border-green-200 px-5 py-4">
            <span className="text-green-500 text-lg shrink-0 mt-0.5">✓</span>
            <div>
              <p className="font-medium text-green-800 text-sm">Issue reported successfully</p>
              <p className="text-xs text-green-600 mt-0.5">The room has been flagged. The team has been notified.</p>
            </div>
          </div>
        )}

        {/* Error banner */}
        {reportError && (
          <div className="mb-5 flex items-start gap-3 rounded-xl bg-red-50 border border-red-200 px-5 py-4">
            <span className="text-red-500 text-lg shrink-0 mt-0.5">✕</span>
            <p className="text-sm text-red-700">{reportError}</p>
          </div>
        )}

        {/* Form card */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Room selector */}
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                Room <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <select
                  value={form.room}
                  onChange={set("room")}
                  required
                  className="w-full appearance-none border border-gray-200 rounded-lg px-4 py-3 text-sm bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#C9A24B]/40 focus:border-[#C9A24B] transition-colors"
                >
                  <option value="">Select a room…</option>
                  {rooms.map((r) => (
                    <option key={r._id} value={r._id}>
                      Room {r.roomNumber} — {r.type}{r.floor ? ` (Floor ${r.floor})` : ""}
                    </option>
                  ))}
                </select>
                <span className="pointer-events-none absolute right-3 top-3.5 text-gray-400 text-xs">▼</span>
              </div>
              {rooms.length === 0 && (
                <p className="mt-1 text-xs text-gray-400">Loading rooms…</p>
              )}
            </div>

            {/* Priority */}
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
                Priority
              </label>
              <div className="grid grid-cols-3 gap-3">
                {PRIORITY_OPTIONS.map(({ value, label, desc, color }) => (
                  <label
                    key={value}
                    className={`relative flex flex-col gap-1 p-3.5 rounded-xl border-2 cursor-pointer transition-all ${
                      form.priority === value
                        ? "border-[#C9A24B] bg-[#C9A24B]/5"
                        : "border-gray-100 hover:border-gray-200 bg-gray-50"
                    }`}
                  >
                    <input
                      type="radio"
                      name="priority"
                      value={value}
                      checked={form.priority === value}
                      onChange={set("priority")}
                      className="sr-only"
                    />
                    <span className={`text-sm font-semibold ${form.priority === value ? "text-[#C9A24B]" : color}`}>
                      {label}
                    </span>
                    <span className="text-[11px] text-gray-400 leading-tight">{desc}</span>
                    {form.priority === value && (
                      <span className="absolute top-2.5 right-2.5 w-4 h-4 rounded-full bg-[#C9A24B] flex items-center justify-center text-white text-[9px] font-bold">✓</span>
                    )}
                  </label>
                ))}
              </div>
            </div>

            {/* Issue description */}
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                Issue Description <span className="text-red-400">*</span>
              </label>
              <textarea
                value={form.issue}
                onChange={set("issue")}
                required
                rows={5}
                placeholder="Describe the issue in detail — what's broken, where it is, what you noticed…"
                className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm bg-white text-gray-800 placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-[#C9A24B]/40 focus:border-[#C9A24B] resize-none transition-colors"
              />
              <p className="mt-1 text-xs text-gray-400 text-right">
                {form.issue.length} characters
              </p>
            </div>

            {/* Submit */}
            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={() => setForm({ room: "", issue: "", priority: "medium" })}
                className="text-sm text-gray-400 hover:text-gray-600 transition-colors"
              >
                Clear form
              </button>
              <button
                type="submit"
                disabled={reportLoading || !form.room || !form.issue.trim()}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-[#0B1F2A] text-white text-sm font-medium hover:opacity-90 disabled:opacity-50 transition-opacity"
              >
                {reportLoading ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Submitting…
                  </>
                ) : (
                  <>📋 Submit Report</>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </HousekeepingLayout>
  );
}
