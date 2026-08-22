import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import api from "../../../api/axios";

export const AuthRegister = createAsyncThunk("authentication/AuthRegister", async (userData, { rejectWithValue }) => {
    try {
        const responce = await api.post("/api/register", userData);
        return responce.data;
    } catch (error) {
        return rejectWithValue(error.response?.data?.message || "Network error — is the server running?");
    }
});


export const editProfile = createAsyncThunk("updateprofile/editProfile", async ({ userId, formData }, { rejectWithValue }) => {
    try {
        const token = localStorage.getItem("token");
        const editResponce = await api.put(
            `/api/updateuser/${userId}`,
            formData,
            { headers: { Authorization: `Bearer ${token}` } }
        );
        return editResponce.data;
    } catch (error) {
        return rejectWithValue(error.response?.data?.message || "Network error — is the server running?");
    }
});


const initialState = {
    loading: false,
    data: [],
    error: null,
    updateLoading: false,
    updateData: null,
    updateError: null,
};

const AuthSlice = createSlice({
    name: "AuthSlice",
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(AuthRegister.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(AuthRegister.fulfilled, (state, action) => {
                state.loading = false;
                state.data = action.payload;
                state.error = null;
            })
            .addCase(AuthRegister.rejected, (state, action) => {
                state.loading = false;
                state.data = [];
                state.error = action.payload;
            })
            .addCase(editProfile.pending, (state) => {
                state.updateLoading = true;
                state.updateError = null;
            })
            .addCase(editProfile.fulfilled, (state, action) => {
                state.updateLoading = false;
                state.updateData = action.payload.user;
                state.updateError = null;
            })
            .addCase(editProfile.rejected, (state, action) => {
                state.updateLoading = false;
                state.updateData = null;
                state.updateError = action.payload;
            });
    },
});

export default AuthSlice.reducer;
