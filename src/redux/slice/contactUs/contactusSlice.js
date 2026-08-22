import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import api from "../../../api/axios";

const BASE = "/api/contact";

const authHeader = () => {
  const token = localStorage.getItem("token");
  return token ? { headers: { Authorization: `Bearer ${token}` } } : {};
};

// ─── Thunks ───────────────────────────────────────────────────────────────────

// POST /api/contact  — public, no token required
export const submitContact = createAsyncThunk(
  "contact/submit",
  async ({ name, email, phone, subject, message }, { rejectWithValue }) => {
    try {
      const res = await api.post(BASE, { name, email, phone, subject, message });
      return res.data; // { success, message, contact }
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to send message.");
    }
  }
);

// GET /api/contact  — admin / manager only
export const fetchMessages = createAsyncThunk(
  "contact/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get(BASE, authHeader());
      return res.data; // { success, count, messages }
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to fetch messages.");
    }
  }
);

// DELETE /api/contact/:id  — admin only
export const deleteMessage = createAsyncThunk(
  "contact/delete",
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`${BASE}/${id}`, authHeader());
      return id;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to delete message.");
    }
  }
);

// ─── Slice ────────────────────────────────────────────────────────────────────

const contactSlice = createSlice({
  name: "contact",
  initialState: {
    // Public form submission
    submitLoading: false,
    submitError:   null,
    submitSuccess: false,

    // Admin: list of messages
    messages:     [],
    count:        0,
    fetchLoading: false,
    fetchError:   null,

    // Admin: delete
    deleteLoading: null, // stores the id being deleted
    deleteError:   null,
  },
  reducers: {
    clearSubmitState: (state) => {
      state.submitLoading = false;
      state.submitError   = null;
      state.submitSuccess = false;
    },
    clearDeleteError: (state) => {
      state.deleteError = null;
    },
  },
  extraReducers: (builder) => {
    builder

      // ── Submit contact form ──────────────────────────────────────────────
      .addCase(submitContact.pending, (state) => {
        state.submitLoading = true;
        state.submitError   = null;
        state.submitSuccess = false;
      })
      .addCase(submitContact.fulfilled, (state) => {
        state.submitLoading = false;
        state.submitSuccess = true;
      })
      .addCase(submitContact.rejected, (state, action) => {
        state.submitLoading = false;
        state.submitError   = action.payload;
      })

      // ── Fetch all messages (admin) ───────────────────────────────────────
      .addCase(fetchMessages.pending, (state) => {
        state.fetchLoading = true;
        state.fetchError   = null;
      })
      .addCase(fetchMessages.fulfilled, (state, action) => {
        state.fetchLoading = false;
        state.messages     = action.payload.messages;
        state.count        = action.payload.count;
      })
      .addCase(fetchMessages.rejected, (state, action) => {
        state.fetchLoading = false;
        state.fetchError   = action.payload;
      })

      // ── Delete message (admin) ───────────────────────────────────────────
      .addCase(deleteMessage.pending, (state, action) => {
        state.deleteLoading = action.meta.arg;
        state.deleteError   = null;
      })
      .addCase(deleteMessage.fulfilled, (state, action) => {
        state.deleteLoading = null;
        state.messages      = state.messages.filter((m) => m._id !== action.payload);
        state.count         = Math.max(0, state.count - 1);
      })
      .addCase(deleteMessage.rejected, (state, action) => {
        state.deleteLoading = null;
        state.deleteError   = action.payload;
      });
  },
});

export const { clearSubmitState, clearDeleteError } = contactSlice.actions;
export default contactSlice.reducer;
