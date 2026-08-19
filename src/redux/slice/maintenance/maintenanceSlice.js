import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const BASE = "http://localhost:5000/api/housekeeping";

const authHeader = () => ({
  headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
});

export const fetchMaintenanceRequests = createAsyncThunk(
  "maintenance/fetchRequests",
  async (status = "", { rejectWithValue }) => {
    try {
      const url = status ? `${BASE}/maintenance?status=${status}` : `${BASE}/maintenance`;
      const res = await axios.get(url, authHeader());
      return res.data.requests;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to fetch maintenance requests");
    }
  }
);

export const reportMaintenance = createAsyncThunk(
  "maintenance/report",
  async ({ room, issue }, { rejectWithValue }) => {
    try {
      const res = await axios.post(`${BASE}/maintenance`, { room, issue }, authHeader());
      return res.data.request;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to report issue");
    }
  }
);

export const updateMaintenanceStatus = createAsyncThunk(
  "maintenance/updateStatus",
  async ({ id, status }, { rejectWithValue }) => {
    try {
      await axios.patch(`${BASE}/maintenance/${id}`, { status }, authHeader());
      return { id, status };
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to update status");
    }
  }
);

const maintenanceSlice = createSlice({
  name: "maintenance",
  initialState: {
    requests:      [],
    loading:       false,
    error:         null,
    reportLoading: false,
    reportError:   null,
    reportSuccess: false,
    updateLoading: null, // holds id of request currently being updated
    updateError:   null,
  },
  reducers: {
    clearReportState: (state) => {
      state.reportError   = null;
      state.reportSuccess = false;
    },
  },
  extraReducers: (builder) => {
    builder
      // fetchRequests
      .addCase(fetchMaintenanceRequests.pending, (state) => {
        state.loading = true;
        state.error   = null;
      })
      .addCase(fetchMaintenanceRequests.fulfilled, (state, action) => {
        state.loading  = false;
        state.requests = action.payload;
      })
      .addCase(fetchMaintenanceRequests.rejected, (state, action) => {
        state.loading = false;
        state.error   = action.payload;
      })
      // reportMaintenance
      .addCase(reportMaintenance.pending, (state) => {
        state.reportLoading = true;
        state.reportError   = null;
        state.reportSuccess = false;
      })
      .addCase(reportMaintenance.fulfilled, (state) => {
        state.reportLoading = false;
        state.reportSuccess = true;
      })
      .addCase(reportMaintenance.rejected, (state, action) => {
        state.reportLoading = false;
        state.reportError   = action.payload;
      })
      // updateStatus — update only the status field to keep populated room/reportedBy intact
      .addCase(updateMaintenanceStatus.pending, (state, action) => {
        state.updateLoading = action.meta.arg.id;
        state.updateError   = null;
      })
      .addCase(updateMaintenanceStatus.fulfilled, (state, action) => {
        state.updateLoading = null;
        const { id, status } = action.payload;
        const idx = state.requests.findIndex(r => r._id === id);
        if (idx !== -1) state.requests[idx] = { ...state.requests[idx], status };
      })
      .addCase(updateMaintenanceStatus.rejected, (state, action) => {
        state.updateLoading = null;
        state.updateError   = action.payload;
      });
  },
});

export const { clearReportState } = maintenanceSlice.actions;
export default maintenanceSlice.reducer;
