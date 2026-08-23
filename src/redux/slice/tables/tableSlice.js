import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import api from "../../../api/axios";

const BASE = "/api/tables";
const authHeader = () => ({
  headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
});

const replace = (arr, updated) =>
  arr.map((t) => (t._id === updated._id ? updated : t));

export const fetchAllTables = createAsyncThunk(
  "tables/fetchAll",
  async (includeInactive = false, { rejectWithValue }) => {
    try {
      const params = new URLSearchParams({ limit: 200 });
      if (includeInactive) params.set("includeInactive", "true");
      const res = await api.get(`${BASE}?${params}`, authHeader());
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to fetch tables.");
    }
  }
);

export const createTable = createAsyncThunk(
  "tables/create",
  async (data, { rejectWithValue }) => {
    try {
      const res = await api.post(BASE, data, authHeader());
      return res.data.table;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to create table.");
    }
  }
);

export const updateTable = createAsyncThunk(
  "tables/update",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const res = await api.put(`${BASE}/${id}`, data, authHeader());
      return res.data.table;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to update table.");
    }
  }
);

export const updateTableStatus = createAsyncThunk(
  "tables/updateStatus",
  async ({ id, status }, { rejectWithValue }) => {
    try {
      const res = await api.put(`${BASE}/${id}`, { status }, authHeader());
      return res.data.table;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to update status.");
    }
  }
);

export const deactivateTable = createAsyncThunk(
  "tables/deactivate",
  async (id, { rejectWithValue }) => {
    try {
      await api.put(`${BASE}/${id}/deactivate`, {}, authHeader());
      return id;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to deactivate.");
    }
  }
);

export const activateTable = createAsyncThunk(
  "tables/activate",
  async (id, { rejectWithValue }) => {
    try {
      await api.put(`${BASE}/${id}/activate`, {}, authHeader());
      return id;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to activate.");
    }
  }
);

export const deleteTable = createAsyncThunk(
  "tables/delete",
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`${BASE}/${id}`, authHeader());
      return id;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to delete table.");
    }
  }
);

const tableSlice = createSlice({
  name: "tables",
  initialState: {
    tables: [], total: 0,
    loading: false, error: null,
    createLoading: false, createError: null,
    updateLoading: false, updateError: null,
    statusLoading: false, statusError: null,
    deactivateLoading: null, deactivateError: null,
    activateLoading: null,  activateError: null,
    deleteLoading: false,   deleteError: null,
  },
  reducers: {
    clearFormErrors: (state) => {
      state.createError = null;
      state.updateError = null;
    },
    clearDeleteError: (state) => { state.deleteError = null; },
    clearActionErrors: (state) => {
      state.statusError = null;
      state.deactivateError = null;
      state.activateError = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // fetchAll
      .addCase(fetchAllTables.pending,    (s) => { s.loading = true;  s.error = null; })
      .addCase(fetchAllTables.fulfilled,  (s, a) => { s.loading = false; s.tables = a.payload.tables || a.payload; s.total = a.payload.total || (a.payload.tables || a.payload).length; })
      .addCase(fetchAllTables.rejected,   (s, a) => { s.loading = false; s.error = a.payload; })
      // create
      .addCase(createTable.pending,   (s) => { s.createLoading = true;  s.createError = null; })
      .addCase(createTable.fulfilled, (s, a) => { s.createLoading = false; s.tables.unshift(a.payload); s.total += 1; })
      .addCase(createTable.rejected,  (s, a) => { s.createLoading = false; s.createError = a.payload; })
      // update
      .addCase(updateTable.pending,   (s) => { s.updateLoading = true;  s.updateError = null; })
      .addCase(updateTable.fulfilled, (s, a) => { s.updateLoading = false; s.tables = replace(s.tables, a.payload); })
      .addCase(updateTable.rejected,  (s, a) => { s.updateLoading = false; s.updateError = a.payload; })
      // status
      .addCase(updateTableStatus.pending,   (s) => { s.statusLoading = true;  s.statusError = null; })
      .addCase(updateTableStatus.fulfilled, (s, a) => { s.statusLoading = false; s.tables = replace(s.tables, a.payload); })
      .addCase(updateTableStatus.rejected,  (s, a) => { s.statusLoading = false; s.statusError = a.payload; })
      // deactivate
      .addCase(deactivateTable.pending,   (s, a) => { s.deactivateLoading = a.meta.arg; s.deactivateError = null; })
      .addCase(deactivateTable.fulfilled, (s, a) => { s.deactivateLoading = null; s.tables = s.tables.map(t => t._id === a.payload ? { ...t, isActive: false } : t); })
      .addCase(deactivateTable.rejected,  (s, a) => { s.deactivateLoading = null; s.deactivateError = a.payload; })
      // activate
      .addCase(activateTable.pending,   (s, a) => { s.activateLoading = a.meta.arg; s.activateError = null; })
      .addCase(activateTable.fulfilled, (s, a) => { s.activateLoading = null; s.tables = s.tables.map(t => t._id === a.payload ? { ...t, isActive: true } : t); })
      .addCase(activateTable.rejected,  (s, a) => { s.activateLoading = null; s.activateError = a.payload; })
      // delete
      .addCase(deleteTable.pending,   (s) => { s.deleteLoading = true;  s.deleteError = null; })
      .addCase(deleteTable.fulfilled, (s, a) => { s.deleteLoading = false; s.tables = s.tables.filter(t => t._id !== a.payload); s.total = Math.max(0, s.total - 1); })
      .addCase(deleteTable.rejected,  (s, a) => { s.deleteLoading = false; s.deleteError = a.payload; });
  },
});

export const { clearFormErrors, clearDeleteError, clearActionErrors } = tableSlice.actions;
export default tableSlice.reducer;
