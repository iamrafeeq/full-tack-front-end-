import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import api from "../../../api/axios";

const BASE = "/api/invoices";

const authHeader = () => ({
  headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
});

// ─────────────────────────────────────────────────────────────────────────────
// THUNKS
// ─────────────────────────────────────────────────────────────────────────────

// POST /api/invoices/generate  (admin / manager / receptionist)
// body: { bookingId, extraCharges: [{ description, amount }] }
export const generateInvoice = createAsyncThunk(
  "invoices/generateInvoice",
  async (invoiceData, { rejectWithValue }) => {
    try {
      const res = await api.post(`${BASE}/generate`, invoiceData, authHeader());
      return res.data; // { success, invoice }
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to generate invoice.");
    }
  }
);

// GET /api/invoices/  (users: own only | staff: all)
export const fetchInvoices = createAsyncThunk(
  "invoices/fetchInvoices",
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get(`${BASE}/`, authHeader());
      return res.data; // { success, invoices }
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to fetch invoices.");
    }
  }
);

// GET /api/invoices/:id
export const fetchInvoiceById = createAsyncThunk(
  "invoices/fetchInvoiceById",
  async (id, { rejectWithValue }) => {
    try {
      const res = await api.get(`${BASE}/${id}`, authHeader());
      return res.data; // { success, invoice }
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to fetch invoice.");
    }
  }
);

// PATCH /api/invoices/markpaid/:id  (admin / manager / receptionist)
export const markInvoicePaid = createAsyncThunk(
  "invoices/markInvoicePaid",
  async (id, { rejectWithValue }) => {
    try {
      const res = await api.patch(`${BASE}/markpaid/${id}`, {}, authHeader());
      return res.data; // { success, message, invoice }
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to mark invoice as paid.");
    }
  }
);

// ─────────────────────────────────────────────────────────────────────────────
// SLICE
// ─────────────────────────────────────────────────────────────────────────────

const replaceInvoice = (invoices, updated) =>
  invoices.map((inv) => (inv._id === updated._id ? updated : inv));

const invoiceSlice = createSlice({
  name: "invoices",
  initialState: {
    invoices: [],
    loading: false,
    error: null,

    singleInvoice: null,
    singleLoading: false,
    singleError: null,

    generateLoading: false,
    generateError: null,

    markPaidLoading: false,
    markPaidError: null,
  },
  reducers: {
    clearSingleInvoice: (state) => {
      state.singleInvoice = null;
      state.singleError = null;
    },
    clearInvoiceError: (state) => {
      state.generateError = null;
    },
  },
  extraReducers: (builder) => {
    builder

      // ── Generate invoice ──────────────────────────────────────────────────
      .addCase(generateInvoice.pending, (state) => {
        state.generateLoading = true;
        state.generateError = null;
      })
      .addCase(generateInvoice.fulfilled, (state, action) => {
        state.generateLoading = false;
        state.invoices.unshift(action.payload.invoice);
      })
      .addCase(generateInvoice.rejected, (state, action) => {
        state.generateLoading = false;
        state.generateError = action.payload;
      })

      // ── Fetch all invoices ────────────────────────────────────────────────
      .addCase(fetchInvoices.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchInvoices.fulfilled, (state, action) => {
        state.loading = false;
        state.invoices = action.payload.invoices;
      })
      .addCase(fetchInvoices.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // ── Fetch single invoice ──────────────────────────────────────────────
      .addCase(fetchInvoiceById.pending, (state) => {
        state.singleLoading = true;
        state.singleError = null;
      })
      .addCase(fetchInvoiceById.fulfilled, (state, action) => {
        state.singleLoading = false;
        state.singleInvoice = action.payload.invoice;
      })
      .addCase(fetchInvoiceById.rejected, (state, action) => {
        state.singleLoading = false;
        state.singleError = action.payload;
      })

      // ── Mark paid ─────────────────────────────────────────────────────────
      .addCase(markInvoicePaid.pending, (state) => {
        state.markPaidLoading = true;
        state.markPaidError = null;
      })
      .addCase(markInvoicePaid.fulfilled, (state, action) => {
        state.markPaidLoading = false;
        state.invoices = replaceInvoice(state.invoices, action.payload.invoice);
        if (state.singleInvoice?._id === action.payload.invoice._id) {
          state.singleInvoice = action.payload.invoice;
        }
      })
      .addCase(markInvoicePaid.rejected, (state, action) => {
        state.markPaidLoading = false;
        state.markPaidError = action.payload;
      });
  },
});

export const { clearSingleInvoice, clearInvoiceError } = invoiceSlice.actions;
export default invoiceSlice.reducer;
