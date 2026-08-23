import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import api from "../../../api/axios";

const BASE = "/api/table-reservations";
const authHeader = () => ({
  headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
});

const replaceRes = (arr, updated) =>
  arr.map((r) => (r._id === updated._id ? updated : r));

export const fetchTableReservations = createAsyncThunk(
  "tableReservations/fetchAll",
  async (params = {}, { rejectWithValue }) => {
    try {
      const qs = new URLSearchParams();
      if (params.status) qs.set("status", params.status);
      if (params.date)   qs.set("date",   params.date);
      const res = await api.get(`${BASE}${qs.toString() ? `?${qs}` : ""}`, authHeader());
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to fetch reservations.");
    }
  }
);

export const fetchTableReservationById = createAsyncThunk(
  "tableReservations/fetchById",
  async (id, { rejectWithValue }) => {
    try {
      const res = await api.get(`${BASE}/${id}`, authHeader());
      return res.data.reservation;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to fetch reservation.");
    }
  }
);

export const createTableReservation = createAsyncThunk(
  "tableReservations/create",
  async (data, { rejectWithValue }) => {
    try {
      const res = await api.post(BASE, data, authHeader());
      return res.data.reservation;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to create reservation.");
    }
  }
);

export const seatTableReservation = createAsyncThunk(
  "tableReservations/seat",
  async (id, { rejectWithValue }) => {
    try {
      const res = await api.put(`${BASE}/${id}/seat`, {}, authHeader());
      return res.data.reservation;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to seat reservation.");
    }
  }
);

export const completeTableReservation = createAsyncThunk(
  "tableReservations/complete",
  async (id, { rejectWithValue }) => {
    try {
      const res = await api.put(`${BASE}/${id}/complete`, {}, authHeader());
      return res.data.reservation;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to complete reservation.");
    }
  }
);

export const cancelTableReservation = createAsyncThunk(
  "tableReservations/cancel",
  async (id, { rejectWithValue }) => {
    try {
      const res = await api.delete(`${BASE}/${id}`, authHeader());
      return res.data.reservation || { _id: id, status: "cancelled" };
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to cancel reservation.");
    }
  }
);

const tableReservationSlice = createSlice({
  name: "tableReservations",
  initialState: {
    reservations: [], total: 0,
    loading: false, error: null,
    single: null, singleLoading: false, singleError: null,
    createLoading: false, createError: null,
    seatLoading: null,     seatError: null,
    completeLoading: null, completeError: null,
    cancelLoading: null,   cancelError: null,
  },
  reducers: {
    clearCreateError:  (s) => { s.createError = null; },
    clearSingle:       (s) => { s.single = null; s.singleError = null; },
    clearActionErrors: (s) => { s.seatError = null; s.completeError = null; s.cancelError = null; },
  },
  extraReducers: (builder) => {
    builder
      // fetchAll 
      .addCase(fetchTableReservations.pending,    (s) => { s.loading = true;  s.error = null; })
      .addCase(fetchTableReservations.fulfilled,  (s, a) => { s.loading = false; s.reservations = a.payload.reservations || a.payload; s.total = a.payload.total || s.reservations.length; })
      .addCase(fetchTableReservations.rejected,   (s, a) => { s.loading = false; s.error = a.payload; })
      // fetchById
      .addCase(fetchTableReservationById.pending,   (s) => { s.singleLoading = true;  s.singleError = null; })
      .addCase(fetchTableReservationById.fulfilled, (s, a) => { s.singleLoading = false; s.single = a.payload; })
      .addCase(fetchTableReservationById.rejected,  (s, a) => { s.singleLoading = false; s.singleError = a.payload; })
      // create
      .addCase(createTableReservation.pending,   (s) => { s.createLoading = true;  s.createError = null; })
      .addCase(createTableReservation.fulfilled, (s, a) => { s.createLoading = false; s.reservations.unshift(a.payload); s.total += 1; })
      .addCase(createTableReservation.rejected,  (s, a) => { s.createLoading = false; s.createError = a.payload; })
      // seat
      .addCase(seatTableReservation.pending,   (s, a) => { s.seatLoading = a.meta.arg; s.seatError = null; })
      .addCase(seatTableReservation.fulfilled, (s, a) => { s.seatLoading = null; s.reservations = replaceRes(s.reservations, a.payload); })
      .addCase(seatTableReservation.rejected,  (s, a) => { s.seatLoading = null; s.seatError = a.payload; })
      // complete
      .addCase(completeTableReservation.pending,   (s, a) => { s.completeLoading = a.meta.arg; s.completeError = null; })
      .addCase(completeTableReservation.fulfilled, (s, a) => { s.completeLoading = null; s.reservations = replaceRes(s.reservations, a.payload); })
      .addCase(completeTableReservation.rejected,  (s, a) => { s.completeLoading = null; s.completeError = a.payload; })
      // cancel
      .addCase(cancelTableReservation.pending,   (s, a) => { s.cancelLoading = a.meta.arg; s.cancelError = null; })
      .addCase(cancelTableReservation.fulfilled, (s, a) => { s.cancelLoading = null; s.reservations = replaceRes(s.reservations, a.payload); })
      .addCase(cancelTableReservation.rejected,  (s, a) => { s.cancelLoading = null; s.cancelError = a.payload; });
  },
});

export const { clearCreateError, clearSingle, clearActionErrors } = tableReservationSlice.actions;
export default tableReservationSlice.reducer;
