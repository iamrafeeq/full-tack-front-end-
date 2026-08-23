import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchAllRooms,
  updateRoomStatus,
  deleteRoom,
  deactivateRoom,
  activateRoom,
  clearDeleteError,
  clearActionErrors,
} from "../../../redux/slice/roomSlice/roomSlice";
import AdminLayout from "../../../components/admin/AdminLayout";
import RoomFormModal from "../../../components/admin/rooms/RoomFormModal";
import {
  StatCard, TableCard, Th, Badge, Spinner, ErrorBanner, EmptyState, Modal, btn,
} from "../../../components/admin/AdminUI";
import { apiBase } from "../../../api/axios";

const TYPE_IMAGES = {
  single: "https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=900&q=80",
  double: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=900&q=80",
  deluxe: "https://images.unsplash.com/photo-1611892440504-42a792e24d32?auto=format&fit=crop&w=900&q=80",
  suite:  "https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=900&q=80",
};
const toImgUrl = (img) => img.startsWith("http") ? img : `${apiBase}/${img}`;

const AMENITY_ICONS = {
  AC: "❄️", WiFi: "📶", TV: "📺", Minibar: "🍹",
  Balcony: "🌿", RoomService: "🛎️", Heater: "🔥",
};

const STATUS_OPTIONS = ["available", "reserved", "occupied", "cleaning", "maintenance"];
const TYPE_FILTERS   = ["all", "single", "double", "deluxe", "suite"];

const STATUS_SELECT = {
  available:   "bg-green-100 text-green-700",
  reserved:    "bg-blue-100 text-blue-700",
  occupied:    "bg-orange-100 text-orange-700",
  cleaning:    "bg-yellow-100 text-yellow-700",
  maintenance: "bg-red-100 text-red-600",
};

export default function Rooms() {
  const dispatch = useDispatch();
  const {
    rooms, total, loading, error,
    statusLoading, statusError,
    deleteLoading, deleteError,
    deactivateLoading, deactivateError,
    activateLoading, activateError,
  } = useSelector((s) => s.rooms);

  const [search,          setSearch]          = useState("");
  const [typeFilter,      setTypeFilter]      = useState("all");
  const [statusFilter,    setStatusFilter]    = useState("all");
  const [includeInactive, setIncludeInactive] = useState(false);
  const [modal,           setModal]           = useState(null);
  const [viewRoom,        setViewRoom]        = useState(null);
  const [confirmDelete,   setConfirmDelete]   = useState(null);
  const [deleteModalError, setDeleteModalError] = useState(null);

  // Re-fetch whenever the includeInactive toggle changes
  useEffect(() => {
    dispatch(fetchAllRooms(includeInactive));
  }, [dispatch, includeInactive]);

  // Clear action-level errors when the page unmounts to avoid stale banners
  useEffect(() => () => dispatch(clearActionErrors()), [dispatch]);

  const filtered = useMemo(
    () =>
      rooms.filter((r) => {
        // Client-side guard: after a deactivate the room stays in Redux with
        // isActive=false; hide it when the toggle is off.
        if (!includeInactive && r.isActive === false) return false;
        const q = search.toLowerCase();
        const matchesSearch =
          r.roomNumber?.toLowerCase().includes(q) || r.type?.toLowerCase().includes(q);
        return (
          matchesSearch &&
          (typeFilter === "all" || r.type === typeFilter) &&
          (statusFilter === "all" || r.status === statusFilter)
        );
      }),
    [rooms, search, typeFilter, statusFilter, includeInactive]
  );

  const counts = useMemo(() => {
    const active = rooms.filter((r) => r.isActive !== false);
    const by = (s) => active.filter((r) => r.status === s).length;
    return {
      total:       total || rooms.length,
      available:   by("available"),
      occupied:    by("occupied") + by("reserved"),
      maintenance: by("maintenance") + by("cleaning"),
    };
  }, [rooms, total]);

  const openDeleteModal = (room) => {
    setDeleteModalError(null);
    dispatch(clearDeleteError());
    setConfirmDelete(room);
  };

  const handleDelete = () => {
    if (!confirmDelete) return;
    setDeleteModalError(null);
    dispatch(deleteRoom(confirmDelete._id)).then((res) => {
      if (!res.error) {
        setConfirmDelete(null);
      } else {
        // res.payload is the message string from rejectWithValue
        setDeleteModalError(res.payload || "Failed to delete room.");
      }
    });
  };

  const resetFilters = () => {
    setSearch("");
    setTypeFilter("all");
    setStatusFilter("all");
  };

  return (
    <AdminLayout>
      {/* Stat row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 mb-6">
        <StatCard title="Total Rooms"            value={counts.total}       icon="🛏️" accent="#0B1F2A" loading={loading} />
        <StatCard title="Available"              value={counts.available}   icon="✅" accent="#15803d" loading={loading} />
        <StatCard title="Occupied / Reserved"    value={counts.occupied}    icon="🔑" accent="#c2410c" loading={loading} />
        <StatCard title="Cleaning / Maintenance" value={counts.maintenance} icon="🔧" accent="#dc2626" loading={loading} />
      </div>

      {/* Filter / toolbar */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        {/* Search */}
        <div className="relative flex-1 min-w-[180px] max-w-xs">
          <span className="absolute left-3 top-2.5 text-gray-400 text-sm">🔍</span>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Room no. or type…"
            className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:border-[#C9A24B]"
          />
        </div>

        {/* Type filter */}
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="text-sm border border-gray-300 rounded-lg px-3 py-2 bg-white focus:outline-none focus:border-[#C9A24B]"
        >
          {TYPE_FILTERS.map((t) => (
            <option key={t} value={t}>
              {t === "all" ? "All Types" : t[0].toUpperCase() + t.slice(1)}
            </option>
          ))}
        </select>

        {/* Status filter */}
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="text-sm border border-gray-300 rounded-lg px-3 py-2 bg-white focus:outline-none focus:border-[#C9A24B]"
        >
          <option value="all">All Status</option>
          {STATUS_OPTIONS.map((s) => (
            <option key={s} value={s}>{s[0].toUpperCase() + s.slice(1)}</option>
          ))}
        </select>

        {/* Include inactive toggle */}
        <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={includeInactive}
            onChange={(e) => setIncludeInactive(e.target.checked)}
            className="w-4 h-4 accent-[#C9A24B] rounded"
          />
          Include inactive
        </label>

        <span className="text-sm text-gray-400 whitespace-nowrap ml-auto">
          {filtered.length} / {total || rooms.length} rooms
        </span>

        <button onClick={() => setModal("create")} className={btn.primary}>+ Add Room</button>
      </div>

      {/* Page-level error banners */}
      <ErrorBanner>{statusError}</ErrorBanner>
      <ErrorBanner>{deactivateError}</ErrorBanner>
      <ErrorBanner>{activateError}</ErrorBanner>

      {loading && <Spinner />}
      {!loading && error && (
        <ErrorBanner onRetry={() => dispatch(fetchAllRooms(includeInactive))}>{error}</ErrorBanner>
      )}

      {!loading && !error && (
        <TableCard>
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100 text-left">
                {["Room No.", "Type", "Floor", "Capacity", "Bed", "Price", "Amenities", "Status", "Active", "Actions"].map(
                  (h) => <Th key={h}>{h}</Th>
                )}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={10}>
                    <EmptyState
                      icon="🛏️"
                      title="No rooms found"
                      subtitle="Nothing matches those filters."
                      action={<button onClick={resetFilters} className={btn.primary}>Clear filters</button>}
                    />
                  </td>
                </tr>
              ) : (
                filtered.map((room) => {
                  const isInactive = room.isActive === false;
                  return (
                    <tr
                      key={room._id}
                      className={`border-b border-gray-50 transition-colors ${
                        isInactive
                          ? "opacity-50 bg-gray-50"
                          : "hover:bg-gray-50/60"
                      }`}
                    >
                      <td className="px-4 py-3 font-semibold text-[#0B1F2A]">{room.roomNumber}</td>
                      <td className="px-4 py-3 capitalize text-gray-600">{room.type}</td>
                      <td className="px-4 py-3 text-gray-500">{room.floor}</td>
                      <td className="px-4 py-3 text-gray-500 whitespace-nowrap">{room.capacity} pax</td>
                      <td className="px-4 py-3 capitalize text-gray-500">{room.bedType}</td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        {room.discountPrice ? (
                          <>
                            <span className="text-[#0B1F2A] font-medium">${room.discountPrice}</span>
                            <span className="text-gray-400 line-through text-xs ml-1">${room.price}</span>
                          </>
                        ) : (
                          <span className="font-medium text-[#0B1F2A]">${room.price}</span>
                        )}
                      </td>
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
                      <td className="px-4 py-3">
                        <select
                          value={room.status}
                          onChange={(e) =>
                            dispatch(updateRoomStatus({ id: room._id, status: e.target.value }))
                          }
                          disabled={statusLoading || isInactive}
                          className={`text-xs px-2.5 py-1 rounded-full border-0 font-semibold cursor-pointer focus:outline-none disabled:cursor-not-allowed ${
                            STATUS_SELECT[room.status]
                          }`}
                        >
                          {STATUS_OPTIONS.map((s) => (
                            <option key={s} value={s}>{s[0].toUpperCase() + s.slice(1)}</option>
                          ))}
                        </select>
                      </td>
                      <td className="px-4 py-3">
                        <Badge value={isInactive ? "inactive" : "active"} />
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <button
                            onClick={() => setViewRoom(room)}
                            className="px-3 py-1.5 rounded-lg text-xs font-medium text-[#0B1F2A] border border-[#0B1F2A]/30 hover:bg-[#0B1F2A]/10 transition-colors"
                          >
                            View
                          </button>
                          <button
                            onClick={() => setModal(room)}
                            className={btn.ghostGold}
                          >
                            Edit
                          </button>

                          {isInactive ? (
                            <button
                              onClick={() => dispatch(activateRoom(room._id))}
                              disabled={activateLoading === room._id}
                              className={btn.secondary}
                            >
                              {activateLoading === room._id ? "…" : "Activate"}
                            </button>
                          ) : (
                            <button
                              onClick={() => dispatch(deactivateRoom(room._id))}
                              disabled={deactivateLoading === room._id}
                              className={btn.secondary}
                            >
                              {deactivateLoading === room._id ? "…" : "Deactivate"}
                            </button>
                          )}

                          <button
                            onClick={() => openDeleteModal(room)}
                            className={btn.ghostDanger}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </TableCard>
      )}

      {/* Room view modal */}
      {viewRoom && (() => {
        const r = viewRoom;
        const imgs = r.images?.length > 0
          ? r.images.map(toImgUrl)
          : [TYPE_IMAGES[r.type] || TYPE_IMAGES.single];
        return (
          <Modal
            title={`Room ${r.roomNumber} — ${r.type?.charAt(0).toUpperCase() + r.type?.slice(1)}`}
            onClose={() => setViewRoom(null)}
            size="max-w-2xl"
            footer={
              <button onClick={() => setViewRoom(null)} className={btn.secondary}>Close</button>
            }
          >
            {/* Image gallery */}
            <div className={`grid gap-2 ${imgs.length > 1 ? "grid-cols-3" : "grid-cols-1"}`}>
              {imgs.map((src, i) => (
                <img
                  key={i}
                  src={src}
                  alt={`Room ${r.roomNumber} photo ${i + 1}`}
                  className={`w-full object-cover rounded-lg ${imgs.length > 1 ? "h-28" : "h-52"}`}
                />
              ))}
            </div>

            {/* Details grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-2">
              {[
                { label: "Room No.",  value: r.roomNumber },
                { label: "Type",      value: r.type,    capitalize: true },
                { label: "Floor",     value: `Floor ${r.floor}` },
                { label: "Capacity",  value: `${r.capacity} guests` },
                { label: "Bed Type",  value: r.bedType, capitalize: true },
                { label: "Status",    value: <Badge value={r.status} /> },
              ].map(({ label, value, capitalize }) => (
                <div key={label} className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">{label}</p>
                  <p className={`text-sm font-medium text-[#0B1F2A] ${capitalize ? "capitalize" : ""}`}>
                    {value}
                  </p>
                </div>
              ))}
            </div>

            {/* Price */}
            <div className="flex items-baseline gap-3">
              <span className="text-2xl font-serif text-[#C9A24B]">
                ${r.discountPrice || r.price}
                <span className="text-sm text-gray-400 font-normal">/night</span>
              </span>
              {r.discountPrice && (
                <span className="text-sm text-gray-400 line-through">${r.price}</span>
              )}
            </div>

            {/* Description */}
            {r.description && (
              <div>
                <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Description</p>
                <p className="text-sm text-gray-600 leading-relaxed">{r.description}</p>
              </div>
            )}

            {/* Amenities */}
            {r.amenities?.length > 0 && (
              <div>
                <p className="text-xs text-gray-400 uppercase tracking-wide mb-2">Amenities</p>
                <div className="flex flex-wrap gap-2">
                  {r.amenities.map((a) => (
                    <span key={a} className="inline-flex items-center gap-1.5 text-xs bg-gray-100 text-gray-700 px-3 py-1.5 rounded-full">
                      {AMENITY_ICONS[a] || "✔️"} {a}
                    </span>
                  ))}
                  {r.smokingAllowed && (
                    <span className="inline-flex items-center gap-1.5 text-xs bg-gray-100 text-gray-700 px-3 py-1.5 rounded-full">
                      🚬 Smoking Allowed
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Active status */}
            <div className="flex items-center gap-2 text-sm">
              <span className={`w-2 h-2 rounded-full ${r.isActive === false ? "bg-gray-400" : "bg-green-500"}`} />
              <span className="text-gray-500">{r.isActive === false ? "Inactive — not bookable" : "Active"}</span>
            </div>
          </Modal>
        );
      })()}

      {/* Room create / edit modal */}
      {modal && (
        <RoomFormModal
          editRoom={modal === "create" ? null : modal}
          onClose={() => setModal(null)}
          onSuccess={() => dispatch(fetchAllRooms(includeInactive))}
        />
      )}

      {/* Delete confirmation modal */}
      {confirmDelete && (
        <Modal
          title={`Delete Room ${confirmDelete.roomNumber}?`}
          onClose={() => setConfirmDelete(null)}
          size="max-w-sm"
          footer={
            <>
              <button onClick={() => setConfirmDelete(null)} className={btn.secondary}>Cancel</button>
              <button onClick={handleDelete} disabled={deleteLoading} className={btn.danger}>
                {deleteLoading ? "Deleting…" : "Yes, Delete"}
              </button>
            </>
          }
        >
          {deleteModalError ? (
            <div className="rounded-lg bg-red-50 border border-red-100 px-4 py-3 text-sm text-red-700">
              <p className="font-medium mb-1">Cannot delete this room</p>
              <p>{deleteModalError}</p>
              <p className="mt-2 text-red-500 text-xs">
                Use <strong>Deactivate</strong> to take it out of circulation while preserving its history.
              </p>
            </div>
          ) : (
            <p className="text-sm text-gray-500">
              This permanently removes the room. Only rooms with <em>no booking history at all</em> can
              be deleted — rooms with past bookings must be deactivated instead.
            </p>
          )}
        </Modal>
      )}
    </AdminLayout>
  );
}
