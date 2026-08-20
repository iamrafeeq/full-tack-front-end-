import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const BASE = "http://localhost:5000/api/settings";
const authHeader = () => ({ headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } });

export const fetchSettings = createAsyncThunk("settings/fetch", async (_, { rejectWithValue }) => {
  try {
    const res = await axios.get(BASE, authHeader());
    return res.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || "Failed to load settings");
  }
});

export const updateSettings = createAsyncThunk("settings/update", async (payload, { rejectWithValue }) => {
  try {
    const res = await axios.put(BASE, payload, authHeader());
    return res.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || "Failed to save settings");
  }
});

const settingsSlice = createSlice({
  name: "settings",
  initialState: {
    data: null,
    loading: false,
    error: null,
    updateLoading: false,
    updateError: null,
    updateSuccess: false,
  },
  reducers: {
    clearUpdateStatus(state) {
      state.updateError = null;
      state.updateSuccess = false;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchSettings.pending,   (state) => { state.loading = true; state.error = null; })
      .addCase(fetchSettings.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload.settings || action.payload;
      })
      .addCase(fetchSettings.rejected,  (state, action) => { state.loading = false; state.error = action.payload; })
      .addCase(updateSettings.pending,   (state) => { state.updateLoading = true; state.updateError = null; state.updateSuccess = false; })
      .addCase(updateSettings.fulfilled, (state, action) => {
        state.updateLoading = false;
        state.updateSuccess = true;
        state.data = action.payload.settings || action.payload;
      })
      .addCase(updateSettings.rejected,  (state, action) => { state.updateLoading = false; state.updateError = action.payload; });
  },
});

export const { clearUpdateStatus } = settingsSlice.actions;
export default settingsSlice.reducer;
