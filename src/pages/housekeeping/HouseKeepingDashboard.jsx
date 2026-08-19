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
} from "../../redux/slice/maintenance/maintenanceSlice";
import { fetchAllRooms } from "../../redux/slice/roomSlice/roomSlice";

export default function HouseKeepingDashboard() {
  const dispatch = useDispatch();
  const { cleaningRooms, loading, error, markLoading, markError } =
    useSelector((s) => s.housekeeping);
  const { reportLoading, reportError, reportSuccess } =
    useSelector((s) => s.maintenance);
  const { rooms } = useSelector((s) => s.rooms);

  const [reportRoom,  setReportRoom]  = useState("");
  const [reportIssue, setReportIssue] = useState("");

  useEffect(() => {
    dispatch(fetchCleaningRooms());
    dispatch(fetchAllRooms());
  }, [dispatch]);

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
