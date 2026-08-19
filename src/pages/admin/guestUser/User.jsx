import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { guestUserAPI } from "../../../redux/slice/adminSlice/guestUser";
import AdminLayout from "../../../components/admin/AdminLayout";
import StatusToggle from "../../../components/admin/users/StatusToggle";
import RoleSelect from "../../../components/admin/users/RoleSelect";
import UserDetailModal from "../../../components/admin/users/UserDetailModal";

const ROLE_STYLES = {
  admin:        "bg-[#C9A24B]/15 text-[#9A7A2E]",
  manager:      "bg-blue-100 text-blue-700",
  receptionist: "bg-green-100 text-green-700",
  housekeeping: "bg-purple-100 text-purple-700",
  user:         "bg-gray-100 text-gray-600",
};

const ROLE_FILTERS   = ["all", "admin", "manager", "receptionist", "housekeeping", "user"];
const STATUS_FILTERS = ["all", "active", "inactive"];

export default function GuestUsers() {
  const dispatch = useDispatch();
  const { data, loading, error, statusError, roleError } = useSelector((state) => state.guestUser);

  const [search, setSearch]             = useState("");
  const [roleFilter, setRoleFilter]     = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedUser, setSelectedUser] = useState(null);

  useEffect(() => {
    dispatch(guestUserAPI());
  }, [dispatch]);

  const users = data?.users || [];

  const filtered = users.filter((u) => {
    const matchesSearch =
      u.name?.toLowerCase().includes(search.toLowerCase()) ||
      u.email?.toLowerCase().includes(search.toLowerCase());
    const matchesRole   = roleFilter   === "all" || u.role === roleFilter;
    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "active"   &&  u.isActive) ||
      (statusFilter === "inactive" && !u.isActive);
    return matchesSearch && matchesRole && matchesStatus;
  });

  return (
    <AdminLayout>
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        {/* Search */}
        <div className="relative flex-1 min-w-[180px] max-w-xs">
          <span className="absolute left-3 top-2.5 text-gray-400 text-sm">🔍</span>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search name or email..."
            className="w-full pl-8 pr-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:border-[#C9A24B]"
          />
        </div>

        {/* Role filter */}
        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="text-sm border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:border-[#C9A24B] bg-white"
        >
          {ROLE_FILTERS.map((r) => (
            <option key={r} value={r}>
              {r === "all" ? "All Roles" : r.charAt(0).toUpperCase() + r.slice(1)}
            </option>
          ))}
        </select>

        {/* Status filter */}
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="text-sm border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:border-[#C9A24B] bg-white"
        >
          {STATUS_FILTERS.map((s) => (
            <option key={s} value={s}>
              {s === "all" ? "All Status" : s.charAt(0).toUpperCase() + s.slice(1)}
            </option>
          ))}
        </select>

        <span className="text-sm text-gray-400 whitespace-nowrap ml-auto">
          {filtered.length} / {users.length} users
        </span>
      </div>

      {/* Action errors */}
      {(statusError || roleError) && (
        <div className="mb-4 px-4 py-2.5 bg-red-50 border border-red-200 rounded-md text-sm text-red-600">
          {statusError || roleError}
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 border-4 border-[#C9A24B] border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {/* Fetch error */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-md">
          {error}
        </div>
      )}

      {/* Table */}
      {!loading && !error && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 text-left">
                <th className="px-5 py-3 text-xs uppercase tracking-wide text-gray-400 font-medium">#</th>
                <th className="px-5 py-3 text-xs uppercase tracking-wide text-gray-400 font-medium">Name</th>
                <th className="px-5 py-3 text-xs uppercase tracking-wide text-gray-400 font-medium">Email</th>
                <th className="px-5 py-3 text-xs uppercase tracking-wide text-gray-400 font-medium">Phone</th>
                <th className="px-5 py-3 text-xs uppercase tracking-wide text-gray-400 font-medium">Role</th>
                <th className="px-5 py-3 text-xs uppercase tracking-wide text-gray-400 font-medium">Assign Role</th>
                <th className="px-5 py-3 text-xs uppercase tracking-wide text-gray-400 font-medium">Status</th>
                <th className="px-5 py-3 text-xs uppercase tracking-wide text-gray-400 font-medium">Joined</th>
                <th className="px-5 py-3 text-xs uppercase tracking-wide text-gray-400 font-medium">Details</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={9} className="text-center py-12 text-gray-400">
                    No users found.
                  </td>
                </tr>
              ) : (
                filtered.map((u, idx) => (
                  <tr key={u._id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-3 text-gray-400">{idx + 1}</td>

                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-[#0B1F2A] text-[#C9A24B] flex items-center justify-center text-xs font-medium shrink-0">
                          {u.name?.charAt(0).toUpperCase() || "?"}
                        </div>
                        <span className="font-medium text-[#0B1F2A]">{u.name || "—"}</span>
                      </div>
                    </td>

                    <td className="px-5 py-3 text-gray-500">{u.email || "—"}</td>
                    <td className="px-5 py-3 text-gray-500">{u.phone || "—"}</td>

                    <td className="px-5 py-3">
                      <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${ROLE_STYLES[u.role] || ROLE_STYLES.user}`}>
                        {u.role || "user"}
                      </span>
                    </td>

                    <td className="px-5 py-3">
                      <RoleSelect user={u} />
                    </td>

                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2">
                        <StatusToggle user={u} />
                        <span className={`text-xs ${u.isActive ? "text-green-600" : "text-gray-400"}`}>
                          {u.isActive ? "Active" : "Inactive"}
                        </span>
                      </div>
                    </td>

                    <td className="px-5 py-3 text-gray-400">
                      {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : "—"}
                    </td>

                    <td className="px-5 py-3">
                      <button
                        onClick={() => setSelectedUser(u)}
                        className="text-xs px-3 py-1.5 rounded-md border border-[#C9A24B] text-[#C9A24B] hover:bg-[#C9A24B] hover:text-[#0B1F2A] transition-colors font-medium"
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* User detail modal */}
      <UserDetailModal
        user={selectedUser}
        onClose={() => setSelectedUser(null)}
      />
    </AdminLayout>
  );
}
