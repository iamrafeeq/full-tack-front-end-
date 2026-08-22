import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { fetchTodayActivity } from "../../redux/slice/receptionist/receptionistSlice";
import { fetchPublicRooms } from "../../redux/slice/roomSlice/roomSlice";
import ReceptionistLayout from "../../components/receptionist/ReceptionistLayout";

function StatCard({ icon, label, value, sub, accent = "#0B1F2A", to }) {
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
      <div className="min-w-0 flex-1">
        <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">{label}</p>
        <p className="text-2xl font-serif text-[#0B1F2A]">{value}</p>
        {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
      </div>
      <span className="text-gray-300 group-hover:text-[#C9A24B] transition-colors text-lg self-center shrink-0">→</span>
    </Link>
  );
}

const QUICK_ACTIONS = [
  { icon: "🛬", label: "Today's Arrivals",    desc: "Check in arriving guests",        to: "/receptionist/arrivals" },
  { icon: "🛫", label: "Today's Departures",  desc: "Process check-outs",              to: "/receptionist/departures" },
  { icon: "📝", label: "New Booking",          desc: "Create a guest reservation",      to: "/receptionist/new-booking" },
  { icon: "🛏️", label: "Room Status",          desc: "View all room availability",      to: "/receptionist/room-status" },
  { icon: "🔧", label: "Report Issue",         desc: "Flag a room for maintenance",     to: "/receptionist/report-issue" },
  { icon: "📋", label: "Maintenance",          desc: "View maintenance requests",       to: "/receptionist/maintenance" },
];

export default function ReceptionDashboard() {
  const dispatch = useDispatch();
  const { arrivals = [], departures = [], todayLoading } = useSelector((s) => s.receptionist);
  const { rooms, loading: roomsLoading } = useSelector((s) => s.rooms);

  useEffect(() => {
    dispatch(fetchTodayActivity());
    dispatch(fetchPublicRooms());
  }, [dispatch]);

  const availableRooms = rooms.filter((r) => r.status === "available").length;
  const pendingPayments = [...arrivals, ...departures].filter(
    (b) => b.paymentStatus === "pending" && b.status !== "cancelled" && b.status !== "checked-out"
  ).length;

  return (
    <ReceptionistLayout title="Dashboard">
      <div className="max-w-5xl">
        <h1 className="text-2xl font-serif text-[#0B1F2A] mb-1">Good morning</h1>
        <p className="text-sm text-gray-500 mb-7">Here is your front desk overview for today.</p>

        {/* Stat cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 mb-10">
          <StatCard
            icon="🛬"
            label="Arrivals Today"
            value={todayLoading ? "…" : arrivals.length}
            sub="Expected check-ins"
            accent="#C9A24B"
            to="/receptionist/arrivals"
          />
          <StatCard
            icon="🛫"
            label="Departures Today"
            value={todayLoading ? "…" : departures.length}
            sub="Expected check-outs"
            accent="#0B1F2A"
            to="/receptionist/departures"
          />
          <StatCard
            icon="✅"
            label="Available Rooms"
            value={roomsLoading ? "…" : availableRooms}
            sub="Ready for guests"
            accent="#15803d"
            to="/receptionist/room-status"
          />
          <StatCard
            icon="💳"
            label="Pending Payments"
            value={todayLoading ? "…" : pendingPayments}
            sub="Need collection"
            accent="#dc2626"
            to="/receptionist/arrivals"
          />
        </div>

        {/* Quick action grid */}
        <h2 className="text-sm font-medium text-gray-400 uppercase tracking-wide mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {QUICK_ACTIONS.map(({ icon, label, desc, to }) => (
            <Link
              key={to}
              to={to}
              className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 hover:border-[#C9A24B]/50 hover:shadow-md transition-all group"
            >
              <div className="text-2xl mb-3">{icon}</div>
              <p className="font-serif text-[#0B1F2A] text-base mb-1">{label}</p>
              <p className="text-xs text-gray-400">{desc}</p>
            </Link>
          ))}
        </div>
      </div>
    </ReceptionistLayout>
  );
}
