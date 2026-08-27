import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../../api/axios";

export const changePassword = createAsyncThunk(
  "changePassword/change",
  async ({ currentPassword, newPassword }, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");
      const res = await api.put("/api/change-password", { currentPassword, newPassword }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return res.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to change password. Please try again."
      );
    }
  }
);

const changePasswordSlice = createSlice({
  name: "changePassword",
  initialState: {
    loading: false,
    error:   null,
    success: false,
  },
  reducers: {
    clearChangePassword: (state) => {
      state.loading = false;
      state.error   = null;
      state.success = false;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(changePassword.pending, (state) => {
        state.loading = true;
        state.error   = null;
      })
      .addCase(changePassword.fulfilled, (state) => {
        state.loading = false;
        state.success = true;
      })
      .addCase(changePassword.rejected, (state, action) => {
        state.loading = false;
        state.error   = action.payload;
      });
  },
});

export const { clearChangePassword } = changePasswordSlice.actions;
export default changePasswordSlice.reducer;
