import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../../api/axios";

const BASE = "/api/housekeeping";

const authHeader = () => ({
  headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
});

export const fetchCleaningRooms = createAsyncThunk(
  "housekeeping/fetchCleaningRooms",
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get(`${BASE}/cleaning-rooms`, authHeader());
      return res.data.rooms;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to fetch rooms");
    }
  }
);

export const markRoomClean = createAsyncThunk(
  "housekeeping/markRoomClean",
  async (roomId, { rejectWithValue }) => {
    try {
      await api.patch(`${BASE}/rooms/${roomId}/mark-clean`, {}, authHeader());
      return roomId;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to mark room clean");
    }
  }
);

export const fetchCleaningTables = createAsyncThunk(
  "housekeeping/fetchCleaningTables",
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get(`${BASE}/tables`, authHeader());
      return res.data.tables || res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to fetch tables");
    }
  }
);

export const markTableClean = createAsyncThunk(
  "housekeeping/markTableClean",
  async (tableId, { rejectWithValue }) => {
    try {
      await api.put(`${BASE}/tables/${tableId}/done`, {}, authHeader());
      return tableId;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to mark table clean");
    }
  }
);

const housekeepingSlice = createSlice({
  name: "housekeeping",
  initialState: {
    cleaningRooms:  [],
    loading:        false,
    error:          null,
    markLoading:    null,
    markError:      null,
    cleaningTables: [],
    tablesLoading:  false,
    tablesError:    null,
    tableMarkLoading: null,
    tableMarkError:   null,
  },
  reducers: {
    clearMarkError:      (state) => { state.markError = null; },
    clearTableMarkError: (state) => { state.tableMarkError = null; },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCleaningRooms.pending,   (s) => { s.loading = true;  s.error = null; })
      .addCase(fetchCleaningRooms.fulfilled, (s, a) => { s.loading = false; s.cleaningRooms = a.payload; })
      .addCase(fetchCleaningRooms.rejected,  (s, a) => { s.loading = false; s.error = a.payload; })
      .addCase(markRoomClean.pending,   (s, a) => { s.markLoading = a.meta.arg; s.markError = null; })
      .addCase(markRoomClean.fulfilled, (s, a) => { s.markLoading = null; s.cleaningRooms = s.cleaningRooms.filter(r => r._id !== a.payload); })
      .addCase(markRoomClean.rejected,  (s, a) => { s.markLoading = null; s.markError = a.payload; })
      .addCase(fetchCleaningTables.pending,   (s) => { s.tablesLoading = true;  s.tablesError = null; })
      .addCase(fetchCleaningTables.fulfilled, (s, a) => { s.tablesLoading = false; s.cleaningTables = a.payload; })
      .addCase(fetchCleaningTables.rejected,  (s, a) => { s.tablesLoading = false; s.tablesError = a.payload; })
      .addCase(markTableClean.pending,   (s, a) => { s.tableMarkLoading = a.meta.arg; s.tableMarkError = null; })
      .addCase(markTableClean.fulfilled, (s, a) => { s.tableMarkLoading = null; s.cleaningTables = s.cleaningTables.filter(t => t._id !== a.payload); })
      .addCase(markTableClean.rejected,  (s, a) => { s.tableMarkLoading = null; s.tableMarkError = a.payload; });
  },
});

export const { clearMarkError, clearTableMarkError } = housekeepingSlice.actions;
export default housekeepingSlice.reducer;
