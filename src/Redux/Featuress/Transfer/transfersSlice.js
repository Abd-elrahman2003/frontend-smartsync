import { createSlice } from "@reduxjs/toolkit";
import { transfersApi } from "./transfersApi";

const initialState = {
  transfers: [],
  selectedTransfer: null,
  status: "idle", // 'idle' | 'loading' | 'succeeded' | 'failed'
  error: null,
  totalOrders: 0,
  totalPages: 0,
  currentPage: 1,
  filters: {
    id: "",
    storeFromId: "",
    storeToId: "",
  },
};

const transfersSlice = createSlice({
  name: "transfer",
  initialState,
  reducers: {
    setSelectedTransfer: (state, action) => {
      state.selectedTransfer = action.payload;
    },
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    resetFilters: (state) => {
      state.filters = {
        id: "",
        storeFromId: "",
        storeToId: "",
      };
    },
    setCurrentPage: (state, action) => {
      state.currentPage = action.payload;
    },
  },
  extraReducers: (builder) => {
    // Handle get transfers query results
    builder.addMatcher(
      transfersApi.endpoints.getTransfers.matchFulfilled,
      (state, { payload }) => {
        state.status = "succeeded";
        state.transfers = payload.orders || [];
        state.totalOrders = payload.totalOrders || 0;
        state.totalPages = payload.totalPages || 1;
        state.currentPage = payload.currentPage || 1;
        state.error = null;
      }
    );
    
    builder.addMatcher(
      transfersApi.endpoints.getTransfers.matchPending,
      (state) => {
        state.status = "loading";
      }
    );
    
    builder.addMatcher(
      transfersApi.endpoints.getTransfers.matchRejected,
      (state, { error }) => {
        state.status = "failed";
        state.error = error.message;
      }
    );
    
    // Reset selected item after mutations
    const resetSelectedAfterMutation = (state) => {
      state.selectedTransfer = null;
    };
    
    // Apply reset to all mutation success cases
    [
      'createTransfer',
      'updateTransfer',
      'deleteTransfer',
      'togglePostTransfer'
    ].forEach(endpoint => {
      builder.addMatcher(
        transfersApi.endpoints[endpoint].matchFulfilled,
        resetSelectedAfterMutation
      );
    });
  },
});

export const {
  setSelectedTransfer,
  setFilters,
  resetFilters,
  setCurrentPage,
} = transfersSlice.actions;

export default transfersSlice.reducer;

// Selectors
export const selectAllTransfers = (state) => state.transfer.transfers;
export const selectTransferById = (state, transferId) => 
  state.transfer.transfers.find(transfer => transfer.id === transferId);
export const selectSelectedTransfer = (state) => state.transfer.selectedTransfer;
export const selectTransferStatus = (state) => state.transfer.status;
export const selectTransferError = (state) => state.transfer.error;
export const selectTransferTotalOrders = (state) => state.transfer.totalOrders;
export const selectTransferTotalPages = (state) => state.transfer.totalPages;
export const selectTransferCurrentPage = (state) => state.transfer.currentPage;
export const selectTransferFilters = (state) => state.transfer.filters;