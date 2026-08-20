import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchDashboardStats } from "../../redux/slice/reports/reportsSlice";

const STATUS_CONFIG = {
  booked:         { label: "Booked",      bg: "bg-blue-50",   border: "border-blue-200",  text: "text-blue-700"  },
  "checked-in":   { label: "Checked In",  bg: "bg-green-50",  border: "border-green-200", text: "text-green-700" },
  "checked-out":  { label: "Checked Out", bg: "bg-gray-50",   border: "border-gray-200",  text: "text-gray-600"  },
  cancelled:      { label: "Cancelled",   bg: "bg-red-50",    border: "border-red-200",   text: "text-red-600"   },
};

function StatCard({ title, value, icon, loading }) {
  return (
    <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500">{title}</p>
          {loading ? (
            <div className="mt-2 h-7 w-24 animate-pulse rounded bg-gray-100" />
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

export default function ReportsDashboard() {
  const dispatch = useDispatch();
  const { data, loading, error } = useSelector((s) => s.reports);

  const [startDate, setStartDate] = useState("");
  const [endDate,   setEndDate]   = useState("");
  const [applied,   setApplied]   = useState(false);

  useEffect(() => {
    dispatch(fetchDashboardStats({}));
  }, [dispatch]);

  const handleApply = () => {
    if (!startDate && !endDate) return;
    dispatch(fetchDashboardStats({ startDate, endDate }));
    setApplied(true);
  };

  const handleClear = () => {
    setStartDate("");
    setEndDate("");
    setApplied(false);
    dispatch(fetchDashboardStats({}));
  };

  const countMap = Object.fromEntries(
    (data?.bookingCounts || []).map((b) => [b._id, b.count])
  );

  const fmtCurrency = (n) => `$${(n ?? 0).toLocaleString()}`;
  const fmtPct      = (n) => `${n ?? 0}%`;

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-serif text-[#0B1F2A]">Reports & Analytics</h2>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-md">
          {error}
        </div>
      )}

      {/* ── Stat cards ─────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard
          title="Total Rooms"
          value={data?.totalRooms ?? 0}
          icon="🏨"
          loading={loading}
        />
        <StatCard
          title="Occupied Rooms"
          value={data?.occupiedRooms ?? 0}
          icon="🛏️"
          loading={loading}
        />
        <StatCard
          title="Occupancy Rate"
          value={fmtPct(data?.occupancyRate)}
          icon="📊"
          loading={loading}
        />
        <StatCard
          title={applied ? "Revenue (filtered)" : "Total Revenue"}
          value={fmtCurrency(data?.totalRevenue)}
          icon="💰"
          loading={loading}
        />
      </div>

      {/* ── Revenue date filter ────────────────────────────────────── */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
        <p className="text-sm font-medium text-[#0B1F2A] mb-3">
          Filter Revenue by Date Range
        </p>
        <div className="flex flex-wrap items-end gap-3">
          <div>
            <label className="block text-xs text-gray-500 mb-1">Start Date</label>
            <input
              type="date"
              value={startDate}
              max={endDate || undefined}
              onChange={(e) => setStartDate(e.target.value)}
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#C9A24B]"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">End Date</label>
            <input
              type="date"
              value={endDate}
              min={startDate || undefined}
              onChange={(e) => setEndDate(e.target.value)}
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#C9A24B]"
            />
          </div>
          <button
            onClick={handleApply}
            disabled={(!startDate && !endDate) || loading}
            className="px-5 py-2 bg-[#0B1F2A] text-white text-sm rounded-lg hover:opacity-90 disabled:opacity-50 transition"
          >
            Apply
          </button>
          {applied && (
            <button
              onClick={handleClear}
              className="px-5 py-2 border border-gray-300 text-sm rounded-lg hover:bg-gray-50 transition"
            >
              Clear
            </button>
          )}
        </div>
        {applied && (
          <p className="text-xs text-gray-400 mt-2">
            Showing revenue
            {startDate ? ` from ${startDate}` : ""}
            {endDate   ? ` to ${endDate}`     : ""}
            . Other stats reflect all-time figures.
          </p>
        )}
      </div>

      {/* ── Booking status breakdown ───────────────────────────────── */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
        <p className="text-sm font-medium text-[#0B1F2A] mb-4">Booking Status Breakdown</p>
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-20 animate-pulse rounded-lg bg-gray-100" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
              <div
                key={key}
                className={`rounded-lg border p-4 ${cfg.bg} ${cfg.border}`}
              >
                <p className={`text-3xl font-bold ${cfg.text}`}>
                  {countMap[key] ?? 0}
                </p>
                <p className={`text-sm font-medium mt-1 ${cfg.text}`}>
                  {cfg.label}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
