import { configureStore } from '@reduxjs/toolkit';
import AuthReducer          from './slice/auth/registerAuthSlice';
import loginReducer         from './slice/auth/loginAuthSlice';
import guestUserReducer     from './slice/adminSlice/guestUser';
import roomReducer          from './slice/roomSlice/roomSlice';
import bookingReducer       from './slice/Booking/bookingSlice';
import invoiceReducer       from './slice/invoice/invoiceSlice';
import housekeepingReducer  from './slice/housekeeping/housekeepingSlice';
import maintenanceReducer   from './slice/maintenance/maintenanceSlice';
import receptionistReducer  from './slice/receptionist/receptionistSlice';
import reportsReducer       from './slice/reports/reportsSlice';
import feedbackReducer      from './slice/feedback/feedbackSlice';
import settingsReducer      from './slice/settings/settingsSlice';
import notificationsReducer from './slice/notifications/notificationsSlice';
import contactReducer       from './slice/contactUs/contactusSlice';
import paymentsReducer      from './slice/payments/paymentsSlice';
import deleteBookingReducer from './slice/Booking/completeBooking/deleteBookingSlice';

export const store = configureStore({
  reducer: {
    auth:         AuthReducer,          // register + edit profile
    login:        loginReducer,         // login + single user fetch
    guestUser:    guestUserReducer,     // admin: all users, role & status management
    rooms:        roomReducer,          // all room CRUD + status
    bookings:     bookingReducer,       // booking create, list, check-in, check-out, cancel
    invoices:     invoiceReducer,       // invoice generate, list, view, mark paid
    housekeeping: housekeepingReducer,  // cleaning room list + mark clean
    maintenance:  maintenanceReducer,   // maintenance request CRUD
    receptionist: receptionistReducer,  // today's arrivals/departures + guest search
    reports:      reportsReducer,       // analytics dashboard stats
    feedback:      feedbackReducer,       // guest feedback per booking + admin list/stats
    settings:      settingsReducer,       // hotel settings (tax, policy, times)
    notifications: notificationsReducer,  // per-user notification bell + list
    contact:       contactReducer,        // public contact form + admin message list
    payments:      paymentsReducer,       // Stripe payment intent + confirm
    deleteBooking: deleteBookingReducer,  // hard-delete a completed booking
  },
});
