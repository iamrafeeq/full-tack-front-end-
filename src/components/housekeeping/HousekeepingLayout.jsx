import { NavLink } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import NotificationBell from "../notifications/NotificationBell";
import { HiHome, HiWrench, HiClipboardDocumentList } from "react-icons/hi2";
import { MdCleaningServices, MdChair } from "react-icons/md";

const NAV_LINKS = [
  { label: "Dashboard",         to: "/housekeeping/dashboard",         icon: HiHome },
  { label: "Rooms to Clean",    to: "/housekeeping/rooms-to-clean",    icon: MdCleaningServices },
  { label: "Tables to Clean",   to: "/housekeeping/tables-to-clean",   icon: MdChair },
  { label: "Maintenance Tasks", to: "/housekeeping/maintenance-tasks", icon: HiWrench },
  { label: "Report Issue",      to: "/housekeeping/report-issue",      icon: HiClipboardDocumentList },
];

export default function HousekeepingLayout({ children, title }) {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-[#F5F3EE] flex">
      {/* Always-visible sidebar */}
      <aside className="w-64 shrink-0 bg-[#0B1F2A] text-white flex flex-col sticky top-0 h-screen">
        {/* Brand */}
        <div className="px-6 py-5 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full border-2 border-[#C9A24B] flex items-center justify-center shrink-0">
              <span className="font-serif text-[#C9A24B] text-xs tracking-wider">LS</span>
            </div>
            <div>
              <p className="text-sm font-serif leading-tight">LuxuryStay</p>
              <p className="text-[10px] tracking-[0.2em] text-[#C9A24B] uppercase">Housekeeping</p>
            </div>
          </div>
        </div>

        {/* Nav links */}
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
              <span>{link.label}</span>
            </NavLink>
          ))}
        </nav>

        {/* User + sign out */}
        <div className="px-3 py-4 border-t border-white/10">
          <div className="flex items-center gap-3 px-3 mb-2">
            <div className="w-8 h-8 rounded-full bg-[#C9A24B]/20 flex items-center justify-center text-[#C9A24B] text-sm font-medium shrink-0">
              {(user?.name || "H").charAt(0).toUpperCase()}
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
      <div className="flex-1 flex flex-col min-h-screen overflow-hidden">
        <header className="bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between sticky top-0 z-10 shadow-sm">
          <h2 className="text-lg font-serif text-[#0B1F2A]">{title || "Dashboard"}</h2>
          <div className="flex items-center gap-3">
            <NotificationBell />
            <div className="w-9 h-9 rounded-full bg-[#0B1F2A] text-[#C9A24B] flex items-center justify-center text-sm font-medium">
              {(user?.name || "H").charAt(0).toUpperCase()}
            </div>
          </div>
        </header>
        <main className="flex-1 p-6 overflow-auto">{children}</main>
      </div>
    </div>
  );
}
