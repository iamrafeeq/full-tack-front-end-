import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import api from "../../../api/axios";

export const AuthLogin = createAsyncThunk("authentication/AuthLogin", async (userData, { rejectWithValue }) => {
    try {
        const response = await api.post("/api/login", userData);
        return response.data;
    } catch (error) {
        return rejectWithValue(error.response?.data?.message || "Network error — is the server running?");
    }
});

export const getSingleUser = createAsyncThunk("authentication/getSingleUser", async (userId, { rejectWithValue }) => {
    try {
        const token = localStorage.getItem("token");
        const response = await api.get(`/api/singleuser/${userId}`, {
            headers: { Authorization: `Bearer ${token}` },
        });
        return response.data;
    } catch (error) {
        return rejectWithValue(error.response?.data?.message || "Network error — is the server running?");
    }
});

const initialState = {
    loading: false,
    data: [],
    error: null,
    singleUser: null,
    singleUserLoading: false,
    singleUserError: null,
};

const loginSlice = createSlice({
    name: "loginSlice",
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(AuthLogin.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(AuthLogin.fulfilled, (state, action) => {
                state.loading = false;
                state.data = action.payload;
                state.error = null;
            })
            .addCase(AuthLogin.rejected, (state, action) => {
                state.loading = false;
                state.data = [];
                state.error = action.payload;
            })
            .addCase(getSingleUser.pending, (state) => {
                state.singleUserLoading = true;
                state.singleUserError = null;
            })
            .addCase(getSingleUser.fulfilled, (state, action) => {
                state.singleUserLoading = false;
                state.singleUser = action.payload.user;
                state.singleUserError = null;
            })
            .addCase(getSingleUser.rejected, (state, action) => {
                state.singleUserLoading = false;
                state.singleUser = null;
                state.singleUserError = action.payload;
             });
    },
});

export default loginSlice.reducer;
