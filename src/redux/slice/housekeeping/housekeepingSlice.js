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

const housekeepingSlice = createSlice({
  name: "housekeeping",
  initialState: {
    cleaningRooms: [],
    loading:     false,
    error:       null,
    markLoading: null, // holds roomId currently being marked
    markError:   null,
  },
  reducers: {
    clearMarkError: (state) => { state.markError = null; },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCleaningRooms.pending, (state) => {
        state.loading = true;
        state.error   = null;
      })
      .addCase(fetchCleaningRooms.fulfilled, (state, action) => {
        state.loading       = false;
        state.cleaningRooms = action.payload;
      })
      .addCase(fetchCleaningRooms.rejected, (state, action) => {
        state.loading = false;
        state.error   = action.payload;
      })
      .addCase(markRoomClean.pending, (state, action) => {
        state.markLoading = action.meta.arg;
        state.markError   = null;
      })
      .addCase(markRoomClean.fulfilled, (state, action) => {
        state.markLoading   = null;
        state.cleaningRooms = state.cleaningRooms.filter(r => r._id !== action.payload);
      })
      .addCase(markRoomClean.rejected, (state, action) => {
        state.markLoading = null;
        state.markError   = action.payload;
      });
  },
});

export const { clearMarkError } = housekeepingSlice.actions;
export default housekeepingSlice.reducer;
