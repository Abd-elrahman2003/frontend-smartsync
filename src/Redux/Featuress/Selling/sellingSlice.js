import { createSlice } from "@reduxjs/toolkit";
import { sellingApi } from "./sellingApi";

const initialState = {
  sellings: [],
  returnSellings: [],
  selectedSelling: null,
  selectedReturnSelling: null,
  status: "idle", // 'idle' | 'loading' | 'succeeded' | 'failed'
  error: null,
  totalPages: 0,
  currentPage: 1,
  filters: {
    id: "",
    storeId: "",
    customerId: "",
    saleId: "",
  },
};

const sellingSlice = createSlice({
  name: "selling",
  initialState,
  reducers: {
    setSelectedSelling: (state, action) => {
      state.selectedSelling = action.payload;
    },
    setSelectedReturnSelling: (state, action) => {
      state.selectedReturnSelling = action.payload;
    },
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    resetFilters: (state) => {
      state.filters = {
        id: "",
        storeId: "",
        customerId: "",
        saleId: "",
      };
    },
    setCurrentPage: (state, action) => {
      state.currentPage = action.payload;
    },
  },
  extraReducers: (builder) => {
    // Handle selling query results
    builder.addMatcher(
      sellingApi.endpoints.getSellings.matchFulfilled,
      (state, { payload }) => {
        state.status = "succeeded";
        state.sellings = payload.sellings || [];
        state.totalPages = payload.totalPages || 1;
        state.error = null;
      }
    );
    
    builder.addMatcher(
      sellingApi.endpoints.getSellings.matchPending,
      (state) => {
        state.status = "loading";
      }
    );
    
    builder.addMatcher(
      sellingApi.endpoints.getSellings.matchRejected,
      (state, { error }) => {
        state.status = "failed";
        state.error = error.message;
      }
    );
    
    // Handle return selling query results
    builder.addMatcher(
      sellingApi.endpoints.getReturnSellings.matchFulfilled,
      (state, { payload }) => {
        state.status = "succeeded";
        state.returnSellings = payload.returnSellings || [];
        state.totalPages = payload.totalPages || 1;
        state.error = null;
      }
    );
    
    builder.addMatcher(
      sellingApi.endpoints.getReturnSellings.matchPending,
      (state) => {
        state.status = "loading";
      }
    );
    
    builder.addMatcher(
      sellingApi.endpoints.getReturnSellings.matchRejected,
      (state, { error }) => {
        state.status = "failed";
        state.error = error.message;
      }
    );
    
    // Reset selected item after mutations
    const resetSelectedAfterMutation = (state) => {
      state.selectedSelling = null;
      state.selectedReturnSelling = null;
    };
    
    // Apply reset to all mutation success cases
    [
      'createSelling',
      'updateSelling',
      'deleteSelling',
      'togglePostSelling',
      'createReturnSelling',
      'updateReturnSelling',
      'deleteReturnSelling',
      'togglePostReturnSelling'
    ].forEach(endpoint => {
      builder.addMatcher(
        sellingApi.endpoints[endpoint].matchFulfilled,
        resetSelectedAfterMutation
      );
    });
  },
});

export const {
  setSelectedSelling,
  setSelectedReturnSelling,
  setFilters,
  resetFilters,
  setCurrentPage,
} = sellingSlice.actions;

export default sellingSlice.reducer;

// Selectors
export const selectAllSellings = (state) => state.selling.sellings;
export const selectReturnSellings = (state) => state.selling.returnSellings;
export const selectSellingById = (state, sellingId) => 
  state.selling.sellings.find(selling => selling.id === sellingId);
export const selectReturnSellingById = (state, returnSellingId) => 
  state.selling.returnSellings.find(returnSelling => returnSelling.id === returnSellingId);
export const selectSellingStatus = (state) => state.selling.status;
export const selectSellingError = (state) => state.selling.error;
export const selectSellingTotalPages = (state) => state.selling.totalPages;
export const selectSellingCurrentPage = (state) => state.selling.currentPage;
export const selectSellingFilters = (state) => state.selling.filters;