import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import HousekeepingLayout from "../../components/housekeeping/HousekeepingLayout";
import { fetchCleaningRooms, fetchCleaningTables } from "../../redux/slice/housekeeping/housekeepingSlice";
import { fetchMyTasks } from "../../redux/slice/maintenance/maintenanceSlice";

function OverviewCard({ icon, label, value, sub, to, accent = "#0B1F2A" }) {
  return (
    <Link
      to={to}
      className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 flex items-start gap-4 hover:shadow-md transition-shadow group"
    >
      <div
        className="w-11 h-11 rounded-xl flex items-center justify-center text-xl shrink-0"
        style={{ backgroundColor: `${accent}18` }}
      >
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">{label}</p>
        <p className="text-2xl font-serif text-[#0B1F2A]">{value}</p>
        {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
      </div>
      <span className="ml-auto text-gray-300 group-hover:text-[#C9A24B] transition-colors text-lg self-center">→</span>
    </Link>
  );
}

export default function HouseKeepingDashboard() {
  const dispatch = useDispatch();
  const { cleaningRooms, loading: cleanLoading, cleaningTables, tablesLoading } = useSelector((s) => s.housekeeping);
  const { myTasks = [], myTasksLoading } = useSelector((s) => s.maintenance);

  useEffect(() => {
    dispatch(fetchCleaningRooms());
    dispatch(fetchCleaningTables());
    dispatch(fetchMyTasks(""));
  }, [dispatch]);

  const openTasks     = myTasks.filter((t) => t.status === "open").length;
  const inProgress    = myTasks.filter((t) => t.status === "in-progress").length;
  const resolvedTasks = myTasks.filter((t) => t.status === "resolved").length;

  return (
    <HousekeepingLayout title="Dashboard">
      <div className="max-w-4xl">
        <h1 className="text-2xl font-serif text-[#0B1F2A] mb-1">Good morning</h1>
        <p className="text-sm text-gray-500 mb-7">Here is your shift overview for today.</p>

        {/* Stat overview cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5 mb-10">
          <OverviewCard
            icon="🧹"
            label="Rooms to Clean"
            value={cleanLoading ? "…" : cleaningRooms.length}
            sub="Need attention"
            accent="#C9A24B"
            to="/housekeeping/rooms-to-clean"
          />
          <OverviewCard
            icon="🪑"
            label="Tables to Clean"
            value={tablesLoading ? "…" : cleaningTables.length}
            sub="Need attention"
            accent="#7c3aed"
            to="/housekeeping/tables-to-clean"
          />
          <OverviewCard
            icon="🚨"
            label="Open Tasks"
            value={myTasksLoading ? "…" : openTasks}
            sub="Awaiting action"
            accent="#dc2626"
            to="/housekeeping/maintenance-tasks"
          />
          <OverviewCard
            icon="🔧"
            label="In Progress"
            value={myTasksLoading ? "…" : inProgress}
            sub="Being handled"
            accent="#a16207"
            to="/housekeeping/maintenance-tasks"
          />
          <OverviewCard
            icon="✅"
            label="Resolved"
            value={myTasksLoading ? "…" : resolvedTasks}
            sub="Completed today"
            accent="#15803d"
            to="/housekeeping/maintenance-tasks"
          />
        </div>

        {/* Quick action tiles */}
        <h2 className="text-sm font-medium text-gray-400 uppercase tracking-wide mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Link
            to="/housekeeping/rooms-to-clean"
            className="group bg-white rounded-xl border border-gray-100 shadow-sm p-6 hover:border-[#C9A24B]/50 hover:shadow-md transition-all"
          >
            <div className="text-3xl mb-3">🧹</div>
            <p className="font-serif text-[#0B1F2A] text-base mb-1">Rooms to Clean</p>
            <p className="text-xs text-gray-400">View and mark rooms clean</p>
          </Link>

          <Link
            to="/housekeeping/tables-to-clean"
            className="group bg-white rounded-xl border border-gray-100 shadow-sm p-6 hover:border-[#C9A24B]/50 hover:shadow-md transition-all"
          >
            <div className="text-3xl mb-3">🪑</div>
            <p className="font-serif text-[#0B1F2A] text-base mb-1">Tables to Clean</p>
            <p className="text-xs text-gray-400">View and mark tables clean</p>
          </Link>

          <Link
            to="/housekeeping/maintenance-tasks"
            className="group bg-white rounded-xl border border-gray-100 shadow-sm p-6 hover:border-[#C9A24B]/50 hover:shadow-md transition-all"
          >
            <div className="text-3xl mb-3">🔧</div>
            <p className="font-serif text-[#0B1F2A] text-base mb-1">Maintenance Tasks</p>
            <p className="text-xs text-gray-400">Manage your assigned tasks</p>
          </Link>

          <Link
            to="/housekeeping/report-issue"
            className="group bg-white rounded-xl border border-gray-100 shadow-sm p-6 hover:border-[#C9A24B]/50 hover:shadow-md transition-all"
          >
            <div className="text-3xl mb-3">📋</div>
            <p className="font-serif text-[#0B1F2A] text-base mb-1">Report an Issue</p>
            <p className="text-xs text-gray-400">Flag a room for maintenance</p>
          </Link>
        </div>
      </div>
    </HousekeepingLayout>
  );
}
