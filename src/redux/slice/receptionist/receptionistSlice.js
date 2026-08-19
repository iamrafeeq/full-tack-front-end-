import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";

const BASE = "http://localhost:5000/api/receptionist";

const authHeader = () => ({
  headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
});

export const fetchTodayActivity = createAsyncThunk(
  "receptionist/fetchTodayActivity",
  async (_, { rejectWithValue }) => {
    try {
      const res = await axios.get(`${BASE}/today`, authHeader());
      return res.data; // { arrivals, departures }
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to load today's activity.");
    }
  }
);

export const searchGuests = createAsyncThunk(
  "receptionist/searchGuests",
  async (query, { rejectWithValue }) => {
    try {
      const res = await axios.get(`${BASE}/guests?search=${encodeURIComponent(query)}`, authHeader());
      return res.data; // array or { guests: [...] }
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Guest search failed.");
    }
  }
);

const initialState = {
  arrivals: [],
  departures: [],
  todayLoading: false,
  todayError: null,
  guestResults: [],
  searchLoading: false,
  searchError: null,
};

const receptionistSlice = createSlice({
  name: "receptionist",
  initialState,
  reducers: {
    clearGuestResults: (state) => {
      state.guestResults = [];
      state.searchError = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTodayActivity.pending, (state) => {
        state.todayLoading = true;
        state.todayError = null;
      })
      .addCase(fetchTodayActivity.fulfilled, (state, action) => {
        state.todayLoading = false;
        state.arrivals = action.payload.arrivals || [];
        state.departures = action.payload.departures || [];
      })
      .addCase(fetchTodayActivity.rejected, (state, action) => {
        state.todayLoading = false;
        state.todayError = action.payload;
      })
      .addCase(searchGuests.pending, (state) => {
        state.searchLoading = true;
        state.searchError = null;
      })
      .addCase(searchGuests.fulfilled, (state, action) => {
        state.searchLoading = false;
        // Backend may return array directly or { guests: [...] }
        state.guestResults = Array.isArray(action.payload)
          ? action.payload
          : action.payload.guests || [];
      })
      .addCase(searchGuests.rejected, (state, action) => {
        state.searchLoading = false;
        state.searchError = action.payload;
      });
  },
});

export const { clearGuestResults } = receptionistSlice.actions;
export default receptionistSlice.reducer;
