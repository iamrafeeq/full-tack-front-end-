import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import api from "../../../api/axios";

const BASE = "/api/event-hall-bookings";
const authHeader = () => ({
  headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
});

const replaceBooking = (arr, updated) =>
  arr.map((b) => (b._id === updated._id ? updated : b));

export const fetchEventHallBookings = createAsyncThunk(
  "eventHallBookings/fetchAll",
  async (params = {}, { rejectWithValue }) => {
    try {
      const qp = new URLSearchParams();
      if (params.status) qp.set("status", params.status);
      if (params.date)   qp.set("date",   params.date);
      const url = qp.toString() ? `${BASE}?${qp}` : BASE;
      const res = await api.get(url, authHeader());
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to fetch bookings.");
    }
  }
);

export const fetchEventHallBookingById = createAsyncThunk(
  "eventHallBookings/fetchById",
  async (id, { rejectWithValue }) => {
    try {
      const res = await api.get(`${BASE}/${id}`, authHeader());
      return res.data.booking || res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to fetch booking.");
    }
  }
);

export const createEventHallBooking = createAsyncThunk(
  "eventHallBookings/create",
  async (data, { rejectWithValue }) => {
    try {
      const res = await api.post(BASE, data, authHeader());
      return res.data.booking || res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to create booking.");
    }
  }
);

export const confirmEventHallBooking = createAsyncThunk(
  "eventHallBookings/confirm",
  async (id, { rejectWithValue }) => {
    try {
      const res = await api.put(`${BASE}/${id}/confirm`, {}, authHeader());
      return res.data.booking || res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to confirm booking.");
    }
  }
);

export const startEventHallBooking = createAsyncThunk(
  "eventHallBookings/start",
  async (id, { rejectWithValue }) => {
    try {
      const res = await api.put(`${BASE}/${id}/start`, {}, authHeader());
      return res.data.booking || res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to start booking.");
    }
  }
);

export const completeEventHallBooking = createAsyncThunk(
  "eventHallBookings/complete",
  async (id, { rejectWithValue }) => {
    try {
      const res = await api.put(`${BASE}/${id}/complete`, {}, authHeader());
      return res.data.booking || res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to complete booking.");
    }
  }
);

export const cancelEventHallBooking = createAsyncThunk(
  "eventHallBookings/cancel",
  async (id, { rejectWithValue }) => {
    try {
      const res = await api.delete(`${BASE}/${id}`, authHeader());
      return res.data.booking || { _id: id, status: "cancelled" };
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to cancel booking.");
    }
  }
);

const eventHallBookingSlice = createSlice({
  name: "eventHallBookings",
  initialState: {
    bookings: [], total: 0,
    loading: false, error: null,
    single: null, singleLoading: false, singleError: null,
    createLoading: false,  createError:   null,
    confirmLoading: null,  confirmError:  null,
    startLoading:   null,  startError:    null,
    completeLoading: null, completeError: null,
    cancelLoading:  null,  cancelError:   null,
  },
  reducers: {
    clearCreateError:  (state) => { state.createError = null; },
    clearSingle:       (state) => { state.single = null; state.singleError = null; },
    clearActionErrors: (state) => {
      state.confirmError  = null;
      state.startError    = null;
      state.completeError = null;
      state.cancelError   = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchEventHallBookings.pending,   (s) => { s.loading = true;  s.error = null; })
      .addCase(fetchEventHallBookings.fulfilled, (s, a) => {
        s.loading  = false;
        s.bookings = a.payload.bookings || a.payload;
        s.total    = a.payload.total || (a.payload.bookings || a.payload).length;
      })
      .addCase(fetchEventHallBookings.rejected,  (s, a) => { s.loading = false; s.error = a.payload; })

      .addCase(fetchEventHallBookingById.pending,   (s) => { s.singleLoading = true;  s.singleError = null; s.single = null; })
      .addCase(fetchEventHallBookingById.fulfilled, (s, a) => { s.singleLoading = false; s.single = a.payload; })
      .addCase(fetchEventHallBookingById.rejected,  (s, a) => { s.singleLoading = false; s.singleError = a.payload; })

      .addCase(createEventHallBooking.pending,   (s) => { s.createLoading = true;  s.createError = null; })
      .addCase(createEventHallBooking.fulfilled, (s, a) => { s.createLoading = false; if (a.payload?._id) { s.bookings.unshift(a.payload); s.total += 1; } })
      .addCase(createEventHallBooking.rejected,  (s, a) => { s.createLoading = false; s.createError = a.payload; })

      .addCase(confirmEventHallBooking.pending,   (s, a) => { s.confirmLoading = a.meta.arg; s.confirmError = null; })
      .addCase(confirmEventHallBooking.fulfilled, (s, a) => { s.confirmLoading = null; if (a.payload?._id) s.bookings = replaceBooking(s.bookings, a.payload); })
      .addCase(confirmEventHallBooking.rejected,  (s, a) => { s.confirmLoading = null; s.confirmError = a.payload; })

      .addCase(startEventHallBooking.pending,   (s, a) => { s.startLoading = a.meta.arg; s.startError = null; })
      .addCase(startEventHallBooking.fulfilled, (s, a) => { s.startLoading = null; if (a.payload?._id) s.bookings = replaceBooking(s.bookings, a.payload); })
      .addCase(startEventHallBooking.rejected,  (s, a) => { s.startLoading = null; s.startError = a.payload; })

      .addCase(completeEventHallBooking.pending,   (s, a) => { s.completeLoading = a.meta.arg; s.completeError = null; })
      .addCase(completeEventHallBooking.fulfilled, (s, a) => { s.completeLoading = null; if (a.payload?._id) s.bookings = replaceBooking(s.bookings, a.payload); })
      .addCase(completeEventHallBooking.rejected,  (s, a) => { s.completeLoading = null; s.completeError = a.payload; })

      .addCase(cancelEventHallBooking.pending,   (s, a) => { s.cancelLoading = a.meta.arg; s.cancelError = null; })
      .addCase(cancelEventHallBooking.fulfilled, (s, a) => { s.cancelLoading = null; if (a.payload?._id) s.bookings = replaceBooking(s.bookings, a.payload); })
      .addCase(cancelEventHallBooking.rejected,  (s, a) => { s.cancelLoading = null; s.cancelError = a.payload; });
  },
});

export const { clearCreateError, clearSingle, clearActionErrors } = eventHallBookingSlice.actions;
export default eventHallBookingSlice.reducer;
