import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";

const BASE = "http://localhost:5000/api/payments";

const authHeader = () => ({
  headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
});

// POST /api/payments/create-payment-intent  →  { clientSecret }
export const createPaymentIntent = createAsyncThunk(
  "payments/createIntent",
  async ({ bookingId }, { rejectWithValue }) => {
    try {
      const res = await axios.post(`${BASE}/create-payment-intent`, { bookingId }, authHeader());
      return res.data; // { clientSecret }
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to initialize payment. Please try again."
      );
    }
  }
);

// POST /api/payments/confirm  →  { success }
export const confirmStripePayment = createAsyncThunk(
  "payments/confirm",
  async ({ bookingId, paymentIntentId, paymentMethod }, { rejectWithValue }) => {
    try {
      const res = await axios.post(
        `${BASE}/confirm`,
        { bookingId, paymentIntentId, paymentMethod },
        authHeader()
      );
      return res.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Payment processed but confirmation failed."
      );
    }
  }
);

// GET /api/payments  →  all payment records (admin/manager)
export const fetchAllPayments = createAsyncThunk(
  "payments/fetchAll",
  async ({ method, startDate, endDate } = {}, { rejectWithValue }) => {
    try {
      const params = new URLSearchParams();
      if (method)    params.set("method", method);
      if (startDate) params.set("startDate", startDate);
      if (endDate)   params.set("endDate", endDate);
      const url = params.toString() ? `${BASE}?${params}` : BASE;
      const res = await axios.get(url, authHeader());
      return Array.isArray(res.data) ? res.data : (res.data.payments || res.data.data || []);
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to load payments."
      );
    }
  }
);

// GET /api/payments/booking/:bookingId  →  single payment or null (404 = not yet paid)
export const fetchPaymentByBooking = createAsyncThunk(
  "payments/fetchByBooking",
  async (bookingId, { rejectWithValue }) => {
    try {
      const res = await axios.get(`${BASE}/booking/${bookingId}`, authHeader());
      return res.data;
    } catch (err) {
      if (err.response?.status === 404) return null; // unpaid — not an error
      return rejectWithValue(
        err.response?.data?.message || "Failed to load payment details."
      );
    }
  }
);

const paymentsSlice = createSlice({
  name: "payments",
  initialState: {
    // Stripe checkout flow
    intentLoading:  false,
    intentError:    null,
    clientSecret:   null,
    confirmLoading: false,
    confirmError:   null,
    // Admin/manager full payments list
    allPayments:    [],
    allLoading:     false,
    allError:       null,
    // Single booking payment lookup
    bookingPayment:        null,
    bookingPaymentLoading: false,
    bookingPaymentError:   null,
  },
  reducers: {
    clearPaymentState: (state) => {
      state.intentLoading  = false;
      state.intentError    = null;
      state.clientSecret   = null;
      state.confirmLoading = false;
      state.confirmError   = null;
    },
    clearBookingPayment: (state) => {
      state.bookingPayment        = null;
      state.bookingPaymentLoading = false;
      state.bookingPaymentError   = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // createPaymentIntent
      .addCase(createPaymentIntent.pending, (state) => {
        state.intentLoading = true;
        state.intentError   = null;
        state.clientSecret  = null;
      })
      .addCase(createPaymentIntent.fulfilled, (state, action) => {
        state.intentLoading = false;
        state.clientSecret  = action.payload.clientSecret;
      })
      .addCase(createPaymentIntent.rejected, (state, action) => {
        state.intentLoading = false;
        state.intentError   = action.payload;
      })
      // confirmStripePayment
      .addCase(confirmStripePayment.pending, (state) => {
        state.confirmLoading = true;
        state.confirmError   = null;
      })
      .addCase(confirmStripePayment.fulfilled, (state) => {
        state.confirmLoading = false;
      })
      .addCase(confirmStripePayment.rejected, (state, action) => {
        state.confirmLoading = false;
        state.confirmError   = action.payload;
      })
      // fetchAllPayments
      .addCase(fetchAllPayments.pending, (state) => {
        state.allLoading = true;
        state.allError   = null;
      })
      .addCase(fetchAllPayments.fulfilled, (state, action) => {
        state.allLoading  = false;
        state.allPayments = action.payload;
      })
      .addCase(fetchAllPayments.rejected, (state, action) => {
        state.allLoading = false;
        state.allError   = action.payload;
      })
      // fetchPaymentByBooking
      .addCase(fetchPaymentByBooking.pending, (state) => {
        state.bookingPaymentLoading = true;
        state.bookingPaymentError   = null;
        state.bookingPayment        = null;
      })
      .addCase(fetchPaymentByBooking.fulfilled, (state, action) => {
        state.bookingPaymentLoading = false;
        state.bookingPayment        = action.payload; // null = not yet paid
      })
      .addCase(fetchPaymentByBooking.rejected, (state, action) => {
        state.bookingPaymentLoading = false;
        state.bookingPaymentError   = action.payload;
      });
  },
});

export const { clearPaymentState, clearBookingPayment } = paymentsSlice.actions;
export default paymentsSlice.reducer;
