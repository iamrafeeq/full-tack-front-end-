import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import api from "../../../../api/axios";

const getToken = () => localStorage.getItem("token");
const authHeader = () => ({ headers: { Authorization: `Bearer ${getToken()}` } });

export const deleteBooking = createAsyncThunk(
  "deleteBooking/delete",
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`/api/bookings/deletebooking/${id}`, authHeader());
      return id;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to delete booking.");
    }
  }
);

const deleteBookingSlice = createSlice({
  name: "deleteBooking",
  initialState: { loading: false, error: null },
  reducers: {
    clearDeleteError: (state) => { state.error = null; },
  },
  extraReducers: (builder) => {
    builder
      .addCase(deleteBooking.pending,   (state) => { state.loading = true;  state.error = null; })
      .addCase(deleteBooking.fulfilled, (state) => { state.loading = false; })
      .addCase(deleteBooking.rejected,  (state, action) => {
        state.loading = false;
        state.error   = action.payload;
      });
  },
});

export const { clearDeleteError } = deleteBookingSlice.actions;
export default deleteBookingSlice.reducer;
