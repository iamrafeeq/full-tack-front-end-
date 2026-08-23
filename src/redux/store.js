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
import deleteBookingReducer      from './slice/Booking/completeBooking/deleteBookingSlice';
import tablesReducer             from './slice/tables/tableSlice';
import tableReservationsReducer  from './slice/tableReservations/tableReservationSlice';
import eventHallsReducer         from './slice/eventHalls/eventHallSlice';
import eventHallBookingsReducer  from './slice/eventHallBookings/eventHallBookingSlice';

export const store = configureStore({
  reducer: {
    auth:               AuthReducer,
    login:              loginReducer,
    guestUser:          guestUserReducer,
    rooms:              roomReducer,
    bookings:           bookingReducer,
    invoices:           invoiceReducer,
    housekeeping:       housekeepingReducer,
    maintenance:        maintenanceReducer,
    receptionist:       receptionistReducer,
    reports:            reportsReducer,
    feedback:           feedbackReducer,
    settings:           settingsReducer,
    notifications:      notificationsReducer,
    contact:            contactReducer,
    payments:           paymentsReducer,
    deleteBooking:      deleteBookingReducer,
    tables:             tablesReducer,
    tableReservations:  tableReservationsReducer,
    eventHalls:         eventHallsReducer,
    eventHallBookings:  eventHallBookingsReducer,
  },
});
