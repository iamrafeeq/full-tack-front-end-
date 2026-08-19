import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchAllRooms,
  updateRoomStatus,
  deleteRoom,
} from "../../../redux/slice/roomSlice/roomSlice";

import AdminLayout from "../../../components/admin/AdminLayout";
import RoomFormModal from "../../../components/admin/rooms/RoomFormModal";

// Status badge colors mapped to each backend enum value
const STATUS_STYLES = {
  available:   "bg-green-100 text-green-700",
  reserved:    "bg-blue-100 text-blue-700",
  occupied:    "bg-orange-100 text-orange-700",
  cleaning:    "bg-yellow-100 text-yellow-700",
  maintenance: "bg-red-100 text-red-600",
};

// All status options from backend enum
const STATUS_OPTIONS = ["available", "reserved", "occupied", "cleaning", "maintenance"];
const TYPE_FILTERS   = ["all", "single", "double", "deluxe", "suite"];

export default function Rooms() {
  const dispatch = useDispatch();
  const {
    rooms, total, loading, error,
    statusLoading, deleteLoading, deleteError, statusError,
  } = useSelector((state) => state.rooms);

  // ── Local UI state ──────────────────────────────────────────────────────────
  const [search,      setSearch]      = useState("");
  const [typeFilter,  setTypeFilter]  = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  // Modal: null = closed | "create" = add form | room object = edit form
  const [modal,       setModal]       = useState(null);

  // Confirm delete: stores the room pending deletion
  const [confirmDelete, setConfirmDelete] = useState(null);

  // Fetch all rooms when the page mounts
  useEffect(() => {
    dispatch(fetchAllRooms());
  }, [dispatch]);

  // ── Client-side filtering ───────────────────────────────────────────────────
  const filtered = rooms.filter((r) => {
    const matchesSearch =
      r.roomNumber?.toLowerCase().includes(search.toLowerCase()) ||
      r.type?.toLowerCase().includes(search.toLowerCase());
    const matchesType   = typeFilter   === "all" || r.type   === typeFilter;
    const matchesStatus = statusFilter === "all" || r.status === statusFilter;
    return matchesSearch && matchesType && matchesStatus;
  });

  // ── Handlers ───────────────────────────────────────────────────────────────

  // Change a room's status directly from the table dropdown
  const handleStatusChange = (id, status) => {
    dispatch(updateRoomStatus({ id, status }));
  };

  // Confirm then delete
  const handleDelete = () => {
    if (!confirmDelete) return;
    dispatch(deleteRoom(confirmDelete._id)).then((res) => {
      if (!res.error) setConfirmDelete(null);
    });
  };

  return (
    <AdminLayout>
      {/* ── Top bar ──────────────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        {/* Search by room number or type */}
        <div className="relative flex-1 min-w-[160px] max-w-xs">
          <span className="absolute left-3 top-2.5 text-gray-400 text-sm">🔍</span>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Room no. or type..."
            className="w-full pl-8 pr-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:border-[#C9A24B]"
          />
        </div>

        {/* Filter by room type */}
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="text-sm border border-gray-300 rounded-md px-3 py-2 bg-white focus:outline-none focus:border-[#C9A24B]"
        >
          {TYPE_FILTERS.map((t) => (
            <option key={t} value={t}>
              {t === "all" ? "All Types" : t.charAt(0).toUpperCase() + t.slice(1)}
            </option>
          ))}
        </select>

        {/* Filter by status */}
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="text-sm border border-gray-300 rounded-md px-3 py-2 bg-white focus:outline-none focus:border-[#C9A24B]"
        >
          <option value="all">All Status</option>
          {STATUS_OPTIONS.map((s) => (
            <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
          ))}
        </select>

        <span className="text-sm text-gray-400 whitespace-nowrap">
          {filtered.length} / {total} rooms
        </span>

        {/* Add Room button — opens create modal */}
        <button
          onClick={() => setModal("create")}
          className="ml-auto bg-[#0B1F2A] text-white text-sm px-4 py-2 rounded-md hover:opacity-90 flex items-center gap-2"
        >
          + Add Room
        </button>
      </div>

      {/* ── Error banners ────────────────────────────────────────────────── */}
      {(deleteError || statusError) && (
        <div className="mb-4 px-4 py-2.5 bg-red-50 border border-red-200 rounded-md text-sm text-red-600">
          {deleteError || statusError}
        </div>
      )}

      {/* ── Loading spinner ──────────────────────────────────────────────── */}
      {loading && (
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 border-4 border-[#C9A24B] border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {/* ── Fetch error ──────────────────────────────────────────────────── */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-md">
          {error}
        </div>
      )}

      {/* ── Rooms table ──────────────────────────────────────────────────── */}
      {!loading && !error && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 text-left">
                {["#", "Room No.", "Type", "Floor", "Capacity", "Bed", "Price", "Amenities", "Status", "Actions"].map((h) => (
                  <th key={h} className="px-4 py-3 text-xs uppercase tracking-wide text-gray-400 font-medium whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={10} className="text-center py-12 text-gray-400">No rooms found.</td>
                </tr>
              ) : (
                filtered.map((room, idx) => (
                  <tr key={room._id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 text-gray-400">{idx + 1}</td>

                    {/* Room number */}
                    <td className="px-4 py-3 font-semibold text-[#0B1F2A]">{room.roomNumber}</td>

                    {/* Room type */}
                    <td className="px-4 py-3 capitalize text-gray-600">{room.type}</td>

                    {/* Floor */}
                    <td className="px-4 py-3 text-gray-500">{room.floor}</td>

                    {/* Capacity */}
                    <td className="px-4 py-3 text-gray-500">{room.capacity} pax</td>

                    {/* Bed type */}
                    <td className="px-4 py-3 capitalize text-gray-500">{room.bedType}</td>

                    {/* Price — show discount if available */}
                    <td className="px-4 py-3 whitespace-nowrap">
                      {room.discountPrice ? (
                        <span>
                          <span className="text-[#0B1F2A] font-medium">${room.discountPrice}</span>
                          <span className="text-gray-400 line-through text-xs ml-1">${room.price}</span>
                        </span>
                      ) : (
                        <span className="font-medium text-[#0B1F2A]">${room.price}</span>
                      )}
                    </td>

                    {/* Amenities pills — show first 3, then +N */}
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1">
                        {(room.amenities || []).slice(0, 3).map((a) => (
                          <span key={a} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{a}</span>
                        ))}
                        {room.amenities?.length > 3 && (
                          <span className="text-xs text-gray-400">+{room.amenities.length - 3}</span>
                        )}
                      </div>
                    </td>

                    {/* Status — inline dropdown to change without opening a modal */}
                    <td className="px-4 py-3">
                      <select
                        value={room.status}
                        onChange={(e) => handleStatusChange(room._id, e.target.value)}
                        disabled={statusLoading}
                        className={`text-xs px-2.5 py-1 rounded-full border-0 font-medium cursor-pointer focus:outline-none ${STATUS_STYLES[room.status]}`}
                      >
                        {STATUS_OPTIONS.map((s) => (
                          <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                        ))}
                      </select>
                    </td>

                    {/* Actions: Edit + Delete */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {/* Edit — opens edit modal pre-filled with this room */}
                        <button
                          onClick={() => setModal(room)}
                          className="text-xs px-3 py-1.5 rounded-md border border-[#C9A24B] text-[#C9A24B] hover:bg-[#C9A24B] hover:text-[#0B1F2A] transition-colors"
                        >
                          Edit
                        </button>

                        {/* Delete — shows confirmation dialog first */}
                        <button
                          onClick={() => setConfirmDelete(room)}
                          className="text-xs px-3 py-1.5 rounded-md border border-red-300 text-red-500 hover:bg-red-50 transition-colors"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* ── Create / Edit modal ──────────────────────────────────────────── */}
      {modal && (
        <RoomFormModal
          editRoom={modal === "create" ? null : modal}
          onClose={() => setModal(null)}
          onSuccess={() => dispatch(fetchAllRooms())}
        />
      )}

      {/* ── Delete confirmation dialog ───────────────────────────────────── */}
      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setConfirmDelete(null)} />
          <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-sm z-10 p-6">
            <h3 className="text-lg font-serif text-[#0B1F2A] mb-2">Delete Room {confirmDelete.roomNumber}?</h3>
            <p className="text-sm text-gray-500 mb-6">
              This action is permanent and cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setConfirmDelete(null)}
                className="border border-gray-300 text-sm px-4 py-2 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleteLoading}
                className="bg-red-600 text-white text-sm px-4 py-2 rounded-md hover:bg-red-700 disabled:opacity-60"
              >
                {deleteLoading ? "Deleting..." : "Yes, Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
