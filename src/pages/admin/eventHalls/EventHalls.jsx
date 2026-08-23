import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchAllEventHalls, createEventHall, updateEventHall, updateEventHallStatus,
  deactivateEventHall, activateEventHall, deleteEventHall,
  clearFormErrors, clearDeleteError, clearActionErrors,
} from "../../../redux/slice/eventHalls/eventHallSlice";
import AdminLayout from "../../../components/admin/AdminLayout";
import {
  StatCard, TableCard, Th, Badge, Spinner, ErrorBanner, EmptyState, Modal, btn,
} from "../../../components/admin/AdminUI";

const STATUS_OPTIONS = ["available", "booked", "maintenance"];
const STATUS_COLORS  = {
  available:   "bg-green-100 text-green-700",
  booked:      "bg-blue-100 text-blue-700",
  maintenance: "bg-yellow-100 text-yellow-700",
};

const EMPTY_FORM = { hallName: "", capacity: "", hourlyRate: "", amenities: "" };

function HallFormModal({ editHall, onClose, onSuccess }) {
  const dispatch = useDispatch();
  const { createLoading, createError, updateLoading, updateError } = useSelector((s) => s.eventHalls);

  const [form, setForm] = useState(
    editHall
      ? {
          hallName:   editHall.hallName   || "",
          capacity:   editHall.capacity   || "",
          hourlyRate: editHall.hourlyRate  || "",
          amenities:  (editHall.amenities || []).join(", "),
        }
      : EMPTY_FORM
  );
  const [errs, setErrs] = useState({});

  useEffect(() => { dispatch(clearFormErrors()); }, [dispatch]);

  const isEditing = !!editHall;
  const loading   = isEditing ? updateLoading : createLoading;
  const apiError  = isEditing ? updateError   : createError;

  const validate = () => {
    const e = {};
    if (!form.hallName.trim())           e.hallName   = "Hall name is required.";
    if (!form.capacity || Number(form.capacity) < 1) e.capacity  = "Capacity must be at least 1.";
    if (!form.hourlyRate || Number(form.hourlyRate) < 0) e.hourlyRate = "Hourly rate must be 0 or more.";
    setErrs(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    const amenitiesArr = form.amenities
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    const data = {
      hallName:   form.hallName.trim(),
      capacity:   Number(form.capacity),
      hourlyRate: Number(form.hourlyRate),
      amenities:  amenitiesArr,
    };
    const action = isEditing
      ? updateEventHall({ id: editHall._id, data })
      : createEventHall(data);
    dispatch(action).then((res) => { if (!res.error) { onSuccess?.(); onClose(); } });
  };

  const field = (name) =>
    `w-full border rounded-md px-3 py-2 text-sm focus:outline-none transition-colors ${
      errs[name] ? "border-red-400" : "border-gray-300 focus:border-[#C9A24B]"
    }`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-md z-10">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-lg font-serif text-[#0B1F2A]">
            {isEditing ? `Edit Hall — ${editHall.hallName}` : "Add New Event Hall"}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">×</button>
        </div>
        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          {apiError && (
            <div className="px-4 py-2.5 bg-red-50 border border-red-200 rounded-md text-sm text-red-600">{apiError}</div>
          )}

          <div>
            <label className="block text-xs uppercase tracking-wide text-gray-500 mb-1">Hall Name *</label>
            <input value={form.hallName}
              onChange={(e) => setForm((p) => ({ ...p, hallName: e.target.value }))}
              className={field("hallName")} placeholder="e.g. Grand Ballroom" />
            {errs.hallName && <p className="text-red-500 text-xs mt-1">{errs.hallName}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs uppercase tracking-wide text-gray-500 mb-1">Capacity *</label>
              <input type="number" min="1" max="5000" value={form.capacity}
                onChange={(e) => setForm((p) => ({ ...p, capacity: e.target.value }))}
                className={field("capacity")} placeholder="200" />
              {errs.capacity && <p className="text-red-500 text-xs mt-1">{errs.capacity}</p>}
            </div>
            <div>
              <label className="block text-xs uppercase tracking-wide text-gray-500 mb-1">Hourly Rate ($) *</label>
              <input type="number" min="0" step="0.01" value={form.hourlyRate}
                onChange={(e) => setForm((p) => ({ ...p, hourlyRate: e.target.value }))}
                className={field("hourlyRate")} placeholder="500" />
              {errs.hourlyRate && <p className="text-red-500 text-xs mt-1">{errs.hourlyRate}</p>}
            </div>
          </div>

          <div>
            <label className="block text-xs uppercase tracking-wide text-gray-500 mb-1">Amenities</label>
            <input value={form.amenities}
              onChange={(e) => setForm((p) => ({ ...p, amenities: e.target.value }))}
              className={field("amenities")}
              placeholder="WiFi, Projector, PA System, Stage (comma-separated)" />
            <p className="text-xs text-gray-400 mt-1">Separate each amenity with a comma.</p>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className={btn.secondary}>Cancel</button>
            <button type="submit" disabled={loading} className={btn.primary}>
              {loading ? "Saving…" : isEditing ? "Save Changes" : "Add Hall"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function AdminEventHalls() {
  const dispatch = useDispatch();
  const {
    halls, total, loading, error,
    statusLoading, statusError,
    deleteLoading, deleteError,
    deactivateLoading, deactivateError,
    activateLoading, activateError,
  } = useSelector((s) => s.eventHalls);

  const [search,           setSearch]           = useState("");
  const [statusFilter,     setStatusFilter]     = useState("all");
  const [includeInactive,  setIncludeInactive]  = useState(false);
  const [modal,            setModal]            = useState(null);
  const [confirmDelete,    setConfirmDelete]    = useState(null);
  const [deleteModalError, setDeleteModalError] = useState(null);

  useEffect(() => { dispatch(fetchAllEventHalls(includeInactive)); }, [dispatch, includeInactive]);
  useEffect(() => () => dispatch(clearActionErrors()), [dispatch]);

  const filtered = useMemo(() =>
    halls.filter((h) => {
      if (!includeInactive && h.isActive === false) return false;
      const q = search.toLowerCase();
      return (
        (h.hallName?.toLowerCase().includes(q) ||
         (h.amenities || []).some((a) => a.toLowerCase().includes(q))) &&
        (statusFilter === "all" || h.status === statusFilter)
      );
    }),
    [halls, search, statusFilter, includeInactive]
  );

  const counts = useMemo(() => {
    const active = halls.filter((h) => h.isActive !== false);
    return {
      total:       total || halls.length,
      available:   active.filter((h) => h.status === "available").length,
      booked:      active.filter((h) => h.status === "booked").length,
      maintenance: active.filter((h) => h.status === "maintenance").length,
    };
  }, [halls, total]);

  const openDeleteModal = (hall) => {
    setDeleteModalError(null);
    dispatch(clearDeleteError());
    setConfirmDelete(hall);
  };

  const handleDelete = () => {
    if (!confirmDelete) return;
    setDeleteModalError(null);
    dispatch(deleteEventHall(confirmDelete._id)).then((res) => {
      if (!res.error) setConfirmDelete(null);
      else setDeleteModalError(res.payload || "Failed to delete event hall.");
    });
  };

  return (
    <AdminLayout>
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 mb-6">
        <StatCard title="Total Halls"  value={counts.total}       icon="🏛️" accent="#0B1F2A" loading={loading} />
        <StatCard title="Available"    value={counts.available}   icon="✅" accent="#15803d" loading={loading} />
        <StatCard title="Booked"       value={counts.booked}      icon="📅" accent="#2563eb" loading={loading} />
        <StatCard title="Maintenance"  value={counts.maintenance} icon="🔧" accent="#a16207" loading={loading} />
      </div>

      <div className="flex flex-wrap items-center gap-3 mb-6">
        <div className="relative flex-1 min-w-[180px] max-w-xs">
          <span className="absolute left-3 top-2.5 text-gray-400 text-sm">🔍</span>
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Hall name or amenity…"
            className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:border-[#C9A24B]" />
        </div>

        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
          className="text-sm border border-gray-300 rounded-lg px-3 py-2 bg-white focus:outline-none focus:border-[#C9A24B]">
          <option value="all">All Status</option>
          {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s[0].toUpperCase() + s.slice(1)}</option>)}
        </select>

        <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer select-none">
          <input type="checkbox" checked={includeInactive} onChange={(e) => setIncludeInactive(e.target.checked)}
            className="w-4 h-4 accent-[#C9A24B] rounded" />
          Include inactive
        </label>

        <span className="text-sm text-gray-400 whitespace-nowrap ml-auto">
          {filtered.length} / {total || halls.length} halls
        </span>
        <button onClick={() => setModal("create")} className={btn.primary}>+ Add Hall</button>
      </div>

      <ErrorBanner>{statusError}</ErrorBanner>
      <ErrorBanner>{deactivateError}</ErrorBanner>
      <ErrorBanner>{activateError}</ErrorBanner>

      {loading && <Spinner />}
      {!loading && error && (
        <ErrorBanner onRetry={() => dispatch(fetchAllEventHalls(includeInactive))}>{error}</ErrorBanner>
      )}

      {!loading && !error && (
        <TableCard>
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100 text-left">
                {["Hall Name", "Capacity", "Rate / hr", "Amenities", "Status", "Active", "Actions"].map((h) => (
                  <Th key={h}>{h}</Th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={7}>
                  <EmptyState icon="🏛️" title="No event halls found" subtitle="Nothing matches those filters."
                    action={<button onClick={() => { setSearch(""); setStatusFilter("all"); }} className={btn.primary}>Clear filters</button>}
                  />
                </td></tr>
              ) : filtered.map((hall) => {
                const isInactive = hall.isActive === false;
                return (
                  <tr key={hall._id} className={`border-b border-gray-50 transition-colors ${isInactive ? "opacity-50 bg-gray-50" : "hover:bg-gray-50/60"}`}>
                    <td className="px-4 py-3 font-semibold text-[#0B1F2A]">{hall.hallName}</td>
                    <td className="px-4 py-3 text-gray-600">{hall.capacity} guests</td>
                    <td className="px-4 py-3 text-gray-600">${(hall.hourlyRate || 0).toLocaleString()}</td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1">
                        {(hall.amenities || []).slice(0, 3).map((a) => (
                          <span key={a} className="text-xs bg-[#C9A24B]/10 text-[#7a5c1e] px-2 py-0.5 rounded-full">{a}</span>
                        ))}
                        {(hall.amenities || []).length > 3 && (
                          <span className="text-xs text-gray-400">+{hall.amenities.length - 3}</span>
                        )}
                        {(hall.amenities || []).length === 0 && <span className="text-xs text-gray-400">—</span>}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <select value={hall.status}
                        onChange={(e) => dispatch(updateEventHallStatus({ id: hall._id, status: e.target.value }))}
                        disabled={statusLoading || isInactive}
                        className={`text-xs px-2.5 py-1 rounded-full border-0 font-semibold cursor-pointer focus:outline-none disabled:cursor-not-allowed ${STATUS_COLORS[hall.status] || "bg-gray-100 text-gray-600"}`}>
                        {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s[0].toUpperCase() + s.slice(1)}</option>)}
                      </select>
                    </td>
                    <td className="px-4 py-3"><Badge value={isInactive ? "inactive" : "active"} /></td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <button onClick={() => setModal(hall)} className={btn.ghostGold}>Edit</button>
                        {isInactive ? (
                          <button onClick={() => dispatch(activateEventHall(hall._id))} disabled={activateLoading === hall._id} className={btn.secondary}>
                            {activateLoading === hall._id ? "…" : "Activate"}
                          </button>
                        ) : (
                          <button onClick={() => dispatch(deactivateEventHall(hall._id))} disabled={deactivateLoading === hall._id} className={btn.secondary}>
                            {deactivateLoading === hall._id ? "…" : "Deactivate"}
                          </button>
                        )}
                        <button onClick={() => openDeleteModal(hall)} className={btn.ghostDanger}>Delete</button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </TableCard>
      )}

      {modal && (
        <HallFormModal
          editHall={modal === "create" ? null : modal}
          onClose={() => setModal(null)}
          onSuccess={() => dispatch(fetchAllEventHalls(includeInactive))}
        />
      )}

      {confirmDelete && (
        <Modal title={`Delete Hall "${confirmDelete.hallName}"?`} onClose={() => setConfirmDelete(null)} size="max-w-sm"
          footer={
            <>
              <button onClick={() => setConfirmDelete(null)} className={btn.secondary}>Cancel</button>
              <button onClick={handleDelete} disabled={deleteLoading} className={btn.danger}>
                {deleteLoading ? "Deleting…" : "Yes, Delete"}
              </button>
            </>
          }>
          {deleteModalError ? (
            <div className="rounded-lg bg-red-50 border border-red-100 px-4 py-3 text-sm text-red-700">
              <p className="font-medium mb-1">Cannot delete this hall</p>
              <p>{deleteModalError}</p>
              <p className="mt-2 text-red-500 text-xs">Use <strong>Deactivate</strong> to take it out of service while preserving its history.</p>
            </div>
          ) : (
            <p className="text-sm text-gray-500">
              This permanently removes the event hall. Halls with booking history must be deactivated instead.
            </p>
          )}
        </Modal>
      )}
    </AdminLayout>
  );
}
