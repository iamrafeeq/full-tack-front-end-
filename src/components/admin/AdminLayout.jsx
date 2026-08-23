import { useEffect, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import NotificationBell from "../notifications/NotificationBell";
import {
  HiHome, HiWrench, HiStar, HiEnvelope, HiCreditCard,
  HiUsers, HiDocumentText, HiCog6Tooth, HiClipboardDocumentList,
  HiChartBarSquare, HiCalendarDays,
} from "react-icons/hi2";
import { MdBed, MdChair, MdRestaurant, MdCelebration } from "react-icons/md";

const SHARED_LINKS = [
  { label: "Dashboard",            to: "/admin/dashboard",            icon: HiHome },
  { label: "Rooms",                to: "/admin/rooms",                icon: MdBed },
  { label: "Bookings",             to: "/admin/bookings",             icon: HiClipboardDocumentList },
  { label: "Tables",               to: "/admin/tables",               icon: MdChair },
  { label: "Table Reservations",   to: "/admin/table-reservations",   icon: MdRestaurant },
  { label: "Event Halls",          to: "/admin/event-halls",          icon: MdCelebration },
  { label: "Event Hall Bookings",  to: "/admin/event-hall-bookings",  icon: HiCalendarDays },
  { label: "Maintenance",          to: "/admin/maintenance",          icon: HiWrench },
  { label: "Reports",              to: "/admin/reports",              icon: HiChartBarSquare },
  { label: "Feedback",             to: "/admin/feedback",             icon: HiStar },
  { label: "Messages",             to: "/admin/messages",             icon: HiEnvelope },
  { label: "Payments",             to: "/admin/payments",             icon: HiCreditCard },
];

const ADMIN_ONLY_LINKS = [
  { label: "Guests",   to: "/admin/users",    icon: HiUsers },
  { label: "Invoices", to: "/admin/invoices", icon: HiDocumentText },
  { label: "Settings", to: "/admin/settings", icon: HiCog6Tooth },
];

const RAIL_KEY = "ls-admin-rail";

export default function AdminLayout({ children, title }) {
  const { user, logout, role } = useAuth();
  const location = useLocation();

  const [collapsed, setCollapsed] = useState(() => {
    const stored = localStorage.getItem(RAIL_KEY);
    if (stored !== null) return stored === "1";
    return window.innerWidth < 1024;
  });

  useEffect(() => {
    localStorage.setItem(RAIL_KEY, collapsed ? "1" : "0");
  }, [collapsed]);

  const sidebarLinks =
    role === "admin" ? [...SHARED_LINKS, ...ADMIN_ONLY_LINKS] : SHARED_LINKS;

  const panelLabel = role === "manager" ? "Manager Panel" : "Admin Panel";
  const roleLabel  = role === "manager" ? "Manager" : "Admin";

  const pageTitle =
    title ||
    sidebarLinks.find((l) => location.pathname.startsWith(l.to))?.label ||
    "Dashboard";

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar — always visible, sticky top-to-bottom */}
      <aside
        className={`sticky top-0 h-screen shrink-0 bg-[#0B1F2A] text-white flex flex-col
          transition-[width] duration-300 ease-[cubic-bezier(.4,0,.2,1)] overflow-hidden
          ${collapsed ? "w-[72px]" : "w-64"}`}
      >
        {/* Brand + toggle */}
        <div className="px-4 py-[18px] border-b border-white/10 flex items-center justify-between gap-2 shrink-0">
          <div
            className={`min-w-0 overflow-hidden transition-opacity duration-200 ${
              collapsed ? "w-0 opacity-0 pointer-events-none" : "opacity-100"
            }`}
          >
            <h1 className="text-xl font-serif text-[#C9A24B] whitespace-nowrap">LuxuryStay</h1>
            <p className="text-xs text-gray-400 mt-1 whitespace-nowrap">{panelLabel}</p>
          </div>
          <button
            onClick={() => setCollapsed((c) => !c)}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            className="shrink-0 w-8 h-8 rounded-lg border border-white/15 bg-white/5 text-[#C9A24B]
                       flex items-center justify-center hover:bg-[#C9A24B]/20 transition-colors"
          >
            <svg
              viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"
              strokeLinecap="round" strokeLinejoin="round"
              className={`w-4 h-4 transition-transform duration-300 ${collapsed ? "rotate-180" : ""}`}
            >
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </button>
        </div>

        {/* Nav — fills all remaining height, scrollable if links overflow */}
        <nav className="mt-3 flex-1 overflow-y-auto overflow-x-hidden">
          {sidebarLinks.map((link) => (
            <div key={link.to} className="relative group">
              <NavLink
                to={link.to}
                className={({ isActive }) =>
                  `w-full flex items-center gap-3 px-5 py-[11px] text-sm transition-colors border-l-[3px] ${
                    collapsed ? "justify-center" : ""
                  } ${
                    isActive
                      ? "bg-[#C9A24B]/15 text-[#C9A24B] font-medium border-[#C9A24B]"
                      : "text-gray-300 border-transparent hover:bg-white/5"
                  }`
                }
              >
                <link.icon className="w-5 h-5 shrink-0" />
                <span
                  className={`whitespace-nowrap overflow-hidden transition-opacity duration-200 ${
                    collapsed ? "w-0 opacity-0" : "opacity-100"
                  }`}
                >
                  {link.label}
                </span>
              </NavLink>

              {/* Tooltip (collapsed only) */}
              {collapsed && (
                <span
                  className="pointer-events-none absolute left-[calc(100%+10px)] top-1/2 -translate-y-1/2 z-50
                             whitespace-nowrap rounded-md bg-[#13293D] px-2.5 py-1.5 text-xs text-white
                             shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  {link.label}
                </span>
              )}
            </div>
          ))}
        </nav>

        {/* Footer identity — pinned to bottom */}
        <div
          className={`relative group px-5 py-3.5 border-t border-white/10 flex items-center gap-3 shrink-0 ${
            collapsed ? "justify-center" : ""
          }`}
        >
          <div className="w-9 h-9 shrink-0 rounded-full bg-[#C9A24B]/15 text-[#C9A24B] flex items-center justify-center text-sm font-medium">
            {(user?.name || "A").charAt(0).toUpperCase()}
          </div>
          <div
            className={`min-w-0 flex-1 overflow-hidden transition-opacity duration-200 ${
              collapsed ? "w-0 opacity-0 pointer-events-none" : "opacity-100"
            }`}
          >
            <p className="text-[13px] text-white whitespace-nowrap truncate">{user?.name || "Admin"}</p>
            <p className="text-[11px] text-gray-400 whitespace-nowrap capitalize">{roleLabel}</p>
          </div>
          {!collapsed && (
            <button onClick={logout} aria-label="Log out" className="shrink-0 text-gray-400 hover:text-[#C9A24B] p-1">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-[17px] h-[17px]">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <path d="M16 17l5-5-5-5" />
                <path d="M21 12H9" />
              </svg>
            </button>
          )}
          {collapsed && (
            <span
              className="pointer-events-none absolute left-[calc(100%+10px)] top-1/2 -translate-y-1/2 z-50
                         whitespace-nowrap rounded-md bg-[#13293D] px-2.5 py-1.5 text-xs text-white
                         shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
            >
              {(user?.name || "Admin")} · {roleLabel}
            </span>
          )}
        </div>
      </aside>

      {/* Main area */}
      <div className="flex-1 flex flex-col min-h-screen min-w-0">
        <header className="bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between sticky top-0 z-10">
          <div className="flex items-center gap-4">
            <h2 className="text-lg font-serif text-[#0B1F2A]">{pageTitle}</h2>
          </div>

          <div className="flex items-center gap-4">
            <NotificationBell />
            <span className="text-sm text-gray-600 hidden sm:inline">{user?.name || "Admin"}</span>
            <div className="w-9 h-9 rounded-full bg-[#0B1F2A] text-[#C9A24B] flex items-center justify-center text-sm font-medium">
              {(user?.name || "A").charAt(0).toUpperCase()}
            </div>
            <button onClick={logout} className="bg-[#0B1F2A] text-white text-sm px-4 py-2 rounded-md hover:opacity-90">
              Logout
            </button>
          </div>
        </header>

        <main className="flex-1 p-6 overflow-auto">{children}</main>
      </div>
    </div>
  );
}
