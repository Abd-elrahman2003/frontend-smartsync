import { createSlice } from "@reduxjs/toolkit";
import { adjustApi } from "./adjustApi";

const initialState = {
  adjusts: [],
  selectedAdjust: null,
  status: "idle", // 'idle' | 'loading' | 'succeeded' | 'failed'
  error: null,
  totalOrders: 0,
  totalPages: 0,
  currentPage: 1,
  filters: {
    id: "",
    storeId: "",
  },
};

const adjustsSlice = createSlice({
  name: "adjust",
  initialState,
  reducers: {
    setSelectedAdjust: (state, action) => {
      state.selectedAdjust = action.payload;
    },
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    resetFilters: (state) => {
      state.filters = {
        id: "",
        storeId: "",
      };
    },
    setCurrentPage: (state, action) => {
      state.currentPage = action.payload;
    },
  },
  extraReducers: (builder) => {
    // Handle get adjusts query results
    builder.addMatcher(
      adjustApi.endpoints.getAdjusts.matchFulfilled,
      (state, { payload }) => {
        state.status = "succeeded";
        state.adjusts = payload.orders || [];
        state.totalOrders = payload.totalOrders || 0;
        state.totalPages = payload.totalPages || 1;
        state.currentPage = payload.currentPage || 1;
        state.error = null;
      }
    );
    
    builder.addMatcher(
      adjustApi.endpoints.getAdjusts.matchPending,
      (state) => {
        state.status = "loading";
      }
    );
    
    builder.addMatcher(
      adjustApi.endpoints.getAdjusts.matchRejected,
      (state, { error }) => {
        state.status = "failed";
        state.error = error.message;
      }
    );
    
    // Reset selected item after mutations
    const resetSelectedAfterMutation = (state) => {
      state.selectedAdjust = null;
    };
    
    // Apply reset to all mutation success cases
    [
      'createAdjust',
      'updateAdjust',
      'deleteAdjust',
      'togglePostAdjust'
    ].forEach(endpoint => {
      builder.addMatcher(
        adjustApi.endpoints[endpoint].matchFulfilled,
        resetSelectedAfterMutation
      );
    });
  },
});

export const {
  setSelectedAdjust,
  setFilters,
  resetFilters,
  setCurrentPage,
} = adjustsSlice.actions;

export default adjustsSlice.reducer;

// Selectors
export const selectAllAdjusts = (state) => state.adjust.adjusts;
export const selectAdjustById = (state, adjustId) => 
  state.adjust.adjusts.find(adjust => adjust.id === adjustId);
export const selectSelectedAdjust = (state) => state.adjust.selectedAdjust;
export const selectAdjustStatus = (state) => state.adjust.status;
export const selectAdjustError = (state) => state.adjust.error;
export const selectAdjustTotalOrders = (state) => state.adjust.totalOrders;
export const selectAdjustTotalPages = (state) => state.adjust.totalPages;
export const selectAdjustCurrentPage = (state) => state.adjust.currentPage;
export const selectAdjustFilters = (state) => state.adjust.filters;