import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import api from "../../../api/axios";

const BASE = "/api/event-halls";
const authHeader = () => ({
  headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
});

const replace = (arr, updated) => arr.map((h) => (h._id === updated._id ? updated : h));

export const fetchAllEventHalls = createAsyncThunk(
  "eventHalls/fetchAll",
  async (includeInactive = false, { rejectWithValue }) => {
    try {
      const params = new URLSearchParams({ limit: 200 });
      if (includeInactive) params.set("includeInactive", "true");
      const res = await api.get(`${BASE}?${params}`, authHeader());
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to fetch event halls.");
    }
  }
);

export const createEventHall = createAsyncThunk(
  "eventHalls/create",
  async (data, { rejectWithValue }) => {
    try {
      const res = await api.post(BASE, data, authHeader());
      return res.data.hall;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to create event hall.");
    }
  }
);

export const updateEventHall = createAsyncThunk(
  "eventHalls/update",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const res = await api.put(`${BASE}/${id}`, data, authHeader());
      return res.data.hall;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to update event hall.");
    }
  }
);

export const updateEventHallStatus = createAsyncThunk(
  "eventHalls/updateStatus",
  async ({ id, status }, { rejectWithValue }) => {
    try {
      const res = await api.put(`${BASE}/${id}`, { status }, authHeader());
      return res.data.hall;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to update status.");
    }
  }
);

export const deactivateEventHall = createAsyncThunk(
  "eventHalls/deactivate",
  async (id, { rejectWithValue }) => {
    try {
      await api.put(`${BASE}/${id}/deactivate`, {}, authHeader());
      return id;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to deactivate.");
    }
  }
);

export const activateEventHall = createAsyncThunk(
  "eventHalls/activate",
  async (id, { rejectWithValue }) => {
    try {
      await api.put(`${BASE}/${id}/activate`, {}, authHeader());
      return id;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to activate.");
    }
  }
);

export const deleteEventHall = createAsyncThunk(
  "eventHalls/delete",
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`${BASE}/${id}`, authHeader());
      return id;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to delete event hall.");
    }
  }
);

const eventHallSlice = createSlice({
  name: "eventHalls",
  initialState: {
    halls: [], total: 0,
    loading: false, error: null,
    createLoading: false, createError: null,
    updateLoading: false, updateError: null,
    statusLoading: false, statusError: null,
    deactivateLoading: null, deactivateError: null,
    activateLoading:   null, activateError:   null,
    deleteLoading: false,    deleteError:     null,
  },
  reducers: {
    clearFormErrors:  (state) => { state.createError = null; state.updateError = null; },
    clearDeleteError: (state) => { state.deleteError = null; },
    clearActionErrors:(state) => { state.statusError = null; state.deactivateError = null; state.activateError = null; },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAllEventHalls.pending,    (s) => { s.loading = true;  s.error = null; })
      .addCase(fetchAllEventHalls.fulfilled,  (s, a) => {
        s.loading = false;
        s.halls   = a.payload.halls || a.payload;
        s.total   = a.payload.total || (a.payload.halls || a.payload).length;
      })
      .addCase(fetchAllEventHalls.rejected,   (s, a) => { s.loading = false; s.error = a.payload; })

      .addCase(createEventHall.pending,   (s) => { s.createLoading = true;  s.createError = null; })
      .addCase(createEventHall.fulfilled, (s, a) => { s.createLoading = false; if (a.payload) { s.halls.unshift(a.payload); s.total += 1; } })
      .addCase(createEventHall.rejected,  (s, a) => { s.createLoading = false; s.createError = a.payload; })

      .addCase(updateEventHall.pending,   (s) => { s.updateLoading = true;  s.updateError = null; })
      .addCase(updateEventHall.fulfilled, (s, a) => { s.updateLoading = false; if (a.payload) s.halls = replace(s.halls, a.payload); })
      .addCase(updateEventHall.rejected,  (s, a) => { s.updateLoading = false; s.updateError = a.payload; })

      .addCase(updateEventHallStatus.pending,   (s) => { s.statusLoading = true;  s.statusError = null; })
      .addCase(updateEventHallStatus.fulfilled, (s, a) => { s.statusLoading = false; if (a.payload) s.halls = replace(s.halls, a.payload); })
      .addCase(updateEventHallStatus.rejected,  (s, a) => { s.statusLoading = false; s.statusError = a.payload; })

      .addCase(deactivateEventHall.pending,   (s, a) => { s.deactivateLoading = a.meta.arg; s.deactivateError = null; })
      .addCase(deactivateEventHall.fulfilled, (s, a) => { s.deactivateLoading = null; s.halls = s.halls.map(h => h._id === a.payload ? { ...h, isActive: false } : h); })
      .addCase(deactivateEventHall.rejected,  (s, a) => { s.deactivateLoading = null; s.deactivateError = a.payload; })

      .addCase(activateEventHall.pending,   (s, a) => { s.activateLoading = a.meta.arg; s.activateError = null; })
      .addCase(activateEventHall.fulfilled, (s, a) => { s.activateLoading = null; s.halls = s.halls.map(h => h._id === a.payload ? { ...h, isActive: true } : h); })
      .addCase(activateEventHall.rejected,  (s, a) => { s.activateLoading = null; s.activateError = a.payload; })

      .addCase(deleteEventHall.pending,   (s) => { s.deleteLoading = true;  s.deleteError = null; })
      .addCase(deleteEventHall.fulfilled, (s, a) => { s.deleteLoading = false; s.halls = s.halls.filter(h => h._id !== a.payload); s.total = Math.max(0, s.total - 1); })
      .addCase(deleteEventHall.rejected,  (s, a) => { s.deleteLoading = false; s.deleteError = a.payload; });
  },
});

export const { clearFormErrors, clearDeleteError, clearActionErrors } = eventHallSlice.actions;
export default eventHallSlice.reducer;
