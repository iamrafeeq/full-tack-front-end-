import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import {
  fetchUnreadCount,
  fetchNotifications,
  markRead,
  markAllRead,
} from "../../redux/slice/notifications/notificationsSlice";

function timeAgo(iso) {
  const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (diff < 60)    return "just now";
  if (diff < 3600)  return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

const STAFF_NAV = {
  "new-booking":       "/admin/bookings",
  "check-in":          "/admin/bookings",
  "check-out":         "/admin/bookings",
  "booking-cancelled": "/admin/bookings",
  "maintenance-request": "/admin/maintenance",
};

export default function NotificationBell() {
  const dispatch   = useDispatch();
  const navigate   = useNavigate();
  const { role }   = useAuth();
  const { list, listLoading, unreadCount } = useSelector((s) => s.notifications);
  const [open, setOpen] = useState(false);
  const containerRef = useRef(null);

  // Poll unread count on mount and every 30 s
  useEffect(() => {
    dispatch(fetchUnreadCount());
    const id = setInterval(() => dispatch(fetchUnreadCount()), 30000);
    return () => clearInterval(id);
  }, [dispatch]);

  // Close dropdown when clicking outside
  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const toggle = () => {
    if (!open) dispatch(fetchNotifications());
    setOpen((o) => !o);
  };

  const handleItemClick = (n) => {
    if (!n.isRead) dispatch(markRead(n._id));
    const target = (role === "admin" || role === "manager") ? STAFF_NAV[n.type] : null;
    if (target) navigate(target);
    setOpen(false);
  };

  return (
    <div ref={containerRef} className="relative">
      {/* Bell button */}
      <button
        onClick={toggle}
        aria-label="Notifications"
        className="relative p-1.5 text-gray-500 hover:text-[#0B1F2A] transition-colors"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="w-5 h-5"
        >
          <path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.73 21a2 2 0 0 1-3.46 0" />
        </svg>

        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 flex items-center justify-center rounded-full bg-red-500 text-white text-[10px] font-bold px-1 leading-none">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-xl shadow-xl border border-gray-100 z-50">
          {/* Header */}
          <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
            <h4 className="text-sm font-semibold text-[#0B1F2A]">
              Notifications
              {unreadCount > 0 && (
                <span className="ml-2 px-1.5 py-0.5 rounded-full bg-red-100 text-red-600 text-[10px] font-bold">
                  {unreadCount}
                </span>
              )}
            </h4>
            {unreadCount > 0 && (
              <button
                onClick={() => dispatch(markAllRead())}
                className="text-xs text-[#C9A24B] hover:underline"
              >
                Mark all read
              </button>
            )}
          </div>

          {/* Body */}
          <div className="max-h-80 overflow-y-auto divide-y divide-gray-50">
            {listLoading ? (
              <div className="flex justify-center py-8">
                <div className="w-6 h-6 border-2 border-[#C9A24B] border-t-transparent rounded-full animate-spin" />
              </div>
            ) : list.length === 0 ? (
              <p className="text-center text-sm text-gray-400 py-8">No notifications yet</p>
            ) : (
              list.slice(0, 10).map((n) => (
                <button
                  key={n._id}
                  onClick={() => handleItemClick(n)}
                  className={`w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors ${
                    !n.isRead ? "bg-amber-50/70" : ""
                  }`}
                >
                  <p className={`text-sm leading-snug ${!n.isRead ? "font-medium text-[#0B1F2A]" : "text-gray-600"}`}>
                    {n.message}
                  </p>
                  <p className="text-[11px] text-gray-400 mt-0.5">{timeAgo(n.createdAt)}</p>
                </button>
              ))
            )}
          </div>

          {list.length > 10 && (
            <div className="px-4 py-2.5 border-t border-gray-100 text-center">
              <span className="text-xs text-gray-400">{list.length - 10} older notifications not shown</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
