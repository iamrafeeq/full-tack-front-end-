import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import api from "../../../api/axios";

const BASE = "/api/bookings";

// Attach the JWT token to every request that needs auth
const authHeader = () => ({
  headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
});

// ─────────────────────────────────────────────────────────────────────────────
// THUNKS  — each thunk maps to one backend endpoint
// ─────────────────────────────────────────────────────────────────────────────

// 1. CREATE booking  →  POST /api/bookings/createbooking
//    Any logged-in user can book. Send: { room (id), checkInDate, checkOutDate }
//    Backend calculates nights + totalAmount automatically from the room price
export const createBooking = createAsyncThunk(
  "bookings/createBooking",
  async (bookingData, { rejectWithValue }) => {
    try {
      const res = await api.post(`${BASE}/createbooking`, bookingData, authHeader());
      localStorage.setItem("hasBookings", "true"); // persist so link shows after re-login
      return res.data; // { success, message, booking }
    } catch (err) {
      if (err.response?.status === 401) {
        window.dispatchEvent(new Event("auth:deactivated"));
      }
      return rejectWithValue(err.response?.data?.message || "Failed to create booking.");
    }
  }
);

// 2. GET all bookings  →  GET /api/bookings/getbookings
//    Admin / manager / receptionist → see ALL bookings
//    Regular user → sees only their OWN bookings (backend filters automatically)
export const fetchBookings = createAsyncThunk(
  "bookings/fetchBookings",
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get(`${BASE}/getbookings`, authHeader());
      return res.data; // { success, total, bookings }
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to fetch bookings.");
    }
  }
);

// 3. GET single booking  →  GET /api/bookings/getbooking/:id
//    User can only view their own; staff can view any
export const fetchBookingById = createAsyncThunk(
  "bookings/fetchBookingById",
  async (id, { rejectWithValue }) => {
    try {
      const res = await api.get(`${BASE}/getbooking/${id}`, authHeader());
      return res.data; // { success, booking }
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to fetch booking.");
    }
  }
);

// 4. CHECK-IN  →  PUT /api/bookings/checkin/:id
//    Changes booking status: "booked" → "checked-in"
//    Also marks the Room as "occupied" on the backend
export const checkInBooking = createAsyncThunk(
  "bookings/checkInBooking",
  async (id, { rejectWithValue }) => {
    try {
      const res = await api.put(`${BASE}/checkin/${id}`, {}, authHeader());
      return res.data; // { success, message, booking }
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to check in.");
    }
  }
);

// 5. CHECK-OUT  →  PUT /api/bookings/checkout/:id
//    Body accepts optional extraCharges: [{ description, amount }]
//    Response includes both booking AND auto-generated invoice
export const checkOutBooking = createAsyncThunk(
  "bookings/checkOutBooking",
  async ({ id, extraCharges = [] }, { rejectWithValue }) => {
    try {
      const res = await api.put(`${BASE}/checkout/${id}`, { extraCharges }, authHeader());
      return res.data; // { success, message, booking, invoice }
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to check out.");
    }
  }
);

// 6. CANCEL booking  →  DELETE /api/bookings/cancelbooking/:id
export const cancelBooking = createAsyncThunk(
  "bookings/cancelBooking",
  async (id, { rejectWithValue }) => {
    try {
      const res = await api.delete(`${BASE}/cancelbooking/${id}`, authHeader());
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to cancel booking.");
    }
  }
);

// 7. PAY booking  →  POST /api/bookings/:bookingId/pay
//    Guest pays own booking; staff collects on behalf
export const payBooking = createAsyncThunk(
  "bookings/payBooking",
  async ({ bookingId, paymentMethod }, { rejectWithValue }) => {
    try {
      const res = await api.post(`${BASE}/${bookingId}/pay`, { paymentMethod }, authHeader());
      return res.data; // { success, message, booking, payment }
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to process payment.");
    }
  }
);



const initialState = {
  // All bookings list
  bookings: [],
  total: 0,
  loading: false,
  error: null,

  // Single booking (for detail view / receipt)
  singleBooking: null,
  singleLoading: false,
  singleError: null,

  // Create new booking
  createLoading: false,
  createError: null,

  // Check-in action
  checkInLoading: false,
  checkInError: null,

  // Check-out action
  checkOutLoading: false,
  checkOutError: null,

  // Cancel booking
  cancelLoading: false,
  cancelError: null,

  // Pay booking
  payLoading: false,
  payError: null,
};

// ─────────────────────────────────────────────────────────────────────────────
// HELPER  — replace one booking in the array with the updated version from API
// ─────────────────────────────────────────────────────────────────────────────

const replaceBooking = (bookings, updatedBooking) =>
  bookings.map((b) => (b._id === updatedBooking._id ? updatedBooking : b));

// ─────────────────────────────────────────────────────────────────────────────
// SLICE
// ─────────────────────────────────────────────────────────────────────────────

const bookingSlice = createSlice({
  name: "bookings",
  initialState,
  reducers: {
    // Clear single booking when closing a detail/receipt modal
    clearSingleBooking: (state) => {
      state.singleBooking = null;
      state.singleError = null;
    },
    // Reset create error when opening a fresh booking form
    clearBookingError: (state) => {
      state.createError = null;
    },
  },
  extraReducers: (builder) => {
    builder

      // ── 1. Create booking ────────────────────────────────────────────────
      .addCase(createBooking.pending, (state) => {
        state.createLoading = true;
        state.createError = null;
      })
      .addCase(createBooking.fulfilled, (state, action) => {
        state.createLoading = false;
        // Add new booking to the top of the list so it appears first
        state.bookings.unshift(action.payload.booking);
        state.total += 1;
      })
      .addCase(createBooking.rejected, (state, action) => {
        state.createLoading = false;
        state.createError = action.payload;
      })

      // ── 2. Fetch all bookings ────────────────────────────────────────────
      .addCase(fetchBookings.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBookings.fulfilled, (state, action) => {
        state.loading = false;
        state.bookings = action.payload.bookings;
        state.total = action.payload.total;
      })
      .addCase(fetchBookings.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // ── 3. Fetch single booking ──────────────────────────────────────────
      .addCase(fetchBookingById.pending, (state) => {
        state.singleLoading = true;
        state.singleError = null;
      })
      .addCase(fetchBookingById.fulfilled, (state, action) => {
        state.singleLoading = false;
        state.singleBooking = action.payload.booking;
      })
      .addCase(fetchBookingById.rejected, (state, action) => {
        state.singleLoading = false;
        state.singleError = action.payload;
      })

      // ── 4. Check-in ──────────────────────────────────────────────────────
      .addCase(checkInBooking.pending, (state) => {
        state.checkInLoading = true;
        state.checkInError = null;
      })
      .addCase(checkInBooking.fulfilled, (state, action) => {
        state.checkInLoading = false;
        // Update the booking's status in the list in-place (no full refetch needed)
        state.bookings = replaceBooking(state.bookings, action.payload.booking);
      })
      .addCase(checkInBooking.rejected, (state, action) => {
        state.checkInLoading = false;
        state.checkInError = action.payload;
      })

      // ── 5. Check-out ─────────────────────────────────────────────────────
      .addCase(checkOutBooking.pending, (state) => {
        state.checkOutLoading = true;
        state.checkOutError = null;
      })
      .addCase(checkOutBooking.fulfilled, (state, action) => {
        state.checkOutLoading = false;
        state.bookings = replaceBooking(state.bookings, action.payload.booking);
      })
      .addCase(checkOutBooking.rejected, (state, action) => {
        state.checkOutLoading = false;
        state.checkOutError = action.payload;
      })

      // ── 6. Cancel booking ────────────────────────────────────────────────
      .addCase(cancelBooking.pending, (state) => {
        state.cancelLoading = true;
        state.cancelError = null;
      })
      .addCase(cancelBooking.fulfilled, (state, action) => {
        state.cancelLoading = false;
        // Keep the booking in the list but update its status to "cancelled"
        state.bookings = replaceBooking(state.bookings, action.payload.booking);
      })
      .addCase(cancelBooking.rejected, (state, action) => {
        state.cancelLoading = false;
        state.cancelError = action.payload;
      })

      // ── 7. Pay booking ───────────────────────────────────────────────────
      .addCase(payBooking.pending, (state) => {
        state.payLoading = true;
        state.payError = null;
      })
      .addCase(payBooking.fulfilled, (state, action) => {
        state.payLoading = false;
        state.bookings = replaceBooking(state.bookings, action.payload.booking);
        if (state.singleBooking?._id === action.payload.booking._id) {
          state.singleBooking = action.payload.booking;
        }
      })
      .addCase(payBooking.rejected, (state, action) => {
        state.payLoading = false;
        state.payError = action.payload;
      });
  },
});

export const { clearSingleBooking, clearBookingError } = bookingSlice.actions;
export default bookingSlice.reducer;
