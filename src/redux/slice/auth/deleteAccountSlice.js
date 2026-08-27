import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../../api/axios";

export const deleteAccount = createAsyncThunk(
  "deleteAccount/delete",
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");
      const res = await api.delete("/api/delete-account", {
        headers: { Authorization: `Bearer ${token}` },
      });
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to delete account. Please try again.");
    }
  }
);

const deleteAccountSlice = createSlice({
  name: "deleteAccount",
  initialState: { loading: false, error: null, success: false },
  reducers: {
    clearDeleteAccount: (state) => {
      state.loading = false;
      state.error   = null;
      state.success = false;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(deleteAccount.pending,   (state) => { state.loading = true;  state.error = null; })
      .addCase(deleteAccount.fulfilled, (state) => { state.loading = false; state.success = true; })
      .addCase(deleteAccount.rejected,  (state, action) => { state.loading = false; state.error = action.payload; });
  },
});

export const { clearDeleteAccount } = deleteAccountSlice.actions;
export default deleteAccountSlice.reducer;
