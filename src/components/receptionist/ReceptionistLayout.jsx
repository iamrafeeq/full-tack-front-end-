import { useEffect, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import NotificationBell from "../notifications/NotificationBell";
import {
  HiHome, HiWrench, HiEnvelope, HiClipboardDocumentList, HiPencilSquare,
} from "react-icons/hi2";
import { MdBed, MdRestaurant, MdFlightLand, MdFlightTakeoff, MdCelebration } from "react-icons/md";

const NAV_LINKS = [
  { label: "Dashboard",           to: "/receptionist/dashboard",           icon: HiHome },
  { label: "Today's Arrivals",    to: "/receptionist/arrivals",            icon: MdFlightLand },
  { label: "Today's Departures",  to: "/receptionist/departures",          icon: MdFlightTakeoff },
  { label: "New Booking",         to: "/receptionist/new-booking",         icon: HiPencilSquare },
  { label: "Room Status",         to: "/receptionist/room-status",         icon: MdBed },
  { label: "Table Reservations",  to: "/receptionist/table-reservations",  icon: MdRestaurant },
  { label: "Event Hall Bookings", to: "/receptionist/event-hall-bookings", icon: MdCelebration },
  { label: "Report Issue",        to: "/receptionist/report-issue",        icon: HiWrench },
  { label: "Maintenance",         to: "/receptionist/maintenance",         icon: HiClipboardDocumentList },
  { label: "Messages",            to: "/receptionist/messages",            icon: HiEnvelope },
];

export default function ReceptionistLayout({ children, title }) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  // Close drawer on navigation
  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  // Prevent background scroll when drawer is open
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  return (
    <div className="min-h-[100dvh] bg-[#F5F3EE] flex">

      {/* Mobile backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40 md:hidden"
          onClick={() => setMobileOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar
          Mobile (<md) : fixed overlay drawer, slides in/out
          Desktop (≥md): sticky in-flow, always w-64
      */}
      <aside
        className={[
          "fixed top-0 bottom-0 left-0 z-50 w-72",
          "md:sticky md:top-0 md:h-[100dvh] md:w-64 md:z-10 md:shrink-0",
          "bg-[#0B1F2A] text-white flex flex-col overflow-hidden",
          "transition-transform duration-300 ease-[cubic-bezier(.4,0,.2,1)] md:transition-none",
          mobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0",
        ].join(" ")}
      >
        {/* Brand */}
        <div className="px-6 py-5 border-b border-white/10 flex items-center justify-between gap-2 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-full border-2 border-[#C9A24B] flex items-center justify-center shrink-0">
              <span className="font-serif text-[#C9A24B] text-xs tracking-wider">LS</span>
            </div>
            <div className="min-w-0">
              <p className="text-sm font-serif leading-tight whitespace-nowrap">LuxuryStay</p>
              <p className="text-[10px] tracking-[0.2em] text-[#C9A24B] uppercase whitespace-nowrap">Reception</p>
            </div>
          </div>

          {/* Mobile close button */}
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
        <nav className="mt-3 flex-1 px-3 space-y-0.5 overflow-y-auto">
          {NAV_LINKS.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-md text-sm transition-colors ${
                  isActive
                    ? "bg-[#C9A24B]/15 text-[#C9A24B] font-medium"
                    : "text-white/70 hover:bg-white/5 hover:text-white"
                }`
              }
            >
              <link.icon className="w-5 h-5 shrink-0" />
              <span className="whitespace-nowrap">{link.label}</span>
            </NavLink>
          ))}
        </nav>

        {/* User + sign out */}
        <div className="px-3 py-4 border-t border-white/10 shrink-0">
          <div className="flex items-center gap-3 px-3 mb-2">
            <div className="w-8 h-8 rounded-full bg-[#C9A24B]/20 flex items-center justify-center text-[#C9A24B] text-sm font-medium shrink-0">
              {(user?.name || "R").charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="text-sm text-white truncate">{user?.name}</p>
              <p className="text-xs text-white/40 capitalize">{user?.role}</p>
            </div>
          </div>
          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-sm text-white/50 hover:bg-white/5 hover:text-white transition-colors"
          >
            <span className="text-base shrink-0">🚪</span>
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main area */}
      <div className="flex-1 flex flex-col min-h-[100dvh] min-w-0 overflow-hidden">
        <header className="bg-white border-b border-gray-100 px-4 py-3 flex items-center
                           justify-between sticky top-0 z-10 shadow-sm gap-3">
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
            <h2 className="text-base sm:text-lg font-serif text-[#0B1F2A] truncate">
              {title || "Dashboard"}
            </h2>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <NotificationBell />
            <div className="w-9 h-9 rounded-full bg-[#0B1F2A] text-[#C9A24B] flex items-center
                            justify-center text-sm font-medium shrink-0">
              {(user?.name || "R").charAt(0).toUpperCase()}
            </div>
          </div>
        </header>

        <main className="flex-1 p-3 sm:p-6 overflow-auto">{children}</main>
      </div>
    </div>
  );
}
