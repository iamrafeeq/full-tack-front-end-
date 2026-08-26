import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import HousekeepingLayout from "../../components/housekeeping/HousekeepingLayout";
import SkeletonRow from "../../components/SkeletonRow";
import {
  fetchCleaningTables,
  markTableClean,
} from "../../redux/slice/housekeeping/housekeepingSlice";

export default function TablesCleaning() {
  const dispatch = useDispatch();
  const { cleaningTables, tablesLoading, tablesError, tableMarkLoading, tableMarkError } =
    useSelector((s) => s.housekeeping);

  useEffect(() => { dispatch(fetchCleaningTables()); }, [dispatch]);

  return (
    <HousekeepingLayout title="Tables to Clean">
      <div className="max-w-4xl">
        <div className="mb-6">
          <h1 className="text-2xl font-serif text-[#0B1F2A]">Tables to Clean</h1>
          <p className="text-sm text-gray-500 mt-1">Mark each table clean once housekeeping is complete.</p>
        </div>

        {tableMarkError && (
          <div className="mb-4 flex items-center gap-3 rounded-lg bg-red-50 border border-red-100 px-4 py-3 text-sm text-red-700">
            {tableMarkError}
          </div>
        )}

        {!tablesLoading && !tablesError && (
          <div className="flex items-center gap-2 mb-4">
            <span className="text-sm text-gray-500">
              {cleaningTables.length === 0
                ? "All tables are clean"
                : `${cleaningTables.length} table${cleaningTables.length === 1 ? "" : "s"} need${cleaningTables.length === 1 ? "s" : ""} cleaning`}
            </span>
            <button onClick={() => dispatch(fetchCleaningTables())} className="text-xs text-[#C9A24B] underline ml-auto">
              Refresh
            </button>
          </div>
        )}

        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          {tablesError ? (
            <div className="m-5 rounded-lg bg-red-50 border border-red-100 px-4 py-3 text-sm text-red-700">
              {tablesError}
              <button onClick={() => dispatch(fetchCleaningTables())} className="ml-3 underline text-red-600 text-xs">Retry</button>
            </div>
          ) : !tablesLoading && cleaningTables.length === 0 ? (
            <div className="py-20 flex flex-col items-center gap-3 text-center">
              <span className="text-4xl">✨</span>
              <p className="font-medium text-gray-700">All tables are clean!</p>
              <p className="text-sm text-gray-400">Nothing needs attention right now.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100 text-left">
                    {["Table #", "Capacity", "Location", "Action"].map((h) => (
                      <th key={h} className="px-5 py-3 text-xs font-medium text-gray-400 uppercase tracking-wide whitespace-nowrap">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {tablesLoading ? Array.from({length: 5}, (_, i) => <SkeletonRow key={i} cols={4} />) : cleaningTables.map((table) => (
                    <tr key={table._id} className="border-b border-gray-50 hover:bg-gray-50/60 transition-colors">
                      <td className="px-5 py-3.5 font-semibold text-[#0B1F2A]">{table.tableNumber}</td>
                      <td className="px-5 py-3.5 text-gray-600">{table.capacity} seats</td>
                      <td className="px-5 py-3.5 capitalize text-gray-500">{table.location?.replace("-", " ") || "—"}</td>
                      <td className="px-5 py-3.5">
                        <button
                          onClick={() => dispatch(markTableClean(table._id))}
                          disabled={tableMarkLoading === table._id}
                          className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-[#0B1F2A] text-white text-xs font-medium hover:opacity-90 disabled:opacity-50 transition-opacity"
                        >
                          {tableMarkLoading === table._id ? (
                            <><span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />Marking…</>
                          ) : <>✓ Mark Clean</>}
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
