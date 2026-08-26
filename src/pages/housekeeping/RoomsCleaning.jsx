import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import HousekeepingLayout from "../../components/housekeeping/HousekeepingLayout";
import SkeletonRow from "../../components/SkeletonRow";
import {
  fetchCleaningRooms,
  markRoomClean,
} from "../../redux/slice/housekeeping/housekeepingSlice";

export default function RoomsCleaning() {
  const dispatch = useDispatch();
  const { cleaningRooms, loading, error, markLoading, markError } =
    useSelector((s) => s.housekeeping);

  useEffect(() => {
    dispatch(fetchCleaningRooms());
  }, [dispatch]);

  return (
    <HousekeepingLayout title="Rooms to Clean">
      <div className="max-w-4xl">
        {/* Page header */}
        <div className="mb-6">
          <h1 className="text-2xl font-serif text-[#0B1F2A]">Rooms to Clean</h1>
          <p className="text-sm text-gray-500 mt-1">
            Mark each room clean once housekeeping is complete.
          </p>
        </div>

        {/* Error banners */}
        {markError && (
          <div className="mb-4 flex items-center gap-3 rounded-lg bg-red-50 border border-red-100 px-4 py-3 text-sm text-red-700">
            {markError}
          </div>
        )}

        {/* Count badge */}
        {!loading && !error && (
          <div className="flex items-center gap-2 mb-4">
            <span className="text-sm text-gray-500">
              {cleaningRooms.length === 0
                ? "All rooms are clean"
                : `${cleaningRooms.length} room${cleaningRooms.length === 1 ? "" : "s"} need${cleaningRooms.length === 1 ? "s" : ""} cleaning`}
            </span>
            <button
              onClick={() => dispatch(fetchCleaningRooms())}
              className="text-xs text-[#C9A24B] underline ml-auto"
            >
              Refresh
            </button>
          </div>
        )}

        {/* Table card */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          {error ? (
            <div className="m-5 rounded-lg bg-red-50 border border-red-100 px-4 py-3 text-sm text-red-700">
              {error}
              <button
                onClick={() => dispatch(fetchCleaningRooms())}
                className="ml-3 underline text-red-600 text-xs"
              >
                Retry
              </button>
            </div>
          ) : !loading && cleaningRooms.length === 0 ? (
            <div className="py-20 flex flex-col items-center gap-3 text-center">
              <span className="text-4xl">✨</span>
              <p className="font-medium text-gray-700">All rooms are clean!</p>
              <p className="text-sm text-gray-400">Nothing needs attention right now.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100 text-left">
                    {["Room #", "Type", "Floor", "Bed Type", "Action"].map((h) => (
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
                  {loading ? Array.from({length: 5}, (_, i) => <SkeletonRow key={i} cols={5} />) : cleaningRooms.map((room) => (
                    <tr
                      key={room._id}
                      className="border-b border-gray-50 hover:bg-gray-50/60 transition-colors"
                    >
                      <td className="px-5 py-3.5 font-semibold text-[#0B1F2A]">
                        {room.roomNumber}
                      </td>
                      <td className="px-5 py-3.5 capitalize text-gray-600">{room.type}</td>
                      <td className="px-5 py-3.5 text-gray-500">{room.floor ?? "—"}</td>
                      <td className="px-5 py-3.5 capitalize text-gray-500">{room.bedType ?? "—"}</td>
                      <td className="px-5 py-3.5">
                        <button
                          onClick={() => dispatch(markRoomClean(room._id))}
                          disabled={markLoading === room._id}
                          className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-[#0B1F2A] text-white text-xs font-medium hover:opacity-90 disabled:opacity-50 transition-opacity"
                        >
                          {markLoading === room._id ? (
                            <>
                              <span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                              Marking…
                            </>
                          ) : (
                            <>✓ Mark Clean</>
                          )}
                        </button>
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
