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

// 1. GET all rooms  →  GET /api/getallrooms?limit=100[&includeInactive=true]
export const fetchAllRooms = createAsyncThunk(
  "rooms/fetchAllRooms",
  async (includeInactive = false, { rejectWithValue }) => {
    try {
      const params = new URLSearchParams({ limit: 100 });
      if (includeInactive) params.set("includeInactive", "true");
      const res = await axios.get(`${BASE}/getallrooms?${params}`, authHeader());
      return res.data; // { success, total, rooms }
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to fetch rooms.");
    }
  }
);

// 1b. GET all rooms (public, no admin token needed)  →  GET /api/getallrooms?limit=100
//     Used by non-admin roles (housekeeping, receptionist) that cannot hit the admin endpoint.
export const fetchPublicRooms = createAsyncThunk(
  "rooms/fetchPublicRooms",
  async (_, { rejectWithValue }) => {
    try {
      const res = await axios.get(`${BASE}/getallrooms?limit=100`, authHeader());
      return res.data; // { success, total, rooms }
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to fetch rooms.");
    }
  }
);

// 2. GET single room  →  GET /api/getroom/:id
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

// 6. CHECK AVAILABILITY  →  GET /api/available?checkIn=&checkOut=&guests=  (public)
export const fetchAvailableRooms = createAsyncThunk(
  "rooms/fetchAvailableRooms",
  async ({ checkIn, checkOut, guests }, { rejectWithValue }) => {
    try {
      const params = new URLSearchParams({ checkIn, checkOut });
      if (guests && Number(guests) > 1) params.set("guests", guests);
      const res = await axios.get(`${BASE}/available?${params}`);
      return res.data; // { success, count, rooms }
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to check availability.");
    }
  }
);

// 7. DELETE room  →  DELETE /api/deleteroom/:id   (admin only)
//    Rejected by backend if the room has any booking history.
export const deleteRoom = createAsyncThunk(
  "rooms/deleteRoom",
  async (id, { rejectWithValue }) => {
    try {
      await axios.delete(`${BASE}/deleteroom/${id}`, authHeader());
      return id;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to delete room.");
    }
  }
);

// 8. DEACTIVATE room  →  PUT /api/deactivateroom/:id   (admin only)
//    Rejected by backend if the room has an active booking (booked / checked-in).
export const deactivateRoom = createAsyncThunk(
  "rooms/deactivateRoom",
  async (id, { rejectWithValue }) => {
    try {
      const res = await axios.put(`${BASE}/deactivateroom/${id}`, {}, authHeader());
      return res.data; // { success, room }
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to deactivate room.");
    }
  }
);

// 9. ACTIVATE room  →  PUT /api/activateroom/:id   (admin only)
export const activateRoom = createAsyncThunk(
  "rooms/activateRoom",
  async (id, { rejectWithValue }) => {
    try {
      const res = await axios.put(`${BASE}/activateroom/${id}`, {}, authHeader());
      return res.data; // { success, room }
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to activate room.");
    }
  }
);

// ─────────────────────────────────────────────────────────────────────────────
// INITIAL STATE
// ─────────────────────────────────────────────────────────────────────────────

const initialState = {
  rooms: [],
  total: 0,
  loading: false,
  error: null,

  singleRoom: null,
  singleLoading: false,
  singleError: null,

  createLoading: false,
  createError: null,

  updateLoading: false,
  updateError: null,

  statusLoading: false,
  statusError: null,

  deleteLoading: false,
  deleteError: null,

  // id of the room currently being deactivated; null when idle
  deactivateLoading: null,
  deactivateError: null,

  // id of the room currently being activated; null when idle
  activateLoading: null,
  activateError: null,

  availableRooms: null,
  availLoading: false,
  availError: null,
};

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS
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
    clearSingleRoom: (state) => {
      state.singleRoom  = null;
      state.singleError = null;
    },
    clearFormErrors: (state) => {
      state.createError = null;
      state.updateError = null;
    },
    clearAvailability: (state) => {
      state.availableRooms = null;
      state.availError     = null;
    },
    clearDeleteError: (state) => {
      state.deleteError = null;
    },
    clearActionErrors: (state) => {
      state.deactivateError = null;
      state.activateError   = null;
    },
  },
  extraReducers: (builder) => {
    builder

      // ── 1. Fetch all rooms ───────────────────────────────────────────────
      .addCase(fetchAllRooms.pending, (state) => {
        state.loading = true;
        state.error   = null;
      })
      .addCase(fetchAllRooms.fulfilled, (state, action) => {
        state.loading = false;
        state.rooms   = action.payload.rooms;
        state.total   = action.payload.total;
      })
      .addCase(fetchAllRooms.rejected, (state, action) => {
        state.loading = false;
        state.error   = action.payload;
      })

      // ── 1b. Fetch public rooms (housekeeping / receptionist) ─────────────
      .addCase(fetchPublicRooms.pending, (state) => {
        state.loading = true;
        state.error   = null;
      })
      .addCase(fetchPublicRooms.fulfilled, (state, action) => {
        state.loading = false;
        state.rooms   = action.payload.rooms;
        state.total   = action.payload.total;
      })
      .addCase(fetchPublicRooms.rejected, (state, action) => {
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
        state.rooms = replaceRoom(state.rooms, action.payload.room);
      })
      .addCase(updateRoomStatus.rejected, (state, action) => {
        state.statusLoading = false;
        state.statusError   = action.payload;
      })

      // ── 6. Check availability ────────────────────────────────────────────
      .addCase(fetchAvailableRooms.pending, (state) => {
        state.availLoading   = true;
        state.availError     = null;
        state.availableRooms = null;
      })
      .addCase(fetchAvailableRooms.fulfilled, (state, action) => {
        state.availLoading   = false;
        state.availableRooms = action.payload.rooms;
      })
      .addCase(fetchAvailableRooms.rejected, (state, action) => {
        state.availLoading = false;
        state.availError   = action.payload;
      })

      // ── 7. Delete room ───────────────────────────────────────────────────
      .addCase(deleteRoom.pending, (state) => {
        state.deleteLoading = true;
        state.deleteError   = null;
      })
      .addCase(deleteRoom.fulfilled, (state, action) => {
        state.deleteLoading = false;
        state.rooms = state.rooms.filter((r) => r._id !== action.payload);
        state.total -= 1;
      })
      .addCase(deleteRoom.rejected, (state, action) => {
        state.deleteLoading = false;
        state.deleteError   = action.payload;
      })

      // ── 8. Deactivate room ───────────────────────────────────────────────
      .addCase(deactivateRoom.pending, (state, action) => {
        state.deactivateLoading = action.meta.arg; // store the room id
        state.deactivateError   = null;
      })
      .addCase(deactivateRoom.fulfilled, (state, action) => {
        state.deactivateLoading = null;
        state.rooms = replaceRoom(state.rooms, action.payload.room);
      })
      .addCase(deactivateRoom.rejected, (state, action) => {
        state.deactivateLoading = null;
        state.deactivateError   = action.payload;
      })

      // ── 9. Activate room ─────────────────────────────────────────────────
      .addCase(activateRoom.pending, (state, action) => {
        state.activateLoading = action.meta.arg; // store the room id
        state.activateError   = null;
      })
      .addCase(activateRoom.fulfilled, (state, action) => {
        state.activateLoading = null;
        state.rooms = replaceRoom(state.rooms, action.payload.room);
      })
      .addCase(activateRoom.rejected, (state, action) => {
        state.activateLoading = null;
        state.activateError   = action.payload;
      });
  },
});

export const {
  clearSingleRoom,
  clearFormErrors,
  clearAvailability,
  clearDeleteError,
  clearActionErrors,
} = roomSlice.actions;
export default roomSlice.reducer;
