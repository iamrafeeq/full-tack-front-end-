import { Routes, Route } from "react-router-dom";
import Home from "../pages/public/Home";
import Login from "../pages/auth/Login";
import Register from "../pages/auth/Register";
import ProtectedRoute, { ROLES, GuestRoute } from "./ProtectedRoute";
import Dashboard from "../pages/admin/Dashboard";
import GuestUsers from "../pages/admin/guestUser/User";
import AdminRooms from "../pages/admin/rooms/Rooms";
import AdminBookings from "../pages/admin/bookings/Bookings";
import Receptionist          from "../pages/receptionist/ReceptionDashboard";
import ReceptionArrivals     from "../pages/receptionist/Arrivals";
import ReceptionDepartures   from "../pages/receptionist/Departures";
import ReceptionNewBooking   from "../pages/receptionist/NewBooking";
import ReceptionRoomStatus   from "../pages/receptionist/RoomStatus";
import ReceptionReportIssue  from "../pages/receptionist/ReportIssuePage";
import ReceptionMaintenance  from "../pages/receptionist/ReceptionMaintenance";
import Housekeeping       from "../pages/housekeeping/HouseKeepingDashboard";
import RoomsCleaning      from "../pages/housekeeping/RoomsCleaning";
import MaintenanceTasks   from "../pages/housekeeping/MaintenanceTasks";
import ReportIssue        from "../pages/housekeeping/ReportIssue";
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
import AdminMessages      from "../pages/admin/messages/Messages"
import ReceptionMessages  from "../pages/receptionist/ReceptionMessages"
import AdminPayments      from "../pages/admin/payments/Payments"
import AdminTables              from "../pages/admin/tables/Tables"
import AdminTableReservations   from "../pages/admin/tableReservations/TableReservations"
import TableReservation         from "../pages/public/TableReservation"
import MyTableReservations      from "../pages/user/MyTableReservations"
import ReceptionistTableReservations from "../pages/receptionist/ReceptionistTableReservations"
import TablesCleaning                    from "../pages/housekeeping/TablesCleaning"
import AdminEventHalls                   from "../pages/admin/eventHalls/EventHalls"
import AdminEventHallBookings            from "../pages/admin/eventHallBookings/EventHallBookings"
import EventHallBooking                  from "../pages/public/EventHallBooking"
import MyEventHallBookings               from "../pages/user/MyEventHallBookings"
import ReceptionistEventHallBookings     from "../pages/receptionist/ReceptionistEventHallBookings"

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
      <Route path="/reserve-table" element={<TableReservation />} />
      <Route path="/my-table-reservations" element={<ProtectedRoute><MyTableReservations /></ProtectedRoute>} />
      <Route path="/book-event-hall" element={<ProtectedRoute><EventHallBooking /></ProtectedRoute>} />
      <Route path="/my-event-hall-bookings" element={<ProtectedRoute><MyEventHallBookings /></ProtectedRoute>} />

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

      <Route
        path="/admin/messages"
        element={
          <ProtectedRoute allowedRoles={STAFF}>
            <AdminMessages />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/payments"
        element={
          <ProtectedRoute allowedRoles={STAFF}>
            <AdminPayments />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/tables"
        element={
          <ProtectedRoute allowedRoles={STAFF}>
            <AdminTables />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/table-reservations"
        element={
          <ProtectedRoute allowedRoles={STAFF}>
            <AdminTableReservations />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/event-halls"
        element={
          <ProtectedRoute allowedRoles={STAFF}>
            <AdminEventHalls />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/event-hall-bookings"
        element={
          <ProtectedRoute allowedRoles={STAFF}>
            <AdminEventHallBookings />
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
      <Route
        path="/receptionist/arrivals"
        element={
          <ProtectedRoute allowedRoles={[ROLES.RECEPTIONIST]}>
            <ReceptionArrivals />
          </ProtectedRoute>
        }
      />
      <Route
        path="/receptionist/departures"
        element={
          <ProtectedRoute allowedRoles={[ROLES.RECEPTIONIST]}>
            <ReceptionDepartures />
          </ProtectedRoute>
        }
      />
      <Route
        path="/receptionist/new-booking"
        element={
          <ProtectedRoute allowedRoles={[ROLES.RECEPTIONIST]}>
            <ReceptionNewBooking />
          </ProtectedRoute>
        }
      />
      <Route
        path="/receptionist/room-status"
        element={
          <ProtectedRoute allowedRoles={[ROLES.RECEPTIONIST]}>
            <ReceptionRoomStatus />
          </ProtectedRoute>
        }
      />
      <Route
        path="/receptionist/report-issue"
        element={
          <ProtectedRoute allowedRoles={[ROLES.RECEPTIONIST]}>
            <ReceptionReportIssue />
          </ProtectedRoute>
        }
      />
      <Route
        path="/receptionist/maintenance"
        element={
          <ProtectedRoute allowedRoles={[ROLES.RECEPTIONIST]}>
            <ReceptionMaintenance />
          </ProtectedRoute>
        }
      />
      <Route
        path="/receptionist/messages"
        element={
          <ProtectedRoute allowedRoles={[ROLES.RECEPTIONIST]}>
            <ReceptionMessages />
          </ProtectedRoute>
        }
      />
      <Route
        path="/receptionist/table-reservations"
        element={
          <ProtectedRoute allowedRoles={[ROLES.RECEPTIONIST]}>
            <ReceptionistTableReservations />
          </ProtectedRoute>
        }
      />
      <Route
        path="/receptionist/event-hall-bookings"
        element={
          <ProtectedRoute allowedRoles={[ROLES.RECEPTIONIST]}>
            <ReceptionistEventHallBookings />
          </ProtectedRoute>
        }
      />

      {/* Housekeeping */}
      <Route
        path="/housekeeping/dashboard"
        element={
          <ProtectedRoute allowedRoles={[ROLES.HOUSEKEEPING]}>
            <Housekeeping />
          </ProtectedRoute>
        }
      />
      <Route
        path="/housekeeping/rooms-to-clean"
        element={
          <ProtectedRoute allowedRoles={[ROLES.HOUSEKEEPING]}>
            <RoomsCleaning />
          </ProtectedRoute>
        }
      />
      <Route
        path="/housekeeping/maintenance-tasks"
        element={
          <ProtectedRoute allowedRoles={[ROLES.HOUSEKEEPING]}>
            <MaintenanceTasks />
          </ProtectedRoute>
        }
      />
      <Route
        path="/housekeeping/report-issue"
        element={
          <ProtectedRoute allowedRoles={[ROLES.HOUSEKEEPING]}>
            <ReportIssue />
          </ProtectedRoute>
        }
      />
      <Route
        path="/housekeeping/tables-to-clean"
        element={
          <ProtectedRoute allowedRoles={[ROLES.HOUSEKEEPING]}>
            <TablesCleaning />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

export default AppRoutes;
