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
  },
});
