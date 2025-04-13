import { createSlice } from "@reduxjs/toolkit";
import { purchaseReportApi } from "./purchaseReportApi";

const initialState = {
  purchaseReport: [],
  status: "idle", // 'idle' | 'loading' | 'succeeded' | 'failed'
  error: null,
  totalItems: 0,
  totalPages: 0,
  currentPage: 1,
  filters: {
    code: "",
    name: "",
  },
};

const purchaseReportSlice = createSlice({
  name: "purchaseReport",
  initialState,
  reducers: {
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    resetFilters: (state) => {
      state.filters = {
        code: "",
        name: "",
      };
    },
    setCurrentPage: (state, action) => {
      state.currentPage = action.payload;
    },
  },
  extraReducers: (builder) => {
    // Handle purchase report query results
    builder.addMatcher(
      purchaseReportApi.endpoints.getPurchaseReport.matchFulfilled,
      (state, { payload }) => {
        state.status = "succeeded";
        state.purchaseReport = payload.data || [];
        state.totalItems = payload.totalItems || 0;
        state.totalPages = payload.totalPages || 1;
        state.currentPage = payload.currentPage || 1;
        state.error = null;
      }
    );
    
    builder.addMatcher(
      purchaseReportApi.endpoints.getPurchaseReport.matchPending,
      (state) => {
        state.status = "loading";
      }
    );
    
    builder.addMatcher(
      purchaseReportApi.endpoints.getPurchaseReport.matchRejected,
      (state, { error }) => {
        state.status = "failed";
        state.error = error.message;
      }
    );
  },
});

export const {
  setFilters,
  resetFilters,
  setCurrentPage,
} = purchaseReportSlice.actions;

export default purchaseReportSlice.reducer;

// Selectors
export const selectPurchaseReport = (state) => state.purchaseReport.purchaseReport;
export const selectPurchaseReportStatus = (state) => state.purchaseReport.status;
export const selectPurchaseReportError = (state) => state.purchaseReport.error;
export const selectPurchaseReportTotalItems = (state) => state.purchaseReport.totalItems;
export const selectPurchaseReportTotalPages = (state) => state.purchaseReport.totalPages;
export const selectPurchaseReportCurrentPage = (state) => state.purchaseReport.currentPage;
export const selectPurchaseReportFilters = (state) => state.purchaseReport.filters;