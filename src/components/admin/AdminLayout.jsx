import { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import NotificationBell from "../notifications/NotificationBell";

const SHARED_LINKS = [
  { label: "Dashboard",   to: "/admin/dashboard",   icon: "🏠" },
  { label: "Rooms",       to: "/admin/rooms",        icon: "🛏️" },
  { label: "Bookings",    to: "/admin/bookings",     icon: "📖" },
  { label: "Maintenance", to: "/admin/maintenance",  icon: "🔧" },
  { label: "Reports",     to: "/admin/reports",      icon: "📊" },
  { label: "Feedback",    to: "/admin/feedback",     icon: "⭐" },
];

const ADMIN_ONLY_LINKS = [
  { label: "Guests",   to: "/admin/users",    icon: "👥" },
  { label: "Invoices", to: "/admin/invoices", icon: "🧾" },
  { label: "Settings", to: "/admin/settings", icon: "⚙️" },
];

export default function AdminLayout({ children, title }) {
  const { user, logout, role } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  const sidebarLinks = role === "admin"
    ? [...SHARED_LINKS, ...ADMIN_ONLY_LINKS]
    : SHARED_LINKS;

  const panelLabel = role === "manager" ? "Manager Panel" : "Admin Panel";

  const pageTitle = title ||
    sidebarLinks.find((l) => location.pathname.startsWith(l.to))?.label ||
    "Dashboard";

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside
        className={`fixed md:static z-30 top-0 left-0 h-full w-64 bg-[#0B1F2A] text-white flex flex-col transform transition-transform duration-200 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0`}
      >
        <div className="px-6 py-5 border-b border-white/10">
          <h1 className="text-xl font-serif text-[#C9A24B]">LuxuryStay</h1>
          <p className="text-xs text-gray-400 mt-1">{panelLabel}</p>
        </div>

        <nav className="mt-4 flex-1">
          {sidebarLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                `w-full flex items-center gap-3 px-6 py-3 text-sm transition ${
                  isActive
                    ? "bg-[#C9A24B] text-[#0B1F2A] font-medium"
                    : "text-gray-300 hover:bg-white/5"
                }`
              }
            >
              <span>{link.icon}</span>
              <span>{link.label}</span>
            </NavLink>
          ))}
        </nav>
      </aside>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 bg-black/40 z-20 md:hidden"
        />
      )}

      {/* Main area */}
      <div className="flex-1 flex flex-col min-h-screen overflow-hidden">
        {/* Header */}
        <header className="bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="md:hidden text-[#0B1F2A] text-xl"
            >
              ☰
            </button>
            <h2 className="text-lg font-serif text-[#0B1F2A]">{pageTitle}</h2>
          </div>

          <div className="flex items-center gap-4">
            <NotificationBell />
            <span className="text-sm text-gray-600 hidden sm:inline">
              {user?.name || "Admin"}
            </span>
            <div className="w-9 h-9 rounded-full bg-[#0B1F2A] text-[#C9A24B] flex items-center justify-center text-sm font-medium">
              {(user?.name || "A").charAt(0).toUpperCase()}
            </div>
            <button
              onClick={logout}
              className="bg-[#0B1F2A] text-white text-sm px-4 py-2 rounded-md hover:opacity-90"
            >
              Logout
            </button>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-6 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
