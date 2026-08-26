import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../../api/axios";

export const forgotPassword = createAsyncThunk(
  "passwordReset/forgot",
  async ({ email }, { rejectWithValue }) => {
    try {
      const res = await api.post("/api/forgot-password", { email });
      return res.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Something went wrong. Please try again."
      );
    }
  }
);

export const resetPassword = createAsyncThunk(
  "passwordReset/reset",
  async ({ token, newPassword }, { rejectWithValue }) => {
    try {
      const res = await api.post("/api/reset-password", { token, newPassword });
      return res.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Reset failed. The link may be invalid or expired."
      );
    }
  }
);

const passwordResetSlice = createSlice({
  name: "passwordReset",
  initialState: {
    forgotLoading: false,
    forgotError:   null,
    forgotSuccess: false,
    resetLoading:  false,
    resetError:    null,
    resetSuccess:  false,
  },
  reducers: {
    clearPasswordReset: (state) => {
      state.forgotLoading = false;
      state.forgotError   = null;
      state.forgotSuccess = false;
      state.resetLoading  = false;
      state.resetError    = null;
      state.resetSuccess  = false;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(forgotPassword.pending, (state) => {
        state.forgotLoading = true;
        state.forgotError   = null;
      })
      .addCase(forgotPassword.fulfilled, (state) => {
        state.forgotLoading = false;
        state.forgotSuccess = true;
      })
      .addCase(forgotPassword.rejected, (state, action) => {
        state.forgotLoading = false;
        state.forgotError   = action.payload;
      })
      .addCase(resetPassword.pending, (state) => {
        state.resetLoading = true;
        state.resetError   = null;
      })
      .addCase(resetPassword.fulfilled, (state) => {
        state.resetLoading  = false;
        state.resetSuccess  = true;
      })
      .addCase(resetPassword.rejected, (state, action) => {
        state.resetLoading = false;
        state.resetError   = action.payload;
      });
  },
});

export const { clearPasswordReset } = passwordResetSlice.actions;
export default passwordResetSlice.reducer;
