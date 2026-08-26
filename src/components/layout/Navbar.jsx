import { Link, NavLink, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchBookings } from "../../redux/slice/Booking/bookingSlice";

// Links shown in profile dropdown / mobile menu per staff role
const ROLE_LINKS = {
  admin:        [{ label: "Admin Panel",    to: "/admin/dashboard" }],
  manager:      [{ label: "Dashboard",      to: "/admin/dashboard" },
                 { label: "Maintenance",    to: "/admin/maintenance" }],
  receptionist: [{ label: "Dashboard",      to: "/receptionist/dashboard" }],
  housekeeping: [{ label: "Dashboard",      to: "/housekeeping/dashboard" }],
};

// Primary panel home used in the right-side navbar and mobile admin bar
const PANEL_HOME = {
  admin:        "/admin/dashboard",
  manager:      "/admin/dashboard",
  receptionist: "/receptionist/dashboard",
  housekeeping: "/housekeeping/dashboard",
};

function Navbar() {
  const location = useLocation();
  const { isAuthenticated, role, user, logout } = useAuth();
  const [scrolled,     setScrolled]     = useState(false);
  const [menuOpen,     setMenuOpen]     = useState(false);
  const [profileOpen,  setProfileOpen]  = useState(false);

  const dispatch = useDispatch();
  const bookingTotal = useSelector((s) => s.bookings.total);
  const showMyBookings =
    isAuthenticated &&
    (bookingTotal > 0 || localStorage.getItem("hasBookings") === "true");

  // Fetch the guest's own bookings once per session so "My Bookings" link
  // appears correctly after re-login — even for receptionist-created bookings
  // where the localStorage flag was never set in the guest's browser.
  useEffect(() => {
    if (isAuthenticated && role === "user") {
      dispatch(fetchBookings());
    }
  }, [isAuthenticated, role, dispatch]);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { name: "Home",            to: "/" },
    { name: "About",           to: "/about" },
    { name: "Rooms",           to: "/rooms" },
    // { name: "Facilities",      to: "/facilities" },
    { name: "Gallery",         to: "/gallery" },
    { name: "Contact",         to: "/contact" },
    { name: "Reserve a Table", to: "/reserve-table" },
    { name: "Book Event Hall", to: "/book-event-hall" },
  ];

  const isAdminRoute = ["/admin", "/manager", "/receptionist", "/housekeeping"].some(
    (prefix) => location.pathname.startsWith(prefix)
  );

  const roleLinks = ROLE_LINKS[role] || [];
  const panelHome = PANEL_HOME[role];
  const isStaff   = !!panelHome;

  const dropdownLinkClass =
    "block px-4 py-2 text-sm text-[#13293D] hover:bg-[#C9A24B]/10 hover:text-[#C9A24B] transition-colors";

  /* styling-only class helpers for the mobile sheet */
  const mItem =
    "nav-item group flex items-center gap-3 rounded-xl px-3.5 py-3 text-[15px] font-medium tracking-wide transition-all duration-300 active:scale-[0.98]";
  const mIdle   = "text-white/75 hover:bg-white/[0.07] hover:text-white";
  const mActive = "bg-[#C9A24B]/10 text-[#C9A24B]";
  const mLabel  =
    "nav-item px-3.5 pt-3 pb-1 text-[10px] font-semibold uppercase tracking-[0.22em] text-white/35";
  const mBar =
    "h-4 w-[2px] shrink-0 rounded-full bg-[#C9A24B] opacity-30 transition-opacity duration-300 group-hover:opacity-100";
  const mIcon = "h-[18px] w-[18px] shrink-0 text-[#C9A24B]/75";

  return (
    <nav
      className={`fixed top-0 left-0 w-full z-50 transition-all duration-500 backdrop-blur-xl ${
        scrolled ? "bg-white shadow-lg py-3" : "bg-[#0B1F2A]/20 py-6"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">

        {/* Brand */}
        <Link
          to="/"
          className={`font-serif text-2xl tracking-wide transition-colors duration-500 ${
            scrolled ? "text-[#0B1F2A]" : "text-white"
          }`}
        >
          Luxury<span className="text-[#C9A24B]">Stay</span>
        </Link>

        {/* ── Desktop: public nav + profile dropdown ─────────── */}
        {!isAdminRoute && (
          <div className="hidden md:flex items-center gap-10">
            {navLinks.map((link) => (
              <NavLink
                key={link.name}
                to={link.to}
                className={({ isActive }) =>
                  `relative text-sm tracking-wide font-medium transition-colors duration-500 group ${
                    scrolled ? "text-[#13293D]" : "text-white"
                  } ${isActive ? "text-[#C9A24B]" : ""}`
                }
              >
                {link.name}
                <span className="absolute -bottom-1 left-0 w-0 h-[1.5px] bg-[#C9A24B] transition-all duration-300 group-hover:w-full" />
              </NavLink>
            ))}

            {isAuthenticated && (
              <div className="relative">
                {/* Profile icon button */}
                <button
                  onClick={() => setProfileOpen((prev) => !prev)}
                  className={`w-9 h-9 rounded-full flex items-center justify-center border-2 transition-colors duration-300 ${
                    profileOpen
                      ? "bg-[#C9A24B] text-[#0B1F2A] border-[#C9A24B]"
                      : `border-[#C9A24B] ${scrolled ? "text-[#0B1F2A]" : "text-white"}`
                  }`}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-5 h-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={1.8}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z"
                    />
                  </svg>
                </button>

                {/* Dropdown */}
                {profileOpen && (
                  <div className="absolute right-0 mt-2 w-52 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-50">
                    {/* Name + role badge */}
                    <div className="px-4 py-2 border-b border-gray-100">
                      <p className="text-xs font-medium text-[#0B1F2A] truncate">{user?.name}</p>
                      {role && role !== "user" && (
                        <p className="text-[10px] text-[#C9A24B] capitalize mt-0.5">{role}</p>
                      )}
                    </div>

                    {/* Common links */}
                    <NavLink
                      to="/signeuser"
                      onClick={() => setProfileOpen(false)}
                      className={dropdownLinkClass}
                    >
                      Profile
                    </NavLink>
                    {showMyBookings && (
                      <NavLink
                        to="/my-bookings"
                        onClick={() => setProfileOpen(false)}
                        className={dropdownLinkClass}
                      >
                        My Bookings
                      </NavLink>
                    )}
                    {role === "user" && (
                      <NavLink
                        to="/my-table-reservations"
                        onClick={() => setProfileOpen(false)}
                        className={dropdownLinkClass}
                      >
                        My Table Reservations
                      </NavLink>
                    )}
                    {role === "user" && (
                      <NavLink
                        to="/my-event-hall-bookings"
                        onClick={() => setProfileOpen(false)}
                        className={dropdownLinkClass}
                      >
                        My Event Hall Bookings
                      </NavLink>
                    )}

                    {/* Role-specific panel links */}
                    {roleLinks.length > 0 && (
                      <>
                        <div className="border-t border-gray-100 my-1" />
                        <p className="px-4 pt-1 pb-0.5 text-[10px] uppercase tracking-widest text-gray-400">
                          {role === "admin" ? "Admin" : "My Panel"}
                        </p>
                        {roleLinks.map((link) => (
                          <NavLink
                            key={link.to}
                            to={link.to}
                            onClick={() => setProfileOpen(false)}
                            className={dropdownLinkClass}
                          >
                            {link.label}
                          </NavLink>
                        ))}
                      </>
                    )}

                    {/* Logout */}
                    <div className="border-t border-gray-100 my-1" />
                    <button
                      onClick={() => { setProfileOpen(false); logout(); }}
                      className="w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-red-50 transition-colors"
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* ── Desktop: right-side context bar ─────────────────── */}
        <div className="hidden md:flex items-center gap-4">
          {isAdminRoute ? (
            <>
              <NavLink
                to="/"
                className={`text-sm font-medium transition-colors duration-300 ${
                  scrolled ? "text-[#13293D] hover:text-[#C9A24B]" : "text-white hover:text-[#C9A24B]"
                }`}
              >
                Home
              </NavLink>
              {isAuthenticated && isStaff ? (
                <>
                  <NavLink
                    to={panelHome}
                    className={`text-sm font-medium transition-colors duration-300 ${
                      scrolled ? "text-[#13293D] hover:text-[#C9A24B]" : "text-white hover:text-[#C9A24B]"
                    }`}
                  >
                    Dashboard
                  </NavLink>
                  <button
                    onClick={logout}
                    className="px-4 py-2 rounded-full bg-red-600 text-white text-sm font-semibold transition-all duration-300 hover:bg-red-700"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <NavLink
                  to="/login"
                  className={`text-sm font-medium transition-colors duration-300 ${
                    scrolled ? "text-[#13293D] hover:text-[#C9A24B]" : "text-white hover:text-[#C9A24B]"
                  }`}
                >
                  Login
                </NavLink>
              )}
            </>
          ) : !isAuthenticated ? (
            <>
              <NavLink
                to="/login"
                className={`text-sm font-medium transition-colors duration-300 ${
                  scrolled ? "text-[#13293D] hover:text-[#C9A24B]" : "text-white hover:text-[#C9A24B]"
                }`}
              >
                Login
              </NavLink>
              <NavLink
                to="/register"
                className="px-6 py-2.5 rounded-full text-sm font-semibold tracking-wide border border-[#C9A24B] text-[#C9A24B] bg-white/5 transition-all duration-500 hover:bg-[#C9A24B] hover:text-[#0B1F2A]"
              >
                Register
              </NavLink>
            </>
          ) : (
            <>
              {isStaff && (
                <NavLink
                  to={panelHome}
                  className={`text-sm font-medium transition-colors duration-300 ${
                    scrolled ? "text-[#13293D] hover:text-[#C9A24B]" : "text-white hover:text-[#C9A24B]"
                  }`}
                >
                  Dashboard
                </NavLink>
              )}
            </>
          )}
        </div>

        {/* ── Mobile hamburger ─────────────────────────────────── */}
        <button
          className={`md:hidden relative flex h-11 w-11 items-center justify-center rounded-full border transition-all duration-500 ${
            menuOpen
              ? "border-[#C9A24B] bg-[#C9A24B]/15 text-[#C9A24B]"
              : scrolled
                ? "border-[#0B1F2A]/15 bg-[#0B1F2A]/[0.04] text-[#0B1F2A]"
                : "border-white/25 bg-white/10 text-white"
          }`}
          onClick={() => setMenuOpen((prev) => !prev)}
        >
          <span className="sr-only">Menu</span>
          <span
            className={`absolute h-[1.5px] w-5 rounded-full bg-current transition-all duration-300 ${
              menuOpen ? "rotate-45" : "-translate-y-[6px]"
            }`}
          />
          <span
            className={`absolute h-[1.5px] w-5 rounded-full bg-current transition-all duration-300 ${
              menuOpen ? "scale-x-0 opacity-0" : "opacity-100"
            }`}
          />
          <span
            className={`absolute h-[1.5px] w-5 rounded-full bg-current transition-all duration-300 ${
              menuOpen ? "-rotate-45" : "translate-y-[6px]"
            }`}
          />
        </button>
      </div>

      {/* ── Mobile menu ──────────────────────────────────────────── */}
      {menuOpen && (
        <div className="md:hidden nav-panel px-3 pb-3 pt-3">
          <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#0B1F2A]/95 shadow-[0_30px_60px_-25px_rgba(0,0,0,0.85)] backdrop-blur-2xl">
            <div className="h-px w-full bg-gradient-to-r from-transparent via-[#C9A24B]/70 to-transparent" />

            <div className="nav-scroll flex max-h-[calc(100vh-8.5rem)] flex-col gap-0.5 overflow-y-auto p-2">
              {isAdminRoute ? (
                <>
                  <p className={mLabel} style={{ animationDelay: "20ms" }}>Navigation</p>

                  <NavLink
                    to="/"
                    className={({ isActive }) => `${mItem} ${isActive ? mActive : mIdle}`}
                    style={{ animationDelay: "60ms" }}
                    onClick={() => setMenuOpen(false)}
                  >
                    <span className={mBar} />
                    Home
                  </NavLink>

                  {isAuthenticated && isStaff ? (
                    <>
                      <p className={mLabel} style={{ animationDelay: "90ms" }}>
                        {role === "admin" ? "Admin" : "My Panel"}
                      </p>
                      {roleLinks.map((link, i) => (
                        <NavLink
                          key={link.to}
                          to={link.to}
                          className={({ isActive }) => `${mItem} ${isActive ? mActive : mIdle}`}
                          style={{ animationDelay: `${120 + i * 40}ms` }}
                          onClick={() => setMenuOpen(false)}
                        >
                          <span className={mBar} />
                          {link.label}
                        </NavLink>
                      ))}

                      <div className="my-2 h-px bg-white/10" />

                      <button
                        onClick={() => { setMenuOpen(false); logout(); }}
                        className={`${mItem} w-full justify-start text-left text-red-400 hover:bg-red-500/10 hover:text-red-300`}
                        style={{ animationDelay: "220ms" }}
                      >
                        <svg className="h-[18px] w-[18px] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.7}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15M12 9l-3 3m0 0 3 3m-3-3h12.75" />
                        </svg>
                        Logout
                      </button>
                    </>
                  ) : (
                    <NavLink
                      to="/login"
                      className={`${mItem} mt-1 justify-center border border-[#C9A24B]/60 bg-[#C9A24B]/10 text-[#C9A24B] hover:bg-[#C9A24B] hover:text-[#0B1F2A]`}
                      style={{ animationDelay: "100ms" }}
                      onClick={() => setMenuOpen(false)}
                    >
                      Login
                    </NavLink>
                  )}
                </>
              ) : (
                <>
                  <p className={mLabel} style={{ animationDelay: "20ms" }}>Menu</p>

                  {navLinks.map((link, i) => (
                    <NavLink
                      key={link.name}
                      to={link.to}
                      className={({ isActive }) => `${mItem} ${isActive ? mActive : mIdle}`}
                      style={{ animationDelay: `${50 + i * 35}ms` }}
                      onClick={() => setMenuOpen(false)}
                    >
                      <span className={mBar} />
                      {link.name}
                    </NavLink>
                  ))}

                  {!isAuthenticated ? (
                    <>
                      <div className="my-2 h-px bg-white/10" />
                      <div className="nav-item flex flex-col gap-2 px-1 pb-1" style={{ animationDelay: "320ms" }}>
                        <NavLink
                          to="/login"
                          className="rounded-xl border border-white/20 px-4 py-3 text-center text-sm font-semibold tracking-wide text-white transition-all duration-300 hover:border-[#C9A24B] hover:text-[#C9A24B] active:scale-[0.98]"
                          onClick={() => setMenuOpen(false)}
                        >
                          Login
                        </NavLink>
                        <NavLink
                          to="/register"
                          className="rounded-xl bg-[#C9A24B] px-4 py-3 text-center text-sm font-semibold tracking-wide text-[#0B1F2A] shadow-[0_10px_25px_-12px_rgba(201,162,75,0.9)] transition-all duration-300 hover:bg-[#d8b straight]"
                          onClick={() => setMenuOpen(false)}
                        >
                          Register
                        </NavLink>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="my-2 h-px bg-white/10" />

                      <div
                        className="nav-item mx-1 mb-1 flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.04] px-3 py-3"
                        style={{ animationDelay: "320ms" }}
                      >
                        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#C9A24B] text-sm font-semibold text-[#0B1F2A]">
                          {user?.name?.charAt(0)?.toUpperCase()}
                        </span>
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium text-white">{user?.name}</p>
                          {role && role !== "user" && (
                            <p className="mt-0.5 text-[10px] uppercase tracking-[0.18em] text-[#C9A24B]">{role}</p>
                          )}
                        </div>
                      </div>

                      <p className={mLabel} style={{ animationDelay: "350ms" }}>Account</p>

                      <NavLink
                        to="/signeuser"
                        className={({ isActive }) => `${mItem} ${isActive ? mActive : mIdle}`}
                        style={{ animationDelay: "380ms" }}
                        onClick={() => setMenuOpen(false)}
                      >
                        <svg className={mIcon} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.7}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
                        </svg>
                        Profile
                      </NavLink>

                      {showMyBookings && (
                        <NavLink
                          to="/my-bookings"
                          className={({ isActive }) => `${mItem} ${isActive ? mActive : mIdle}`}
                          style={{ animationDelay: "410ms" }}
                          onClick={() => setMenuOpen(false)}
                        >
                          <svg className={mIcon} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.7}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" />
                          </svg>
                          My Bookings
                        </NavLink>
                      )}

                      {role === "user" && (
                        <NavLink
                          to="/my-table-reservations"
                          className={({ isActive }) => `${mItem} ${isActive ? mActive : mIdle}`}
                          style={{ animationDelay: "440ms" }}
                          onClick={() => setMenuOpen(false)}
                        >
                          <svg className={mIcon} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.7}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v7.5a2.25 2.25 0 0 0 4.5 0V3M9 10.5V21M17.25 3c-1.243 0-2.25 2.239-2.25 5s1.007 5 2.25 5V21" />
                          </svg>
                          My Table Reservations
                        </NavLink>
                      )}

                      {role === "user" && (
                        <NavLink
                          to="/my-event-hall-bookings"
                          className={({ isActive }) => `${mItem} ${isActive ? mActive : mIdle}`}
                          style={{ animationDelay: "470ms" }}
                          onClick={() => setMenuOpen(false)}
                        >
                          <svg className={mIcon} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.7}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 21h19.5M4.5 21V6.75a.75.75 0 0 1 .4-.664l6.75-3.6a.75.75 0 0 1 .7 0l6.75 3.6a.75.75 0 0 1 .4.664V21M9.75 21v-4.5h4.5V21M9 10.5h.008v.008H9V10.5Zm3 0h.008v.008H12V10.5Zm3 0h.008v.008H15V10.5Z" />
                          </svg>
                          My Event Hall Bookings
                        </NavLink>
                      )}

                      {isStaff && (
                        <NavLink
                          to={panelHome}
                          className={({ isActive }) => `${mItem} ${isActive ? mActive : mIdle}`}
                          style={{ animationDelay: "500ms" }}
                          onClick={() => setMenuOpen(false)}
                        >
                          <svg className={mIcon} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.7}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 0 1 6 3.75h2.25A2.25 2.25 0 0 1 10.5 6v2.25a2.25 2.25 0 0 1-2.25 2.25H6a2.25 2.25 0 0 1-2.25-2.25V6Zm10.5 0A2.25 2.25 0 0 1 16.5 3.75h1.75A2.25 2.25 0 0 1 20.5 6v2.25a2.25 2.25 0 0 1-2.25 2.25H16.5a2.25 2.25 0 0 1-2.25-2.25V6Zm-10.5 9.75A2.25 2.25 0 0 1 6 13.5h2.25a2.25 2.25 0 0 1 2.25 2.25V18a2.25 2.25 0 0 1-2.25 2.25H6A2.25 2.25 0 0 1 3.75 18v-2.25Zm10.5 0A2.25 2.25 0 0 1 16.5 13.5h1.75a2.25 2.25 0 0 1 2.25 2.25V18a2.25 2.25 0 0 1-2.25 2.25H16.5A2.25 2.25 0 0 1 14.25 18v-2.25Z" />
                          </svg>
                          {role === "admin" ? "Admin Panel" : role === "manager" ? "Manager Panel" : "My Panel"}
                        </NavLink>
                      )}

                      <div className="my-2 h-px bg-white/10" />

                      <button
                        onClick={() => { setMenuOpen(false); logout(); }}
                        className={`${mItem} w-full justify-start text-left text-red-400 hover:bg-red-500/10 hover:text-red-300`}
                        style={{ animationDelay: "530ms" }}
                      >
                        <svg className="h-[18px] w-[18px] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.7}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15M12 9l-3 3m0 0 3 3m-3-3h12.75" />
                        </svg>
                        Logout
                      </button>
                    </>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes navPanelIn {
          from { opacity: 0; transform: translateY(-10px) scale(0.985); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes navItemIn {
          from { opacity: 0; transform: translateY(-6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .nav-panel { animation: navPanelIn .32s cubic-bezier(.16,1,.3,1) both; }
        .nav-item  { animation: navItemIn .38s cubic-bezier(.16,1,.3,1) both; }
        .nav-scroll::-webkit-scrollbar { width: 0px; }
        .nav-scroll { scrollbar-width: none; }
        @media (prefers-reduced-motion: reduce) {
          .nav-panel, .nav-item { animation: none; }
        }
      `}</style>
    </nav>
  );
}

export default Navbar;