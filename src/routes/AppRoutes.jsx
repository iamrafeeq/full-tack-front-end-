import { Routes, Route } from "react-router-dom";
import Home from "../pages/public/Home";
import Login from "../pages/auth/Login";
import Register from "../pages/auth/Register";
import ProtectedRoute, { ROLES, GuestRoute } from "./ProtectedRoute";
import Dashboard from "../pages/admin/Dashboard";
import GuestUsers from "../pages/admin/guestUser/User";
import AdminRooms from "../pages/admin/rooms/Rooms";
import AdminBookings from "../pages/admin/bookings/Bookings";
import Receptionist from "../pages/receptionist/ReceptionDashboard";
import Housekeeping from "../pages/housekeeping/HouseKeepingDashboard";
import Rooms from "../pages/public/Rooms";
import RoomDetails from "../pages/public/RoomDetails";
import About from "../pages/public/About";
import Gallery from "../pages/public/Gallery";
import Contact from "../pages/public/Contact";
import Booking from "../pages/public/Booking";
import SignelUser from "../components/userProfile/SignelUser"
import MyBookings from "../pages/user/MyBookings"
import AdminInvoices    from "../pages/admin/invoices/Invoices"
import AdminMaintenance  from "../pages/admin/maintenance/Maintenance"
import AdminReports       from "../pages/admin/reports/Reports"
import AdminFeedback      from "../pages/admin/feedback/Feedback"
import AdminSettings      from "../pages/admin/settings/Settings"

const STAFF = [ROLES.ADMIN, ROLES.MANAGER];

function AppRoutes() {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<GuestRoute><Login /></GuestRoute>} />
      <Route path="/register" element={<GuestRoute><Register /></GuestRoute>} />
      <Route path="/about" element={<About />} />
      <Route path="/gallery" element={<Gallery />} />
      <Route path="/contact" element={<Contact />} />
      <Route path="/booking" element={<ProtectedRoute><Booking /></ProtectedRoute>} />
      <Route path="/rooms" element={<Rooms />} />
      <Route path="/rooms/:id" element={<RoomDetails />} />
      <Route path="/signeuser" element={<SignelUser/>}/>
      <Route path="/my-bookings" element={<ProtectedRoute><MyBookings /></ProtectedRoute>} />

      {/* Shared admin + manager routes */}
      <Route
        path="/admin/dashboard"
        element={
          <ProtectedRoute allowedRoles={STAFF}>
            <Dashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/rooms"
        element={
          <ProtectedRoute allowedRoles={STAFF}>
            <AdminRooms />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/bookings"
        element={
          <ProtectedRoute allowedRoles={STAFF}>
            <AdminBookings />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/maintenance"
        element={
          <ProtectedRoute allowedRoles={STAFF}>
            <AdminMaintenance />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/reports"
        element={
          <ProtectedRoute allowedRoles={STAFF}>
            <AdminReports />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/feedback"
        element={
          <ProtectedRoute allowedRoles={STAFF}>
            <AdminFeedback />
          </ProtectedRoute>
        }
      />

      {/* Admin-only routes */}
      <Route
        path="/admin/settings"
        element={
          <ProtectedRoute allowedRoles={[ROLES.ADMIN]}>
            <AdminSettings />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/users"
        element={
          <ProtectedRoute allowedRoles={[ROLES.ADMIN]}>
            <GuestUsers />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/invoices"
        element={
          <ProtectedRoute allowedRoles={[ROLES.ADMIN]}>
            <AdminInvoices />
          </ProtectedRoute>
        }
      />

      {/* Receptionist */}
      <Route
        path="/receptionist/dashboard"
        element={
          <ProtectedRoute allowedRoles={[ROLES.RECEPTIONIST]}>
            <Receptionist />
          </ProtectedRoute>
        }
      />

      {/* Housekeeping */}
      <Route
        path="/housekeeping/dashboard"
        element={
          <ProtectedRoute allowedRoles={[ROLES.HOUSEKEEPING]}>
            <Housekeeping/>
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

export default AppRoutes;
