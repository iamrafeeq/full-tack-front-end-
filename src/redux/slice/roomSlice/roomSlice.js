import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";

const BASE = "http://localhost:5000/api";

// Only attach the token if one exists — GET room routes are public,
// so unauthenticated users must not send "Bearer null"
const authHeader = () => {
  const token = localStorage.getItem("token");
  return token ? { headers: { Authorization: `Bearer ${token}` } } : {};
};

// ─────────────────────────────────────────────────────────────────────────────
// THUNKS  — each thunk maps to one backend endpoint
// ─────────────────────────────────────────────────────────────────────────────

// 1. GET all rooms  →  GET /api/getallrooms
//    Any authenticated user can fetch the full room list
export const fetchAllRooms = createAsyncThunk(
  "rooms/fetchAllRooms",
  async (_, { rejectWithValue }) => {
    try {
      const res = await axios.get(`${BASE}/getallrooms`, authHeader());
      return res.data; // { success, total, rooms }
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to fetch rooms.");
    }
  }
);

// 2. GET single room  →  GET /api/getroom/:id
//    Useful for a detail view or pre-filling an edit form from the API
export const fetchSingleRoom = createAsyncThunk(
  "rooms/fetchSingleRoom",
  async (id, { rejectWithValue }) => {
    try {
      const res = await axios.get(`${BASE}/getroom/${id}`, authHeader());
      return res.data; // { success, room }
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to fetch room.");
    }
  }
);

// 3. CREATE room  →  POST /api/createroom   (admin / manager only)
//    Sends the full room object; returns the newly created room document
export const createRoom = createAsyncThunk(
  "rooms/createRoom",
  async (roomData, { rejectWithValue }) => {
    try {
      const res = await axios.post(`${BASE}/createroom`, roomData, authHeader());
      return res.data; // { success, message, room }
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to create room.");
    }
  }
);

// 4. UPDATE room details  →  PUT /api/updateroom/:id   (admin / manager only)
//    Send only the fields you want to change; backend merges them
export const updateRoom = createAsyncThunk(
  "rooms/updateRoom",
  async ({ id, roomData }, { rejectWithValue }) => {
    try {
      const res = await axios.put(`${BASE}/updateroom/${id}`, roomData, authHeader());
      return res.data; // { success, message, room }
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to update room.");
    }
  }
);

// 5. UPDATE room status only  →  PATCH /api/updatestatus/:id   (admin / manager only)
//    Quick status change without touching other fields
//    Valid statuses: available | reserved | occupied | cleaning | maintenance
export const updateRoomStatus = createAsyncThunk(
  "rooms/updateRoomStatus",
  async ({ id, status }, { rejectWithValue }) => {
    try {
      const res = await axios.patch(`${BASE}/updatestatus/${id}`, { status }, authHeader());
      return res.data; // { success, message, room }
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to update status.");
    }
  }
);

// 6. DELETE room  →  DELETE /api/deleteroom/:id   (admin only)
//    Permanently removes the room; returns the deleted room's id so we can
//    remove it from local state without re-fetching the full list
export const deleteRoom = createAsyncThunk(
  "rooms/deleteRoom",
  async (id, { rejectWithValue }) => {
    try {
      await axios.delete(`${BASE}/deleteroom/${id}`, authHeader());
      return id; // just the id — used in the reducer to filter it out
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to delete room.");
    }
  }
);

// ─────────────────────────────────────────────────────────────────────────────
// INITIAL STATE
// ─────────────────────────────────────────────────────────────────────────────

const initialState = {
  // All rooms list
  rooms: [],
  total: 0,
  loading: false,
  error: null,

  // Single room (for detail / edit pre-fill from API)
  singleRoom: null,
  singleLoading: false,
  singleError: null,

  // Create
  createLoading: false,
  createError: null,

  // Update room details
  updateLoading: false,
  updateError: null,

  // Status-only update
  statusLoading: false,
  statusError: null,

  // Delete
  deleteLoading: false,
  deleteError: null,
};

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS  — update a single room in the rooms array by _id
// ─────────────────────────────────────────────────────────────────────────────

const replaceRoom = (rooms, updatedRoom) =>
  rooms.map((r) => (r._id === updatedRoom._id ? updatedRoom : r));

// ─────────────────────────────────────────────────────────────────────────────
// SLICE
// ─────────────────────────────────────────────────────────────────────────────

const roomSlice = createSlice({
  name: "rooms",
  initialState,
  reducers: {
    // Clear single room when closing a detail modal
    clearSingleRoom: (state) => {
      state.singleRoom = null;
      state.singleError = null;
    },
    // Reset create/update errors when opening a fresh form
    clearFormErrors: (state) => {
      state.createError = null;
      state.updateError = null;
    },
  },
  extraReducers: (builder) => {
    builder

      // ── 1. Fetch all rooms ───────────────────────────────────────────────
      .addCase(fetchAllRooms.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllRooms.fulfilled, (state, action) => {
        state.loading = false;
        state.rooms = action.payload.rooms;
        state.total  = action.payload.total;
      })
      .addCase(fetchAllRooms.rejected, (state, action) => {
        state.loading = false;
        state.error   = action.payload;
      })

      // ── 2. Fetch single room ─────────────────────────────────────────────
      .addCase(fetchSingleRoom.pending, (state) => {
        state.singleLoading = true;
        state.singleError   = null;
      })
      .addCase(fetchSingleRoom.fulfilled, (state, action) => {
        state.singleLoading = false;
        state.singleRoom    = action.payload.room;
      })
      .addCase(fetchSingleRoom.rejected, (state, action) => {
        state.singleLoading = false;
        state.singleError   = action.payload;
      })

      // ── 3. Create room ───────────────────────────────────────────────────
      .addCase(createRoom.pending, (state) => {
        state.createLoading = true;
        state.createError   = null;
      })
      .addCase(createRoom.fulfilled, (state, action) => {
        state.createLoading = false;
        // Prepend the new room so it appears at the top of the list
        state.rooms.unshift(action.payload.room);
        state.total += 1;
      })
      .addCase(createRoom.rejected, (state, action) => {
        state.createLoading = false;
        state.createError   = action.payload;
      })

      // ── 4. Update room details ───────────────────────────────────────────
      .addCase(updateRoom.pending, (state) => {
        state.updateLoading = true;
        state.updateError   = null;
      })
      .addCase(updateRoom.fulfilled, (state, action) => {
        state.updateLoading = false;
        // Replace the old room object with the fresh one from the API
        state.rooms = replaceRoom(state.rooms, action.payload.room);
      })
      .addCase(updateRoom.rejected, (state, action) => {
        state.updateLoading = false;
        state.updateError   = action.payload;
      })

      // ── 5. Update room status ────────────────────────────────────────────
      .addCase(updateRoomStatus.pending, (state) => {
        state.statusLoading = true;
        state.statusError   = null;
      })
      .addCase(updateRoomStatus.fulfilled, (state, action) => {
        state.statusLoading = false;
        // Only status changed — still replace the whole object with fresh data
        state.rooms = replaceRoom(state.rooms, action.payload.room);
      })
      .addCase(updateRoomStatus.rejected, (state, action) => {
        state.statusLoading = false;
        state.statusError   = action.payload;
      })

      // ── 6. Delete room ───────────────────────────────────────────────────
      .addCase(deleteRoom.pending, (state) => {
        state.deleteLoading = true;
        state.deleteError   = null;
      })
      .addCase(deleteRoom.fulfilled, (state, action) => {
        state.deleteLoading = false;
        // action.payload is the deleted room's _id — filter it out
        state.rooms = state.rooms.filter((r) => r._id !== action.payload);
        state.total -= 1;
      })
      .addCase(deleteRoom.rejected, (state, action) => {
        state.deleteLoading = false;
        state.deleteError   = action.payload;
      });
  },
});

export const { clearSingleRoom, clearFormErrors } = roomSlice.actions;
export default roomSlice.reducer;
