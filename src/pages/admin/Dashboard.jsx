import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useAuth } from "../../context/AuthContext";
import AdminLayout from "../../components/admin/AdminLayout";
import { fetchBookings } from "../../redux/slice/Booking/bookingSlice";
import { fetchAllRooms } from "../../redux/slice/roomSlice/roomSlice";
import { guestUserAPI } from "../../redux/slice/adminSlice/guestUser";

function StatCard({ title, value, icon, loading }) {
  return (
    <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500">{title}</p>
          {loading ? (
            <div className="mt-2 h-7 w-20 animate-pulse rounded bg-gray-100" />
          ) : (
            <p className="text-2xl font-serif text-[#0B1F2A] mt-1">{value}</p>
          )}
        </div>
        <div className="w-12 h-12 rounded-full bg-[#0B1F2A]/5 flex items-center justify-center text-xl">
          {icon}
        </div>
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const dispatch = useDispatch();
  const { role } = useAuth();

  const { bookings, total: bookingTotal, loading: bookingLoading } =
    useSelector((state) => state.bookings);
  const { total: roomTotal, loading: roomLoading } =
    useSelector((state) => state.rooms);
  const { data: users, loading: userLoading } =
    useSelector((state) => state.guestUser);

  useEffect(() => {
    dispatch(fetchBookings());
    dispatch(fetchAllRooms());
    if (role === "admin") dispatch(guestUserAPI());
  }, [dispatch, role]);

  // Sum totalAmount of all non-cancelled bookings
  const revenue = bookings
    .filter((b) => b.status !== "cancelled")
    .reduce((sum, b) => sum + (b.totalAmount || 0), 0);

  const guestCount = Array.isArray(users) ? users.length : 0;

  // Quick count of today's check-ins
  const todayStr = new Date().toISOString().split("T")[0];
  const todayCheckIns = bookings.filter(
    (b) => b.status === "booked" && b.checkInDate?.startsWith(todayStr)
  ).length;

  return (
    <AdminLayout>
      {/* Stat cards */}
      <div className={`grid grid-cols-1 sm:grid-cols-2 ${role === "admin" ? "lg:grid-cols-4" : "lg:grid-cols-3"} gap-5`}>
        <StatCard title="Total Rooms"    value={roomTotal}                        icon="🛏️" loading={roomLoading} />
        <StatCard title="Total Bookings" value={bookingTotal}                     icon="📖" loading={bookingLoading} />
        {role === "admin" && (
          <StatCard title="Total Guests" value={guestCount}                       icon="👥" loading={userLoading} />
        )}
        <StatCard title="Revenue"        value={`$${revenue.toLocaleString()}`}   icon="💰" loading={bookingLoading} />
      </div>

      {/* Today's activity */}
      <div className="mt-5 grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="bg-white rounded-lg p-5 shadow-sm border border-gray-100">
          <p className="text-xs uppercase tracking-wide text-gray-400">Today's Check-ins</p>
          {bookingLoading
            ? <div className="mt-2 h-7 w-12 animate-pulse rounded bg-gray-100" />
            : <p className="text-3xl font-serif text-[#0B1F2A] mt-1">{todayCheckIns}</p>
          }
        </div>
        <div className="bg-white rounded-lg p-5 shadow-sm border border-gray-100">
          <p className="text-xs uppercase tracking-wide text-gray-400">Active Stays</p>
          {bookingLoading
            ? <div className="mt-2 h-7 w-12 animate-pulse rounded bg-gray-100" />
            : <p className="text-3xl font-serif text-[#0B1F2A] mt-1">
                {bookings.filter((b) => b.status === "checked-in").length}
              </p>
          }
        </div>
        <div className="bg-white rounded-lg p-5 shadow-sm border border-gray-100">
          <p className="text-xs uppercase tracking-wide text-gray-400">Pending Bookings</p>
          {bookingLoading
            ? <div className="mt-2 h-7 w-12 animate-pulse rounded bg-gray-100" />
            : <p className="text-3xl font-serif text-[#0B1F2A] mt-1">
                {bookings.filter((b) => b.status === "booked").length}
              </p>
          }
        </div>
      </div>

      {/* Welcome */}
      <div className="mt-5 bg-white rounded-lg p-6 shadow-sm border border-gray-100">
        <h3 className="text-lg font-serif text-[#0B1F2A] mb-2">
          Welcome back to LuxuryStay
        </h3>
        <p className="text-sm text-gray-500">
          Here is a live overview of LuxuryStay Hospitality's current performance.
        </p>
      </div>
    </AdminLayout>
  );
}
