import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import HousekeepingLayout from "../../components/housekeeping/HousekeepingLayout";
import SkeletonRow from "../../components/SkeletonRow";
import {
  fetchMyTasks,
  updateMaintenanceStatus,
} from "../../redux/slice/maintenance/maintenanceSlice";
import { notifyError } from "../../utils/toast";

const STATUS_BADGE = {
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

export default function MaintenanceTasks() {
  const dispatch = useDispatch();
  const {
    myTasks = [],
    myTasksLoading,
    myTasksError,
    updateLoading,
    updateError,
  } = useSelector((s) => s.maintenance);

  const [filter, setFilter] = useState("");

  useEffect(() => {
    dispatch(fetchMyTasks(filter));
  }, [dispatch, filter]);

  useEffect(() => { if (updateError) notifyError(updateError); }, [updateError]);

  return (
    <HousekeepingLayout title="Maintenance Tasks">
      <div className="max-w-5xl">
        {/* Page header */}
        <div className="mb-6">
          <h1 className="text-2xl font-serif text-[#0B1F2A]">My Maintenance Tasks</h1>
          <p className="text-sm text-gray-500 mt-1">Tasks assigned to you by the admin team.</p>
        </div>

        {/* Filter pills + count */}
        <div className="flex flex-wrap items-center gap-2 mb-5">
          {FILTERS.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setFilter(key)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                filter === key
                  ? "bg-[#0B1F2A] text-white"
                  : "bg-white border border-gray-200 text-gray-600 hover:border-gray-300"
              }`}
            >
              {label}
              {key === "" && myTasks.length > 0 && (
                <span className={`ml-1.5 text-xs ${filter === key ? "text-white/70" : "text-gray-400"}`}>
                  ({myTasks.length})
                </span>
              )}
            </button>
          ))}
          <button
            onClick={() => dispatch(fetchMyTasks(filter))}
            className="ml-auto text-xs text-[#C9A24B] underline"
          >
            Refresh
          </button>
        </div>

        {/* Table card */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          {myTasksError ? (
            <div className="m-5 rounded-lg bg-red-50 border border-red-100 px-4 py-3 text-sm text-red-700">
              {myTasksError}
              <button
                onClick={() => dispatch(fetchMyTasks(filter))}
                className="ml-3 underline text-red-600 text-xs"
              >
                Retry
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100 text-left">
                    {["Room", "Issue", "Reported by", "Status", "Update Status", "Date"].map((h) => (
                      <th
                        key={h}
                        className="px-5 py-3 text-xs font-medium text-gray-400 uppercase tracking-wide whitespace-nowrap"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {myTasksLoading ? Array.from({length: 5}, (_, i) => <SkeletonRow key={i} cols={6} />) : myTasks.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-20 text-center">
                        <div className="flex flex-col items-center gap-3">
                          <span className="text-4xl">🔧</span>
                          <p className="font-medium text-gray-700">No tasks found</p>
                          <p className="text-sm text-gray-400">
                            {filter ? `No ${filter} tasks assigned to you` : "You have no maintenance tasks right now"}
                          </p>
                        </div>
                      </td>
                    </tr>
                  ) : myTasks.map((task) => (
                    <tr
                      key={task._id}
                      className="border-b border-gray-50 hover:bg-gray-50/60 transition-colors"
                    >
                      <td className="px-5 py-3.5">
                        <p className="font-semibold text-[#0B1F2A] whitespace-nowrap">
                          Room {task.room?.roomNumber ?? "—"}
                        </p>
                        <p className="text-xs text-gray-400 capitalize mt-0.5">{task.room?.type}</p>
                      </td>
                      <td className="px-5 py-3.5 text-gray-600 max-w-[220px]">
                        <p className="line-clamp-2">{task.issue}</p>
                      </td>
                      <td className="px-5 py-3.5">
                        <p className="font-medium text-[#0B1F2A] whitespace-nowrap">
                          {task.reportedBy?.name || "—"}
                        </p>
                        <p className="text-xs text-gray-400 capitalize mt-0.5">{task.reportedBy?.role}</p>
                      </td>
                      <td className="px-5 py-3.5">
                        <span
                          className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold capitalize ${
                            STATUS_BADGE[task.status] ?? "bg-gray-100 text-gray-600"
                          }`}
                        >
                          {task.status?.replace("-", " ")}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <select
                          value={task.status}
                          onChange={(e) =>
                            dispatch(updateMaintenanceStatus({ id: task._id, status: e.target.value }))
                          }
                          disabled={updateLoading === task._id}
                          className="text-xs border border-gray-200 rounded-lg px-2.5 py-1.5 bg-white text-gray-600 focus:outline-none focus:ring-2 focus:ring-[#C9A24B]/40 disabled:opacity-50 cursor-pointer"
                        >
                          <option value="open">Open</option>
                          <option value="in-progress">In Progress</option>
                          <option value="resolved">Resolved</option>
                        </select>
                      </td>
                      <td className="px-5 py-3.5 text-xs text-gray-400 whitespace-nowrap">
                        {task.createdAt
                          ? new Date(task.createdAt).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })
                          : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </HousekeepingLayout>
  );
}
