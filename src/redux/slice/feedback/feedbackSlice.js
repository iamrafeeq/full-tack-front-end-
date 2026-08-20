import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const BASE = "http://localhost:5000/api/feedback";

const authHeader = () => ({
  headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
});

export const fetchBookingFeedback = createAsyncThunk(
  "feedback/fetchBookingFeedback",
  async (bookingId, { rejectWithValue }) => {
    try {
      const res = await axios.get(`${BASE}/${bookingId}`, authHeader());
      return { bookingId, feedback: res.data.feedback || res.data };
    } catch (err) {
      if (err.response?.status === 404) return { bookingId, feedback: null };
      return rejectWithValue(err.response?.data?.message || "Failed to load feedback");
    }
  }
);

export const submitFeedback = createAsyncThunk(
  "feedback/submit",
  async ({ booking, rating, comment }, { rejectWithValue }) => {
    try {
      const res = await axios.post(BASE, { booking, rating, comment }, authHeader());
      return res.data.feedback || res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to submit feedback");
    }
  }
);

export const fetchAllFeedback = createAsyncThunk(
  "feedback/fetchAll",
  async ({ minRating = "", sort = "newest" } = {}, { rejectWithValue }) => {
    try {
      const params = new URLSearchParams();
      if (minRating) params.append("minRating", minRating);
      if (sort)      params.append("sort", sort);
      const qs  = params.toString();
      const url = qs ? `${BASE}?${qs}` : BASE;
      const res = await axios.get(url, authHeader());
      return res.data.feedbacks || res.data.feedback || res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to fetch feedback");
    }
  }
);

export const fetchFeedbackStats = createAsyncThunk(
  "feedback/fetchStats",
  async (_, { rejectWithValue }) => {
    try {
      const res = await axios.get(`${BASE}/stats`, authHeader());
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to fetch stats");
    }
  }
);

const feedbackSlice = createSlice({
  name: "feedback",
  initialState: {
    feedbackByBooking: {},
    fetchingBookings: {},
    submitLoading: false,
    submitError: null,
    list: [],
    listLoading: false,
    listError: null,
    stats: null,
    statsLoading: false,
    statsError: null,
  },
  reducers: {
    clearSubmitError: (state) => { state.submitError = null; },
  },
  extraReducers: (builder) => {
    builder
      // fetchBookingFeedback
      .addCase(fetchBookingFeedback.pending, (state, action) => {
        state.fetchingBookings[action.meta.arg] = true;
      })
      .addCase(fetchBookingFeedback.fulfilled, (state, action) => {
        const { bookingId, feedback } = action.payload;
        state.fetchingBookings[bookingId] = false;
        state.feedbackByBooking[bookingId] = feedback;
      })
      .addCase(fetchBookingFeedback.rejected, (state, action) => {
        state.fetchingBookings[action.meta.arg] = false;
      })

      // submitFeedback
      .addCase(submitFeedback.pending, (state) => {
        state.submitLoading = true;
        state.submitError = null;
      })
      .addCase(submitFeedback.fulfilled, (state, action) => {
        state.submitLoading = false;
        const bookingId = action.meta.arg.booking;
        state.feedbackByBooking[bookingId] = action.payload;
      })
      .addCase(submitFeedback.rejected, (state, action) => {
        state.submitLoading = false;
        state.submitError = action.payload;
      })

      // fetchAllFeedback
      .addCase(fetchAllFeedback.pending, (state) => {
        state.listLoading = true;
        state.listError = null;
      })
      .addCase(fetchAllFeedback.fulfilled, (state, action) => {
        state.listLoading = false;
        state.list = Array.isArray(action.payload) ? action.payload : [];
      })
      .addCase(fetchAllFeedback.rejected, (state, action) => {
        state.listLoading = false;
        state.listError = action.payload;
      })

      // fetchFeedbackStats
      .addCase(fetchFeedbackStats.pending, (state) => {
        state.statsLoading = true;
        state.statsError = null;
      })
      .addCase(fetchFeedbackStats.fulfilled, (state, action) => {
        state.statsLoading = false;
        state.stats = action.payload;
      })
      .addCase(fetchFeedbackStats.rejected, (state, action) => {
        state.statsLoading = false;
        state.statsError = action.payload;
      });
  },
});

export const { clearSubmitError } = feedbackSlice.actions;
export default feedbackSlice.reducer;
