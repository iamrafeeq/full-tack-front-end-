import { useState } from "react";
import { useSelector } from "react-redux";
import { Card, Spinner, Empty } from "./shared";

const ROOM_STATUS_STYLES = {
  available:   "bg-green-100 text-green-700",
  reserved:    "bg-blue-100 text-blue-700",
  occupied:    "bg-red-100 text-red-700",
  cleaning:    "bg-yellow-100 text-yellow-700",
  maintenance: "bg-gray-100 text-gray-500",
};

const STATUS_OPTIONS = ["all", "available", "reserved", "occupied", "cleaning", "maintenance"];

export default function RoomStatusTable() {
  const { rooms, loading } = useSelector((s) => s.rooms);
  const [filter, setFilter] = useState("all");

  const filtered = rooms.filter((r) => filter === "all" || r.status === filter);

  return (
    <Card
      title="Room Status"
      icon="🛏️"
      count={filtered.length}
      action={
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="text-xs border border-gray-200 rounded-md px-2 py-1.5 bg-white focus:outline-none focus:border-[#C9A24B]"
        >
          {STATUS_OPTIONS.map((s) => (
            <option key={s} value={s} className="capitalize">
              {s === "all" ? "All Statuses" : s}
            </option>
          ))}
        </select>
      }
    >
      {loading ? (
        <Spinner />
      ) : filtered.length === 0 ? (
        <Empty msg="No rooms match this filter." />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                {["Room No.", "Type", "Floor", "Capacity", "Price / Night", "Status"].map((h) => (
                  <th
                    key={h}
                    className="px-4 py-3 text-xs uppercase tracking-wide text-gray-400 font-medium text-left whitespace-nowrap"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((r) => (
                <tr key={r._id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 font-medium text-[#0B1F2A]">{r.roomNumber}</td>
                  <td className="px-4 py-3 capitalize text-gray-600">{r.type}</td>
                  <td className="px-4 py-3 text-gray-500">{r.floor ?? "—"}</td>
                  <td className="px-4 py-3 text-gray-500">{r.capacity}</td>
                  <td className="px-4 py-3 text-gray-700">
                    ${(r.discountPrice || r.price)?.toLocaleString()}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`text-xs font-medium px-2.5 py-1 rounded-full capitalize ${
                        ROOM_STATUS_STYLES[r.status] || "bg-gray-100 text-gray-500"
                      }`}
                    >
                      {r.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  );
}
