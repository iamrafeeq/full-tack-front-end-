import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchDashboardStats } from "../../redux/slice/reports/reportsSlice";

const STATUS_CONFIG = {
  booked:        { label: "Booked",      color: "#1d4ed8" },
  "checked-in":  { label: "Checked In",  color: "#15803d" },
  "checked-out": { label: "Checked Out", color: "#9ca3af" },
  cancelled:     { label: "Cancelled",   color: "#dc2626" },
};

const R = 54;
const C = 2 * Math.PI * R;

function StatCard({ title, value, icon, loading }) {
  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm text-gray-500">{title}</p>
          {loading ? (
            <div className="mt-2 h-7 w-24 animate-pulse rounded bg-gray-100" />
          ) : (
            <p className="text-2xl font-serif text-[#0B1F2A] mt-1">{value}</p>
          )}
        </div>
        <div className="w-12 h-12 shrink-0 rounded-full bg-[#0B1F2A]/5 flex items-center justify-center text-xl">
          {icon}
        </div>
      </div>
    </div>
  );
}

function StatusDonut({ counts }) {
  const entries = Object.entries(STATUS_CONFIG).map(([key, cfg]) => ({
    ...cfg,
    count: counts[key] ?? 0,
  }));
  const total = entries.reduce((t, e) => t + e.count, 0);

  let acc = 0;
  const segments = entries.map((e) => {
    const frac = total ? e.count / total : 0;
    const seg  = { ...e, frac, dash: `${frac * C} ${C}`, offset: -acc * C };
    acc += frac;
    return seg;
  });

  return (
    <div className="flex items-center gap-7 flex-wrap mt-3">
      <div className="relative w-[168px] h-[168px] shrink-0">
        <svg viewBox="0 0 140 140" className="w-[168px] h-[168px] block">
          <circle cx="70" cy="70" r={R} fill="none" stroke="#f3f4f6" strokeWidth="18" />
          {segments.map((s) => (
            <circle
              key={s.label}
              cx="70" cy="70" r={R} fill="none"
              stroke={s.color} strokeWidth="18"
              strokeDasharray={s.dash} strokeDashoffset={s.offset}
              transform="rotate(-90 70 70)"
            />
          ))}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="font-serif text-[26px] text-[#0B1F2A] leading-none">
            {total.toLocaleString()}
          </span>
          <span className="text-[10px] text-gray-400 tracking-[0.1em] mt-1">BOOKINGS</span>
        </div>
      </div>

      <div className="flex-1 min-w-[180px] flex flex-col gap-3">
        {segments.map((s) => (
          <div key={s.label} className="flex items-center gap-2.5">
            <span className="w-2.5 h-2.5 rounded-[3px] shrink-0" style={{ background: s.color }} />
            <span className="text-[13px] text-gray-600 flex-1">{s.label}</span>
            <span className="text-[13px] text-[#0B1F2A] font-semibold">{s.count.toLocaleString()}</span>
            <span className="text-xs text-gray-400 w-11 text-right">{Math.round(s.frac * 100)}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function OccupancyGauge({ occupancyRate, totalRooms, occupiedRooms }) {
  const frac = Math.min(1, Math.max(0, (occupancyRate ?? 0) / 100));
  return (
    <div className="flex items-center gap-7 flex-wrap mt-3">
      <div className="relative w-[168px] h-[168px] shrink-0">
        <svg viewBox="0 0 140 140" className="w-[168px] h-[168px] block">
          <circle cx="70" cy="70" r={R} fill="none" stroke="#f3f4f6" strokeWidth="18" />
          <circle
            cx="70" cy="70" r={R} fill="none" stroke="#C9A24B" strokeWidth="18"
            strokeDasharray={`${frac * C} ${C}`} strokeLinecap="round"
            transform="rotate(-90 70 70)"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="font-serif text-[32px] text-[#0B1F2A] leading-none">
            {Math.round(frac * 100)}%
          </span>
          <span className="text-[10px] text-gray-400 tracking-[0.1em] mt-1">OCCUPIED</span>
        </div>
      </div>
      <div className="flex-1 min-w-[150px] flex flex-col gap-3.5">
        <div className="border-l-[3px] border-[#C9A24B] pl-3">
          <p className="text-[11px] uppercase tracking-wide text-gray-400">Occupied rooms</p>
          <p className="text-xl font-serif text-[#0B1F2A] mt-0.5">{occupiedRooms ?? 0}</p>
        </div>
        <div className="border-l-[3px] border-gray-200 pl-3">
          <p className="text-[11px] uppercase tracking-wide text-gray-400">Available rooms</p>
          <p className="text-xl font-serif text-[#0B1F2A] mt-0.5">
            {Math.max(0, (totalRooms ?? 0) - (occupiedRooms ?? 0))}
          </p>
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

  const [periods, setPeriods] = useState([]);

  useEffect(() => {
    dispatch(fetchDashboardStats({}));
  }, [dispatch]);

  useEffect(() => {
    if (data && !applied && periods.length === 0) {
      setPeriods([
        {
          label:   "All time",
          revenue: data.totalRevenue ?? 0,
          meta:    "Every non-cancelled booking on record",
        },
      ]);
    }
  }, [data, applied, periods.length]);

  const handleApply = async () => {
    if (!startDate && !endDate) return;
    const result = await dispatch(fetchDashboardStats({ startDate, endDate }));
    setApplied(true);
    const revenue = result?.payload?.totalRevenue;
    if (typeof revenue === "number") {
      const label = `${startDate || "start"} → ${endDate || "today"}`;
      setPeriods((prev) => [
        ...prev.filter((p) => p.label !== label).slice(0, 3),
        { label, revenue, meta: "Returned by /api/reports/dashboard" },
      ]);
    }
  };

  const handleClear = () => {
    setStartDate("");
    setEndDate("");
    setApplied(false);
    setPeriods([]);
    dispatch(fetchDashboardStats({}));
  };

  const countMap = Object.fromEntries(
    (data?.bookingCounts || []).map((b) => [b._id, b.count])
  );

  const maxRev      = Math.max(1, ...periods.map((p) => p.revenue));
  const fmtCurrency = (n) => `$${(n ?? 0).toLocaleString()}`;

  return (
    <div className="space-y-5">
      <h2 className="text-lg font-serif text-[#0B1F2A]">Reports &amp; Analytics</h2>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-lg flex items-center justify-between gap-4">
          <span>{error}</span>
          <button
            onClick={() => dispatch(fetchDashboardStats({ startDate, endDate }))}
            className="bg-red-600 text-white text-[13px] font-semibold rounded-md px-3.5 py-1.5"
          >
            Try again
          </button>
        </div>
      )}

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
        <StatCard title="Total Rooms"    value={data?.totalRooms ?? 0}    icon="🏨" loading={loading} />
        <StatCard title="Occupied Rooms" value={data?.occupiedRooms ?? 0} icon="🛏️" loading={loading} />
        <StatCard title="Occupancy Rate" value={`${data?.occupancyRate ?? 0}%`} icon="📊" loading={loading} />
        <StatCard
          title={applied ? "Revenue (filtered)" : "Total Revenue"}
          value={fmtCurrency(data?.totalRevenue)}
          icon="💰"
          loading={loading}
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-baseline justify-between gap-3">
            <p className="text-sm font-semibold text-[#0B1F2A]">Booking Status Breakdown</p>
            <span className="text-xs text-gray-400">
              {Object.values(countMap).reduce((a, b) => a + b, 0).toLocaleString()} bookings
            </span>
          </div>
          {loading ? (
            <div className="h-[200px] mt-4 animate-pulse rounded-lg bg-gray-100" />
          ) : (
            <StatusDonut counts={countMap} />
          )}
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <p className="text-sm font-semibold text-[#0B1F2A]">Occupancy</p>
          <p className="text-xs text-gray-400 mt-0.5">
            {data?.occupiedRooms ?? 0} of {data?.totalRooms ?? 0} rooms occupied right now
          </p>
          {loading ? (
            <div className="h-[200px] mt-4 animate-pulse rounded-lg bg-gray-100" />
          ) : (
            <OccupancyGauge
              occupancyRate={data?.occupancyRate}
              totalRooms={data?.totalRooms}
              occupiedRooms={data?.occupiedRooms}
            />
          )}
        </div>
      </div>

      {/* Revenue by period */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <p className="text-sm font-semibold text-[#0B1F2A]">Revenue by Period</p>
        <p className="text-xs text-gray-400 mt-1">
          Apply a date range to compare it side-by-side against all-time revenue.
        </p>

        <div className="flex flex-wrap items-end gap-3 mt-4 pb-4 border-b border-gray-100">
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
          <span className="text-xs text-gray-400 self-center">
            {applied
              ? "Revenue reflects the selected range. Room and occupancy figures stay all-time."
              : "Apply a range to compare it against all time."}
          </span>
        </div>

        {loading ? (
          <div className="h-[150px] mt-4 animate-pulse rounded-lg bg-gray-100" />
        ) : (
          <div className="flex flex-col gap-3.5 mt-4">
            {periods.length === 0 && (
              <p className="text-sm text-gray-400">No revenue data returned yet.</p>
            )}
            {periods.map((p, i) => (
              <div key={p.label}>
                <div className="flex items-baseline justify-between gap-3 mb-1.5">
                  <span className="text-[13px] text-gray-600">{p.label}</span>
                  <span className="text-sm font-serif font-semibold text-[#0B1F2A]">
                    {fmtCurrency(p.revenue)}
                  </span>
                </div>
                <div className="h-3 rounded-full bg-gray-100 overflow-hidden">
                  <div
                    className="h-full rounded-full transition-[width] duration-500"
                    style={{
                      width:      `${Math.max(4, Math.round((p.revenue / maxRev) * 100))}%`,
                      background: i === 0 ? "#0B1F2A" : "#C9A24B",
                    }}
                  />
                </div>
                <p className="text-[11px] text-gray-400 mt-1.5">{p.meta}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
