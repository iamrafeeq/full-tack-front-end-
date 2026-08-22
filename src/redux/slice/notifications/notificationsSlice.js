import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../../api/axios";

const BASE = "/api/notifications";
const authHeader = () => ({ headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } });

export const fetchUnreadCount = createAsyncThunk("notifications/unreadCount", async (_, { rejectWithValue }) => {
  try {
    const res = await api.get(`${BASE}/unread-count`, authHeader());
    return res.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || "Failed to fetch count");
  }
});

export const fetchNotifications = createAsyncThunk("notifications/fetchAll", async (_, { rejectWithValue }) => {
  try {
    const res = await api.get(BASE, authHeader());
    return res.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || "Failed to fetch notifications");
  }
});

export const markRead = createAsyncThunk("notifications/markRead", async (id, { rejectWithValue }) => {
  try {
    await api.put(`${BASE}/${id}/read`, {}, authHeader());
    return id;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || "Failed to mark read");
  }
});

export const markAllRead = createAsyncThunk("notifications/markAllRead", async (_, { rejectWithValue }) => {
  try {
    await api.put(`${BASE}/mark-all-read`, {}, authHeader());
    return true;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || "Failed to mark all read");
  }
});

const notificationsSlice = createSlice({
  name: "notifications",
  initialState: {
    list: [],
    listLoading: false,
    listError: null,
    unreadCount: 0,
    countLoading: false,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchUnreadCount.pending,   (state) => { state.countLoading = true; })
      .addCase(fetchUnreadCount.fulfilled, (state, action) => {
        state.countLoading = false;
        state.unreadCount = action.payload.count ?? 0;
      })
      .addCase(fetchUnreadCount.rejected,  (state) => { state.countLoading = false; })

      .addCase(fetchNotifications.pending,   (state) => { state.listLoading = true; state.listError = null; })
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        state.listLoading = false;
        state.list = action.payload.notifications || action.payload || [];
      })
      .addCase(fetchNotifications.rejected,  (state, action) => { state.listLoading = false; state.listError = action.payload; })

      .addCase(markRead.fulfilled, (state, action) => {
        const id = action.payload;
        const n = state.list.find((x) => x._id === id);
        if (n && !n.isRead) {
          n.isRead = true;
          state.unreadCount = Math.max(0, state.unreadCount - 1);
        }
      })

      .addCase(markAllRead.fulfilled, (state) => {
        state.list.forEach((n) => { n.isRead = true; });
        state.unreadCount = 0;
      });
  },
});

export default notificationsSlice.reducer;
