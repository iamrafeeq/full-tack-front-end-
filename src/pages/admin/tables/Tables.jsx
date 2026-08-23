import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchAllTables, createTable, updateTable, updateTableStatus,
  deactivateTable, activateTable, deleteTable,
  clearFormErrors, clearDeleteError, clearActionErrors,
} from "../../../redux/slice/tables/tableSlice";
import AdminLayout from "../../../components/admin/AdminLayout";
import {
  StatCard, TableCard, Th, Badge, Spinner, ErrorBanner, EmptyState, Modal, btn,
} from "../../../components/admin/AdminUI";

const LOCATIONS      = ["indoor", "outdoor", "private-room"];
const STATUS_OPTIONS = ["available", "reserved", "occupied", "cleaning"];
const STATUS_COLORS  = {
  available: "bg-green-100 text-green-700",
  reserved:  "bg-blue-100 text-blue-700",
  occupied:  "bg-orange-100 text-orange-700",
  cleaning:  "bg-yellow-100 text-yellow-700",
};

const EMPTY_FORM = { tableNumber: "", capacity: "", location: "indoor" };

function TableFormModal({ editTable, onClose, onSuccess }) {
  const dispatch = useDispatch();
  const { createLoading, createError, updateLoading, updateError } = useSelector((s) => s.tables);

  const [form, setForm] = useState(
    editTable
      ? { tableNumber: editTable.tableNumber || "", capacity: editTable.capacity || "", location: editTable.location || "indoor" }
      : EMPTY_FORM
  );
  const [errs, setErrs] = useState({});

  useEffect(() => { dispatch(clearFormErrors()); }, [dispatch]);

  const isEditing = !!editTable;
  const loading   = isEditing ? updateLoading : createLoading;
  const apiError  = isEditing ? updateError   : createError;

  const validate = () => {
    const e = {};
    if (!form.tableNumber.trim()) e.tableNumber = "Table number is required.";
    if (!form.capacity || Number(form.capacity) < 1) e.capacity = "Capacity must be at least 1.";
    setErrs(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    const data = { tableNumber: form.tableNumber.trim(), capacity: Number(form.capacity), location: form.location };
    const action = isEditing
      ? updateTable({ id: editTable._id, data })
      : createTable(data);
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
            {isEditing ? `Edit Table — ${editTable.tableNumber}` : "Add New Table"}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">×</button>
        </div>
        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          {apiError && (
            <div className="px-4 py-2.5 bg-red-50 border border-red-200 rounded-md text-sm text-red-600">{apiError}</div>
          )}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs uppercase tracking-wide text-gray-500 mb-1">Table Number *</label>
              <input value={form.tableNumber} onChange={(e) => setForm((p) => ({ ...p, tableNumber: e.target.value }))}
                className={field("tableNumber")} placeholder="e.g. T1" />
              {errs.tableNumber && <p className="text-red-500 text-xs mt-1">{errs.tableNumber}</p>}
            </div>
            <div>
              <label className="block text-xs uppercase tracking-wide text-gray-500 mb-1">Capacity *</label>
              <input type="number" min="1" max="50" value={form.capacity}
                onChange={(e) => setForm((p) => ({ ...p, capacity: e.target.value }))}
                className={field("capacity")} placeholder="4" />
              {errs.capacity && <p className="text-red-500 text-xs mt-1">{errs.capacity}</p>}
            </div>
          </div>
          <div>
            <label className="block text-xs uppercase tracking-wide text-gray-500 mb-1">Location *</label>
            <select value={form.location} onChange={(e) => setForm((p) => ({ ...p, location: e.target.value }))}
              className={field("location")}>
              {LOCATIONS.map((l) => (
                <option key={l} value={l}>{l.charAt(0).toUpperCase() + l.slice(1).replace("-", " ")}</option>
              ))}
            </select>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className={btn.secondary}>Cancel</button>
            <button type="submit" disabled={loading} className={btn.primary}>
              {loading ? "Saving…" : isEditing ? "Save Changes" : "Add Table"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function AdminTables() {
  const dispatch = useDispatch();
  const {
    tables, total, loading, error,
    statusLoading, statusError,
    deleteLoading, deleteError,
    deactivateLoading, deactivateError,
    activateLoading, activateError,
  } = useSelector((s) => s.tables);

  const [search,          setSearch]          = useState("");
  const [locationFilter,  setLocationFilter]  = useState("all");
  const [statusFilter,    setStatusFilter]    = useState("all");
  const [includeInactive, setIncludeInactive] = useState(false);
  const [modal,           setModal]           = useState(null);
  const [confirmDelete,   setConfirmDelete]   = useState(null);
  const [deleteModalError, setDeleteModalError] = useState(null);

  useEffect(() => { dispatch(fetchAllTables(includeInactive)); }, [dispatch, includeInactive]);
  useEffect(() => () => dispatch(clearActionErrors()), [dispatch]);

  const filtered = useMemo(() =>
    tables.filter((t) => {
      if (!includeInactive && t.isActive === false) return false;
      const q = search.toLowerCase();
      return (
        (t.tableNumber?.toLowerCase().includes(q) || t.location?.toLowerCase().includes(q)) &&
        (locationFilter === "all" || t.location === locationFilter) &&
        (statusFilter   === "all" || t.status   === statusFilter)
      );
    }),
    [tables, search, locationFilter, statusFilter, includeInactive]
  );

  const counts = useMemo(() => {
    const active = tables.filter((t) => t.isActive !== false);
    return {
      total:     total || tables.length,
      available: active.filter((t) => t.status === "available").length,
      occupied:  active.filter((t) => t.status === "occupied" || t.status === "reserved").length,
      cleaning:  active.filter((t) => t.status === "cleaning").length,
    };
  }, [tables, total]);

  const openDeleteModal = (table) => {
    setDeleteModalError(null);
    dispatch(clearDeleteError());
    setConfirmDelete(table);
  };

  const handleDelete = () => {
    if (!confirmDelete) return;
    setDeleteModalError(null);
    dispatch(deleteTable(confirmDelete._id)).then((res) => {
      if (!res.error) setConfirmDelete(null);
      else setDeleteModalError(res.payload || "Failed to delete table.");
    });
  };

  return (
    <AdminLayout>
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 mb-6">
        <StatCard title="Total Tables"        value={counts.total}     icon="🪑" accent="#0B1F2A" loading={loading} />
        <StatCard title="Available"           value={counts.available} icon="✅" accent="#15803d" loading={loading} />
        <StatCard title="Occupied / Reserved" value={counts.occupied}  icon="🍽️" accent="#c2410c" loading={loading} />
        <StatCard title="Cleaning"            value={counts.cleaning}  icon="🧹" accent="#a16207" loading={loading} />
      </div>

      <div className="flex flex-wrap items-center gap-3 mb-6">
        <div className="relative flex-1 min-w-[180px] max-w-xs">
          <span className="absolute left-3 top-2.5 text-gray-400 text-sm">🔍</span>
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Table no. or location…"
            className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:border-[#C9A24B]" />
        </div>

        <select value={locationFilter} onChange={(e) => setLocationFilter(e.target.value)}
          className="text-sm border border-gray-300 rounded-lg px-3 py-2 bg-white focus:outline-none focus:border-[#C9A24B]">
          <option value="all">All Locations</option>
          {LOCATIONS.map((l) => <option key={l} value={l}>{l.charAt(0).toUpperCase() + l.slice(1).replace("-", " ")}</option>)}
        </select>

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
          {filtered.length} / {total || tables.length} tables
        </span>
        <button onClick={() => setModal("create")} className={btn.primary}>+ Add Table</button>
      </div>

      <ErrorBanner>{statusError}</ErrorBanner>
      <ErrorBanner>{deactivateError}</ErrorBanner>
      <ErrorBanner>{activateError}</ErrorBanner>

      {loading && <Spinner />}
      {!loading && error && (
        <ErrorBanner onRetry={() => dispatch(fetchAllTables(includeInactive))}>{error}</ErrorBanner>
      )}

      {!loading && !error && (
        <TableCard>
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100 text-left">
                {["Table No.", "Capacity", "Location", "Status", "Active", "Actions"].map((h) => (
                  <Th key={h}>{h}</Th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={6}>
                  <EmptyState icon="🪑" title="No tables found" subtitle="Nothing matches those filters."
                    action={<button onClick={() => { setSearch(""); setLocationFilter("all"); setStatusFilter("all"); }} className={btn.primary}>Clear filters</button>}
                  />
                </td></tr>
              ) : filtered.map((table) => {
                const isInactive = table.isActive === false;
                return (
                  <tr key={table._id} className={`border-b border-gray-50 transition-colors ${isInactive ? "opacity-50 bg-gray-50" : "hover:bg-gray-50/60"}`}>
                    <td className="px-4 py-3 font-semibold text-[#0B1F2A]">{table.tableNumber}</td>
                    <td className="px-4 py-3 text-gray-600">{table.capacity} seats</td>
                    <td className="px-4 py-3 capitalize text-gray-600">{table.location?.replace("-", " ")}</td>
                    <td className="px-4 py-3">
                      <select value={table.status}
                        onChange={(e) => dispatch(updateTableStatus({ id: table._id, status: e.target.value }))}
                        disabled={statusLoading || isInactive}
                        className={`text-xs px-2.5 py-1 rounded-full border-0 font-semibold cursor-pointer focus:outline-none disabled:cursor-not-allowed ${STATUS_COLORS[table.status]}`}>
                        {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s[0].toUpperCase() + s.slice(1)}</option>)}
                      </select>
                    </td>
                    <td className="px-4 py-3"><Badge value={isInactive ? "inactive" : "active"} /></td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <button onClick={() => setModal(table)} className={btn.ghostGold}>Edit</button>
                        {isInactive ? (
                          <button onClick={() => dispatch(activateTable(table._id))} disabled={activateLoading === table._id} className={btn.secondary}>
                            {activateLoading === table._id ? "…" : "Activate"}
                          </button>
                        ) : (
                          <button onClick={() => dispatch(deactivateTable(table._id))} disabled={deactivateLoading === table._id} className={btn.secondary}>
                            {deactivateLoading === table._id ? "…" : "Deactivate"}
                          </button>
                        )}
                        <button onClick={() => openDeleteModal(table)} className={btn.ghostDanger}>Delete</button>
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
        <TableFormModal
          editTable={modal === "create" ? null : modal}
          onClose={() => setModal(null)}
          onSuccess={() => dispatch(fetchAllTables(includeInactive))}
        />
      )}

      {confirmDelete && (
        <Modal title={`Delete Table ${confirmDelete.tableNumber}?`} onClose={() => setConfirmDelete(null)} size="max-w-sm"
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
              <p className="font-medium mb-1">Cannot delete this table</p>
              <p>{deleteModalError}</p>
              <p className="mt-2 text-red-500 text-xs">Use <strong>Deactivate</strong> to take it out of service while preserving its history.</p>
            </div>
          ) : (
            <p className="text-sm text-gray-500">
              This permanently removes the table. Tables with reservation history must be deactivated instead.
            </p>
          )}
        </Modal>
      )}
    </AdminLayout>
  );
}
