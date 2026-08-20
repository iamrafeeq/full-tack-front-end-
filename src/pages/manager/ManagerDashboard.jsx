import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchBookings } from "../../redux/slice/Booking/bookingSlice";
import { fetchAllRooms } from "../../redux/slice/roomSlice/roomSlice";
import ManagerLayout from "../../components/manager/ManagerLayout";
import MaintenanceRequestsView from "../../components/maintenance/MaintenanceRequestsView";

const STATUS_STYLES = {
  "booked":      "bg-blue-100 text-blue-700",
  "checked-in":  "bg-green-100 text-green-700",
  "checked-out": "bg-gray-100 text-gray-600",
  "cancelled":   "bg-red-100 text-red-600",
};

const ROOM_STATUS_STYLES = {
  available:   "bg-green-100 text-green-700",
  reserved:    "bg-blue-100 text-blue-700",
  occupied:    "bg-red-100 text-red-700",
  cleaning:    "bg-yellow-100 text-yellow-700",
  maintenance: "bg-gray-100 text-gray-500",
};

const STATUS_FILTERS = ["all", "booked", "checked-in", "checked-out", "cancelled"];

const fmtDate = (d) =>
  d ? new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "—";

export default function ManagerDashboard() {
  const dispatch = useDispatch();

  const { bookings, loading: bookingsLoading, error: bookingsError } =
    useSelector((s) => s.bookings);
  const { rooms, loading: roomsLoading } = useSelector((s) => s.rooms);

  const [bookingSearch,    setBookingSearch]    = useState("");
  const [bookingStatus,    setBookingStatus]    = useState("all");
  const [roomStatusFilter, setRoomStatusFilter] = useState("all");

  useEffect(() => {
    dispatch(fetchBookings());
    dispatch(fetchAllRooms());
  }, [dispatch]);

  const filteredBookings = bookings.filter((b) => {
    const q = bookingSearch.toLowerCase();
    const matchSearch =
      !q ||
      b.guest?.name?.toLowerCase().includes(q) ||
      b.guest?.email?.toLowerCase().includes(q) ||
      b.room?.roomNumber?.toLowerCase().includes(q);
    const matchStatus = bookingStatus === "all" || b.status === bookingStatus;
    return matchSearch && matchStatus;
  });

  const filteredRooms = rooms.filter(
    (r) => roomStatusFilter === "all" || r.status === roomStatusFilter
  );

  return (
    <ManagerLayout>

      {/* ══ ALL BOOKINGS  */}
      <Section title="All Bookings" icon="📖" count={filteredBookings.length}>
        {/* Filter bar */}
        <div className="px-6 py-3 border-b border-gray-50 flex flex-wrap gap-3 items-center">
          <div className="relative flex-1 min-w-[160px] max-w-xs">
            <span className="absolute left-3 top-2.5 text-gray-400 text-sm">🔍</span>
            <input
              type="text"
              value={bookingSearch}
              onChange={(e) => setBookingSearch(e.target.value)}
              placeholder="Guest name, email or room…"
              className="w-full pl-8 pr-3 py-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:border-[#C9A24B]"
            />
          </div>
          <select
            value={bookingStatus}
            onChange={(e) => setBookingStatus(e.target.value)}
            className="text-sm border border-gray-200 rounded-md px-3 py-2 bg-white focus:outline-none focus:border-[#C9A24B]"
          >
            {STATUS_FILTERS.map((s) => (
              <option key={s} value={s}>
                {s === "all" ? "All Statuses" : s.charAt(0).toUpperCase() + s.slice(1)}
              </option>
            ))}
          </select>
        </div>

        {bookingsLoading ? (
          <Spinner />
        ) : bookingsError ? (
          <ErrBanner msg={bookingsError} />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  {["#", "Guest", "Room", "Check-In", "Check-Out", "Nights", "Total", "Status", "Payment"].map((h) => (
                    <th key={h} className="px-4 py-3 text-xs uppercase tracking-wide text-gray-400 font-medium text-left whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead> 
              <tbody>
                {filteredBookings.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="text-center py-12 text-gray-400">No bookings found.</td>
                  </tr>
                ) : (
                  filteredBookings.map((b, idx) => (
                    <tr key={b._id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 text-gray-400">{idx + 1}</td>
                      <td className="px-4 py-3">
                        <p className="font-medium text-[#0B1F2A]">{b.guest?.name || "—"}</p>
                        <p className="text-xs text-gray-400">{b.guest?.email || ""}</p>
                      </td>
                      <td className="px-4 py-3">
                        <p className="font-medium text-[#0B1F2A]">{b.room?.roomNumber || "—"}</p>
                        <p className="text-xs capitalize text-gray-400">{b.room?.type || ""}</p>
                      </td>
                      <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{fmtDate(b.checkInDate)}</td>
                      <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{fmtDate(b.checkOutDate)}</td>
                      <td className="px-4 py-3 text-gray-500">{b.nights}</td>
                      <td className="px-4 py-3 font-medium text-[#0B1F2A]">
                        ${b.totalAmount?.toLocaleString() || "—"}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-xs font-medium px-2.5 py-1 rounded-full capitalize ${STATUS_STYLES[b.status] || "bg-gray-100 text-gray-500"}`}>
                          {b.status}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-col gap-1">
                          <span className={`text-xs font-medium px-2.5 py-1 rounded-full w-fit ${b.paymentStatus === "paid" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}>
                            {b.paymentStatus === "paid" ? "Paid" : "Due"}
                          </span>
                          {b.paymentTiming && (
                            <span className="text-xs text-gray-400 capitalize">
                              @ {b.paymentTiming === "now" ? "booking" : b.paymentTiming}
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </Section>

      {/* ══ MAINTENANCE REQUESTS  */}
      <Section title="Maintenance Requests" icon="🔧">
        <div className="px-0">
          <MaintenanceRequestsView />
        </div>
      </Section>

      {/* ══ ROOM OVERVIEW  */}
      <Section
        title="Room Overview"
        icon="🛏️"
        count={filteredRooms.length}
        action={
          <select
            value={roomStatusFilter}
            onChange={(e) => setRoomStatusFilter(e.target.value)}
            className="text-xs border border-gray-200 rounded-md px-2 py-1.5 bg-white focus:outline-none focus:border-[#C9A24B]"
          >
            <option value="all">All Statuses</option>
            {["available", "reserved", "occupied", "cleaning", "maintenance"].map((s) => (
              <option key={s} value={s} className="capitalize">{s}</option>
            ))}
          </select>
        }
      >
        {roomsLoading ? (
          <Spinner />
        ) : filteredRooms.length === 0 ? (
          <p className="text-center text-gray-400 text-sm py-8">No rooms match this filter.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  {["Room No.", "Type", "Floor", "Capacity", "Price / Night", "Status"].map((h) => (
                    <th key={h} className="px-4 py-3 text-xs uppercase tracking-wide text-gray-400 font-medium text-left whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredRooms.map((r) => (
                  <tr key={r._id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 font-medium text-[#0B1F2A]">{r.roomNumber}</td>
                    <td className="px-4 py-3 capitalize text-gray-600">{r.type}</td>
                    <td className="px-4 py-3 text-gray-500">{r.floor ?? "—"}</td>
                    <td className="px-4 py-3 text-gray-500">{r.capacity}</td>
                    <td className="px-4 py-3 text-gray-700">${(r.discountPrice || r.price)?.toLocaleString()}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-medium px-2.5 py-1 rounded-full capitalize ${ROOM_STATUS_STYLES[r.status] || "bg-gray-100 text-gray-500"}`}>
                        {r.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Section>

    </ManagerLayout>
  );
}

// ── Small reusable components ─────────────────────────────────────────────────

function Section({ title, icon, count, action, children }) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-6">
      <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-lg">{icon}</span>
          <h2 className="text-base font-semibold text-[#0B1F2A]">{title}</h2>
          {count !== undefined && (
            <span className="text-xs bg-[#C9A24B]/15 text-[#0B1F2A] px-2 py-0.5 rounded-full font-medium">
              {count}
            </span>
          )}
        </div>
        {action && <div>{action}</div>}
      </div>
      {children}
    </div>
  );
}

function Spinner() {
  return (
    <div className="flex justify-center py-10">
      <div className="w-7 h-7 border-4 border-[#C9A24B] border-t-transparent rounded-full animate-spin" />
    </div>
  );
}

function ErrBanner({ msg }) {
  return (
    <div className="mx-6 my-3 px-4 py-2.5 bg-red-50 border border-red-200 rounded-md text-sm text-red-600">
      {msg}
    </div>
  );
}
