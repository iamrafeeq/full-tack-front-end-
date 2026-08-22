import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import api from "../../../api/axios";

const authHeader = () => ({
  headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
});

// ── Fetch all users ────────────────────────────────────────────────────────────
export const guestUserAPI = createAsyncThunk(
  "guestUser/guestUserAPI",
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get("/api/guestuser", authHeader());
      return res.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Network error — is the server running?");
    }
  }
);

// ── Activate / Deactivate a user ───────────────────────────────────────────────
export const updateUserStatus = createAsyncThunk(
  "guestUser/updateUserStatus",
  async ({ id, isActive }, { rejectWithValue }) => {
    try {
      const res = await api.put(
        `/api/updateuserstatus/${id}`,
        { isActive },
        authHeader()
      );
      return res.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Network error — is the server running?");
    }
  }
);

// ── Change a user's role ───────────────────────────────────────────────────────
export const updateUserRole = createAsyncThunk(
  "guestUser/updateUserRole",
  async ({ id, role }, { rejectWithValue }) => {
    try {
      const res = await api.put(
        `/api/updateuserrole/${id}`,
        { role },
        authHeader()
      );
      return res.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Network error — is the server running?");
    }
  }
);

// ── Helper — replace one user in the users array ──────────────────────────────
const replaceUser = (state, updatedUser) => {
  if (!state.data?.users) return;
  state.data.users = state.data.users.map((u) =>
    u._id === updatedUser._id ? updatedUser : u
  );
};

const initialState = {
  loading: false,
  data: [],
  error: null,

  statusLoading: false,
  statusError: null,

  roleLoading: false,
  roleError: null,
};

const guestUserSlice = createSlice({
  name: "guestUserSlice",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // ── Fetch all ────────────────────────────────────────────────────────────
      .addCase(guestUserAPI.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(guestUserAPI.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
        state.error = null;
      })
      .addCase(guestUserAPI.rejected, (state, action) => {
        state.loading = false;
        state.data = [];
        state.error = action.payload;
      })

      // ── Update status (activate / deactivate) ────────────────────────────────
      .addCase(updateUserStatus.pending, (state) => {
        state.statusLoading = true;
        state.statusError = null;
      })
      .addCase(updateUserStatus.fulfilled, (state, action) => {
        state.statusLoading = false;
        replaceUser(state, action.payload.user);
      })
      .addCase(updateUserStatus.rejected, (state, action) => {
        state.statusLoading = false;
        state.statusError = action.payload;
      })

      // ── Update role ──────────────────────────────────────────────────────────
      .addCase(updateUserRole.pending, (state) => {
        state.roleLoading = true;
        state.roleError = null;
      })
      .addCase(updateUserRole.fulfilled, (state, action) => {
        state.roleLoading = false;
        replaceUser(state, action.payload.user);
      })
      .addCase(updateUserRole.rejected, (state, action) => {
        state.roleLoading = false;
        state.roleError = action.payload;
      });
  },
});

export default guestUserSlice.reducer;
