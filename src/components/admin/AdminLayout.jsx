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

const LogoutIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"
    strokeLinecap="round" strokeLinejoin="round" className="w-[17px] h-[17px]">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
    <path d="M16 17l5-5-5-5" />
    <path d="M21 12H9" />
  </svg>
);

export default function AdminLayout({ children, title }) {
  const { user, logout, role } = useAuth();
  const location = useLocation();

  const [collapsed, setCollapsed] = useState(() => {
    const stored = localStorage.getItem(RAIL_KEY);
    if (stored !== null) return stored === "1";
    return window.innerWidth < 1024;
  });

  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem(RAIL_KEY, collapsed ? "1" : "0");
  }, [collapsed]);

  // Close mobile drawer on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  // Prevent body scroll when mobile drawer is open
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  const sidebarLinks =
    role === "admin" ? [...SHARED_LINKS, ...ADMIN_ONLY_LINKS] : SHARED_LINKS;

  const panelLabel = role === "manager" ? "Manager Panel" : "Admin Panel";
  const roleLabel  = role === "manager" ? "Manager" : "Admin";

  const pageTitle =
    title ||
    sidebarLinks.find((l) => location.pathname.startsWith(l.to))?.label ||
    "Dashboard";

  return (
    <div className="min-h-[100dvh] bg-gray-50 flex">

      {/* ── Mobile backdrop ───────────────────────────────────────────────── */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40 md:hidden"
          onClick={() => setMobileOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* ── Sidebar ───────────────────────────────────────────────────────── */}
      {/*
        Mobile  (<md): fixed drawer, slides in from left, always w-72
        Desktop (≥md): sticky in-flow sidebar, collapses to 72 px or expands to 256 px
      */}
      <aside
        className={[
          // Mobile: fixed overlay drawer
          "fixed top-0 bottom-0 left-0 z-50 w-72",
          // Desktop: sticky in-flow, override mobile positioning
          "md:sticky md:top-0 md:h-[100dvh] md:z-10 md:shrink-0",
          // Desktop width driven by collapse state
          collapsed ? "md:w-[72px]" : "md:w-64",
          // Common
          "bg-[#0B1F2A] text-white flex flex-col overflow-hidden",
          // Slide animation: mobile uses translate, desktop uses width
          "transition-transform md:transition-[width] duration-300 ease-[cubic-bezier(.4,0,.2,1)]",
          mobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0",
        ].join(" ")}
      >
        {/* Brand + controls */}
        <div className="px-4 py-[18px] border-b border-white/10 flex items-center justify-between gap-2 shrink-0">
          {/* Brand text — always visible on mobile, hidden when desktop-collapsed */}
          <div className={[
            "min-w-0 overflow-hidden transition-opacity duration-200",
            collapsed ? "md:w-0 md:opacity-0 md:pointer-events-none" : "opacity-100",
          ].join(" ")}>
            <h1 className="text-xl font-serif text-[#C9A24B] whitespace-nowrap">LuxuryStay</h1>
            <p className="text-xs text-gray-400 mt-1 whitespace-nowrap">{panelLabel}</p>
          </div>

          {/* Desktop collapse toggle (hidden on mobile) */}
          <button
            onClick={() => setCollapsed((c) => !c)}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            className="hidden md:flex shrink-0 w-8 h-8 rounded-lg border border-white/15 bg-white/5
                       text-[#C9A24B] items-center justify-center hover:bg-[#C9A24B]/20 transition-colors"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"
              strokeLinecap="round" strokeLinejoin="round"
              className={`w-4 h-4 transition-transform duration-300 ${collapsed ? "rotate-180" : ""}`}>
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </button>

          {/* Mobile close ✕ (hidden on desktop) */}
          <button
            onClick={() => setMobileOpen(false)}
            aria-label="Close sidebar"
            className="md:hidden shrink-0 w-8 h-8 rounded-lg border border-white/15 bg-white/5
                       text-[#C9A24B] flex items-center justify-center hover:bg-[#C9A24B]/20 transition-colors"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"
              strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Nav */}
        <nav className="mt-3 flex-1 overflow-y-auto overflow-x-hidden">
          {sidebarLinks.map((link) => (
            <div key={link.to} className="relative group">
              <NavLink
                to={link.to}
                className={({ isActive }) =>
                  [
                    "w-full flex items-center gap-3 px-5 py-[11px] text-sm transition-colors border-l-[3px]",
                    collapsed ? "md:justify-center" : "",
                    isActive
                      ? "bg-[#C9A24B]/15 text-[#C9A24B] font-medium border-[#C9A24B]"
                      : "text-gray-300 border-transparent hover:bg-white/5",
                  ].join(" ")
                }
              >
                <link.icon className="w-5 h-5 shrink-0" />
                <span className={[
                  "whitespace-nowrap overflow-hidden transition-opacity duration-200",
                  collapsed ? "md:w-0 md:opacity-0" : "opacity-100",
                ].join(" ")}>
                  {link.label}
                </span>
              </NavLink>

              {/* Tooltip — desktop collapsed state only */}
              {collapsed && (
                <span className="pointer-events-none absolute left-[calc(100%+10px)] top-1/2 -translate-y-1/2
                                 z-50 whitespace-nowrap rounded-md bg-[#13293D] px-2.5 py-1.5 text-xs text-white
                                 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity hidden md:block">
                  {link.label}
                </span>
              )}
            </div>
          ))}
        </nav>

        {/* Footer identity — pinned to bottom */}
        <div className={[
          "relative group px-5 py-3.5 border-t border-white/10 flex items-center gap-3 shrink-0",
          collapsed ? "md:justify-center" : "",
        ].join(" ")}>
          <div className="w-9 h-9 shrink-0 rounded-full bg-[#C9A24B]/15 text-[#C9A24B]
                          flex items-center justify-center text-sm font-medium">
            {(user?.name || "A").charAt(0).toUpperCase()}
          </div>

          {/* Name + role — always visible on mobile, hidden desktop-collapsed */}
          <div className={[
            "min-w-0 flex-1 overflow-hidden transition-opacity duration-200",
            collapsed ? "md:w-0 md:opacity-0 md:pointer-events-none" : "opacity-100",
          ].join(" ")}>
            <p className="text-[13px] text-white whitespace-nowrap truncate">{user?.name || "Admin"}</p>
            <p className="text-[11px] text-gray-400 whitespace-nowrap capitalize">{roleLabel}</p>
          </div>

          {/* Logout — visible on mobile always; on desktop only when not collapsed */}
          <button
            onClick={logout}
            aria-label="Log out"
            className={["shrink-0 text-gray-400 hover:text-[#C9A24B] p-1",
              collapsed ? "md:hidden" : "",
            ].join(" ")}
          >
            <LogoutIcon />
          </button>

          {/* Tooltip for collapsed desktop */}
          {collapsed && (
            <span className="pointer-events-none absolute left-[calc(100%+10px)] top-1/2 -translate-y-1/2
                             z-50 whitespace-nowrap rounded-md bg-[#13293D] px-2.5 py-1.5 text-xs text-white
                             shadow-lg opacity-0 group-hover:opacity-100 transition-opacity hidden md:block">
              {(user?.name || "Admin")} · {roleLabel}
            </span>
          )}
        </div>
      </aside>

      {/* ── Main area ─────────────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-h-[100dvh] min-w-0">

        {/* Header */}
        <header className="bg-white border-b border-gray-100 px-4 py-3 flex items-center
                           justify-between sticky top-0 z-10 gap-3">
          <div className="flex items-center gap-3 min-w-0">
            {/* Hamburger — mobile only */}
            <button
              onClick={() => setMobileOpen(true)}
              aria-label="Open navigation"
              className="md:hidden shrink-0 w-9 h-9 rounded-lg border border-gray-200 flex items-center
                         justify-center text-[#0B1F2A] hover:bg-gray-50 transition-colors"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"
                strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
                <path d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <h2 className="text-base sm:text-lg font-serif text-[#0B1F2A] truncate">{pageTitle}</h2>
          </div>

          <div className="flex items-center gap-2 sm:gap-4 shrink-0">
            <NotificationBell />
            <span className="text-sm text-gray-600 hidden sm:inline truncate max-w-[120px]">
              {user?.name || "Admin"}
            </span>
            <div className="w-9 h-9 rounded-full bg-[#0B1F2A] text-[#C9A24B] flex items-center
                            justify-center text-sm font-medium shrink-0">
              {(user?.name || "A").charAt(0).toUpperCase()}
            </div>
            <button
              onClick={logout}
              className="hidden sm:block bg-[#0B1F2A] text-white text-sm px-4 py-2 rounded-md hover:opacity-90"
            >
              Logout
            </button>
          </div>
        </header>

        <main className="flex-1 p-3 sm:p-6 overflow-auto">{children}</main>
      </div>
    </div>
  );
}
