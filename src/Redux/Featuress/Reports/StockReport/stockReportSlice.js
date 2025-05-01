import { createSlice } from "@reduxjs/toolkit";
import { stockReportApi } from "./stockReportApi";

const initialState = {
  stockReport: [],
  status: "idle", // 'idle' | 'loading' | 'succeeded' | 'failed'
  error: null,
  totalItems: 0,
  totalPages: 0,
  currentPage: 1,
  filters: {
    storeName: "",
    categoryName: "",
    itemName: "",
  },
};

const stockReportSlice = createSlice({
  name: "stockReport",
  initialState,
  reducers: {
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    resetFilters: (state) => {
      state.filters = {
        storeName: "",
        categoryName: "",
        itemName: "",
      };
    },
    setCurrentPage: (state, action) => {
      state.currentPage = action.payload;
    },
  },
  extraReducers: (builder) => {
    // Handle stock report query results
    builder.addMatcher(
      stockReportApi.endpoints.getStockReport.matchFulfilled,
      (state, { payload }) => {
        state.status = "succeeded";
        state.stockReport = payload.data || [];
        state.totalItems = payload.totalItems || 0;
        state.totalPages = payload.totalPages || 1;
        state.currentPage = payload.currentPage || 1;
        state.error = null;
      }
    );
    
    builder.addMatcher(
      stockReportApi.endpoints.getStockReport.matchPending,
      (state) => {
        state.status = "loading";
      }
    );
    
    builder.addMatcher(
      stockReportApi.endpoints.getStockReport.matchRejected,
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
} = stockReportSlice.actions;

export default stockReportSlice.reducer;

// Selectors
export const selectStockReport = (state) => state.stockReport.stockReport;
export const selectStockReportStatus = (state) => state.stockReport.status;
export const selectStockReportError = (state) => state.stockReport.error;
export const selectStockReportTotalItems = (state) => state.stockReport.totalItems;
export const selectStockReportTotalPages = (state) => state.stockReport.totalPages;
export const selectStockReportCurrentPage = (state) => state.stockReport.currentPage;
export const selectStockReportFilters = (state) => state.stockReport.filters;