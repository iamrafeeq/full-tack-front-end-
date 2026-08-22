import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../../api/axios";

const BASE = "/api/housekeeping";

const authHeader = () => ({
  headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
});

export const fetchMaintenanceRequests = createAsyncThunk(
  "maintenance/fetchRequests",
  async (status = "", { rejectWithValue }) => {
    try {
      const url = status
        ? `${BASE}/maintenance?status=${status}`
        : `${BASE}/maintenance`;
      const res = await api.get(url, authHeader());
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
      const res = await api.post(`${BASE}/maintenance`, { room, issue }, authHeader());
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
      await api.patch(`${BASE}/maintenance/${id}`, { status }, authHeader());
      return { id, status };
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to update status");
    }
  }
);

export const fetchHousekeepingStaff = createAsyncThunk(
  "maintenance/fetchHousekeepingStaff",
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get(`${BASE}/maintenance/housekeeping-staff`, authHeader());
      return res.data.staff;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to fetch housekeeping staff");
    }
  }
);

export const assignMaintenance = createAsyncThunk(
  "maintenance/assign",
  async ({ id, assignedTo }, { rejectWithValue }) => {
    try {
      const res = await api.put(`${BASE}/maintenance/${id}/assign`, { assignedTo }, authHeader());
      return res.data.request;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to assign maintenance request");
    }
  }
);

export const fetchMyTasks = createAsyncThunk(
  "maintenance/fetchMyTasks",
  async (status = "", { rejectWithValue }) => {
    try {
      const url = status
        ? `${BASE}/maintenance/my-tasks?status=${status}`
        : `${BASE}/maintenance/my-tasks`;
      const res = await api.get(url, authHeader());
      return res.data.tasks;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to fetch your tasks");
    }
  }
);

const maintenanceSlice = createSlice({
  name: "maintenance",
  initialState: {
    requests:       [],
    loading:        false,
    error:          null,
    reportLoading:  false,
    reportError:    null,
    reportSuccess:  false,
    updateLoading:  null, // holds id of request currently being updated
    updateError:    null,
    staffList:      [],
    staffLoading:   false,
    staffError:     null,
    assignLoading:  null, // holds id of request currently being assigned
    assignError:    null,
    myTasks:        [],
    myTasksLoading: false,
    myTasksError:   null,
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
      // updateStatus — patch both requests and myTasks arrays
      .addCase(updateMaintenanceStatus.pending, (state, action) => {
        state.updateLoading = action.meta.arg.id;
        state.updateError   = null;
      })
      .addCase(updateMaintenanceStatus.fulfilled, (state, action) => {
        state.updateLoading = null;
        const { id, status } = action.payload;
        const idx = state.requests.findIndex(r => r._id === id);
        if (idx !== -1) state.requests[idx] = { ...state.requests[idx], status };
        const myIdx = state.myTasks.findIndex(r => r._id === id);
        if (myIdx !== -1) state.myTasks[myIdx] = { ...state.myTasks[myIdx], status };
      })
      .addCase(updateMaintenanceStatus.rejected, (state, action) => {
        state.updateLoading = null;
        state.updateError   = action.payload;
      })
      // fetchHousekeepingStaff
      .addCase(fetchHousekeepingStaff.pending, (state) => {
        state.staffLoading = true;
        state.staffError   = null;
      })
      .addCase(fetchHousekeepingStaff.fulfilled, (state, action) => {
        state.staffLoading = false;
        state.staffList    = action.payload;
      })
      .addCase(fetchHousekeepingStaff.rejected, (state, action) => {
        state.staffLoading = false;
        state.staffError   = action.payload;
      })
      // assignMaintenance — replace the full request object to preserve populated fields
      .addCase(assignMaintenance.pending, (state, action) => {
        state.assignLoading = action.meta.arg.id;
        state.assignError   = null;
      })
      .addCase(assignMaintenance.fulfilled, (state, action) => {
        state.assignLoading = null;
        const updated = action.payload;
        const idx = state.requests.findIndex(r => r._id === updated._id);
        if (idx !== -1) state.requests[idx] = updated;
      })
      .addCase(assignMaintenance.rejected, (state, action) => {
        state.assignLoading = null;
        state.assignError   = action.payload;
      })
      // fetchMyTasks
      .addCase(fetchMyTasks.pending, (state) => {
        state.myTasksLoading = true;
        state.myTasksError   = null;
      })
      .addCase(fetchMyTasks.fulfilled, (state, action) => {
        state.myTasksLoading = false;
        state.myTasks        = action.payload;
      })
      .addCase(fetchMyTasks.rejected, (state, action) => {
        state.myTasksLoading = false;
        state.myTasksError   = action.payload;
      });
  },
});

export const { clearReportState } = maintenanceSlice.actions;
export default maintenanceSlice.reducer;
