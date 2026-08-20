import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import AdminLayout from "../../../components/admin/AdminLayout";
import {
  fetchAllFeedback,
  fetchFeedbackStats,
} from "../../../redux/slice/feedback/feedbackSlice";
import StarRating from "../../../components/feedback/StarRating";

const fmtDate = (iso) =>
  iso
    ? new Date(iso).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : "—";

function StatCard({ title, icon, value, loading }) {
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

export default function AdminFeedback() {
  const dispatch = useDispatch();
  const { list, listLoading, listError, stats, statsLoading, statsError } =
    useSelector((s) => s.feedback);

  const [minRating, setMinRating] = useState("");
  const [sort,      setSort]      = useState("newest");

  useEffect(() => {
    dispatch(fetchFeedbackStats());
  }, [dispatch]);

  useEffect(() => {
    dispatch(fetchAllFeedback({ minRating, sort }));
  }, [dispatch, minRating, sort]);

  const avgRating =
    stats?.averageRating != null ? Number(stats.averageRating).toFixed(1) : "—";
  const totalCount = stats?.totalFeedbackCount ?? "—";

  return (
    <AdminLayout>
      {/* ── Stat cards ─────────────────────────────────────────────────────── */}
      {statsError && (
        <div className="mb-4 px-4 py-2.5 bg-red-50 border border-red-200 rounded-md text-sm text-red-600">
          {statsError}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-6">
        <StatCard
          title="Average Rating"
          icon="⭐"
          value={avgRating !== "—" ? `${avgRating} / 5` : "—"}
          loading={statsLoading}
        />
        <StatCard
          title="Total Responses"
          icon="💬"
          value={totalCount}
          loading={statsLoading}
        />
      </div>

      {/* ── Filters ────────────────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <select
          value={minRating}
          onChange={(e) => setMinRating(e.target.value)}
          className="text-sm border border-gray-300 rounded-md px-3 py-2 bg-white focus:outline-none focus:border-[#C9A24B]"
        >
          <option value="">All Ratings</option>
          <option value="4">4+ Stars</option>
          <option value="3">3+ Stars</option>
          <option value="2">2+ Stars</option>
        </select>

        <div className="flex rounded-md border border-gray-300 overflow-hidden">
          {["newest", "oldest"].map((s) => (
            <button
              key={s}
              onClick={() => setSort(s)}
              className={`text-sm px-4 py-2 capitalize transition-colors ${
                sort === s
                  ? "bg-[#0B1F2A] text-white"
                  : "bg-white text-gray-600 hover:bg-gray-50"
              }`}
            >
              {s}
            </button>
          ))}
        </div>

        <span className="text-sm text-gray-400 ml-auto">
          {list.length} response{list.length !== 1 ? "s" : ""}
        </span>
      </div>

      {/* ── Error ──────────────────────────────────────────────────────────── */}
      {listError && (
        <div className="px-4 py-2.5 bg-red-50 border border-red-200 rounded-md text-sm text-red-600 mb-4">
          {listError}
        </div>
      )}

      {/* ── Loading ────────────────────────────────────────────────────────── */}
      {listLoading && (
        <div className="flex justify-center py-16">
          <div className="w-8 h-8 border-4 border-[#C9A24B] border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {/* ── Empty state ────────────────────────────────────────────────────── */}
      {!listLoading && !listError && list.length === 0 && (
        <div className="bg-white rounded-xl border border-gray-100 py-14 text-center">
          <p className="text-4xl mb-3">💬</p>
          <p className="font-medium text-gray-500">No feedback submitted yet</p>
          <p className="text-sm text-gray-400 mt-1">
            Guest reviews will appear here once submitted
          </p>
        </div>
      )}

      {/* ── Table ──────────────────────────────────────────────────────────── */}
      {!listLoading && !listError && list.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50 text-left">
                  {["Guest", "Room / Dates", "Rating", "Comment", "Submitted"].map((h) => (
                    <th
                      key={h}
                      className="px-5 py-3 text-xs uppercase tracking-wide text-gray-400 font-medium whitespace-nowrap"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {list.map((fb) => {
                  const checkIn  = fb.booking?.checkInDate  || fb.checkInDate;
                  const checkOut = fb.booking?.checkOutDate || fb.checkOutDate;
                  const roomNum  = fb.booking?.room?.roomNumber || fb.room?.roomNumber;

                  return (
                    <tr
                      key={fb._id}
                      className="border-b border-gray-50 hover:bg-gray-50/60 transition-colors"
                    >
                      {/* Guest */}
                      <td className="px-5 py-4 whitespace-nowrap">
                        <p className="font-medium text-[#0B1F2A]">
                          {fb.guest?.name || "—"}
                        </p>
                        <p className="text-xs text-gray-400 mt-0.5">
                          {fb.guest?.email || ""}
                        </p>
                      </td>

                      {/* Room / dates */}
                      <td className="px-5 py-4 whitespace-nowrap">
                        {roomNum && (
                          <p className="font-medium text-[#0B1F2A] mb-0.5">
                            Room {roomNum}
                          </p>
                        )}
                        <p className="text-xs text-gray-400">
                          {fmtDate(checkIn)} → {fmtDate(checkOut)}
                        </p>
                      </td>

                      {/* Rating */}
                      <td className="px-5 py-4">
                        <StarRating value={fb.rating} readOnly size="text-sm" />
                        <p className="text-xs text-gray-400 mt-0.5">{fb.rating}/5</p>
                      </td>

                      {/* Comment */}
                      <td className="px-5 py-4 max-w-xs">
                        {fb.comment ? (
                          <p className="text-gray-600 text-xs leading-relaxed line-clamp-3">
                            {fb.comment}
                          </p>
                        ) : (
                          <span className="text-gray-300 text-xs italic">No comment</span>
                        )}
                      </td>

                      {/* Submitted date */}
                      <td className="px-5 py-4 whitespace-nowrap text-xs text-gray-400">
                        {fmtDate(fb.createdAt)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
