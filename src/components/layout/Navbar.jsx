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
    { name: "Home",       to: "/" },
    { name: "About",      to: "/about" },
    { name: "Rooms",      to: "/rooms" },
    { name: "Facilities", to: "/facilities" },
    { name: "Gallery",    to: "/gallery" },
    { name: "Contact",    to: "/contact" },
  ];

  const isAdminRoute = ["/admin", "/manager", "/receptionist", "/housekeeping"].some(
    (prefix) => location.pathname.startsWith(prefix)
  );

  const roleLinks = ROLE_LINKS[role] || [];
  const panelHome = PANEL_HOME[role];
  const isStaff   = !!panelHome;

  const dropdownLinkClass =
    "block px-4 py-2 text-sm text-[#13293D] hover:bg-[#C9A24B]/10 hover:text-[#C9A24B] transition-colors";

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
              <span className={`text-sm font-medium ${scrolled ? "text-[#13293D]" : "text-white"}`}>
                {user?.name}
              </span>
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
              <button
                onClick={logout}
                className="px-4 py-2 rounded-full bg-red-600 text-white text-sm font-semibold transition-all duration-300 hover:bg-red-700"
              >
                Logout
              </button>
            </>
          )}
        </div>

        {/* ── Mobile hamburger ─────────────────────────────────── */}
        <button
          className={`md:hidden transition-colors duration-500 ${
            scrolled ? "text-[#0B1F2A]" : "text-white"
          }`}
          onClick={() => setMenuOpen((prev) => !prev)}
        >
          <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>

      {/* ── Mobile menu ──────────────────────────────────────────── */}
      {menuOpen && (
        <div className="md:hidden bg-white px-6 py-4 flex flex-col gap-4 shadow-lg">
          {isAdminRoute ? (
            <>
              <NavLink
                to="/"
                className="text-[#13293D] font-medium text-sm"
                onClick={() => setMenuOpen(false)}
              >
                Home
              </NavLink>
              {isAuthenticated && isStaff ? (
                <>
                  {roleLinks.map((link) => (
                    <NavLink
                      key={link.to}
                      to={link.to}
                      className="text-[#13293D] font-medium text-sm"
                      onClick={() => setMenuOpen(false)}
                    >
                      {link.label}
                    </NavLink>
                  ))}
                  <button
                    onClick={() => { setMenuOpen(false); logout(); }}
                    className="text-[#13293D] font-medium text-sm text-left"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <NavLink
                  to="/login"
                  className="text-[#13293D] font-medium text-sm"
                  onClick={() => setMenuOpen(false)}
                >
                  Login
                </NavLink>
              )}
            </>
          ) : (
            <>
              {navLinks.map((link) => (
                <NavLink
                  key={link.name}
                  to={link.to}
                  className="text-[#13293D] font-medium text-sm"
                  onClick={() => setMenuOpen(false)}
                >
                  {link.name}
                </NavLink>
              ))}

              {!isAuthenticated ? (
                <>
                  <NavLink
                    to="/login"
                    className="text-[#13293D] font-medium text-sm"
                    onClick={() => setMenuOpen(false)}
                  >
                    Login
                  </NavLink>
                  <NavLink
                    to="/register"
                    className="text-[#13293D] font-medium text-sm"
                    onClick={() => setMenuOpen(false)}
                  >
                    Register
                  </NavLink>
                </>
              ) : (
                <>
                  <span className="text-[#13293D] font-medium text-sm">{user?.name}</span>
                  <NavLink
                    to="/signeuser"
                    className="text-[#13293D] font-medium text-sm"
                    onClick={() => setMenuOpen(false)}
                  >
                    Profile
                  </NavLink>
                  {showMyBookings && (
                    <NavLink
                      to="/my-bookings"
                      className="text-[#13293D] font-medium text-sm"
                      onClick={() => setMenuOpen(false)}
                    >
                      My Bookings
                    </NavLink>
                  )}
                  {/* Role-specific panel links */}
                  {roleLinks.map((link) => (
                    <NavLink
                      key={link.to}
                      to={link.to}
                      className="text-[#13293D] font-medium text-sm"
                      onClick={() => setMenuOpen(false)}
                    >
                      {link.label}
                    </NavLink>
                  ))}
                  <button
                    onClick={() => { setMenuOpen(false); logout(); }}
                    className="text-[#13293D] font-medium text-sm text-left"
                  >
                    Logout
                  </button>
                </>
              )}
            </>
          )}
        </div>
      )}
    </nav>
  );
}

export default Navbar;
