import { createSlice } from "@reduxjs/toolkit";
import { purchasingApi } from "./purchasingApi";

const initialState = {
  purchases: [],
  returnPurchases: [],
  selectedPurchase: null,
  selectedReturnPurchase: null,
  status: "idle", // 'idle' | 'loading' | 'succeeded' | 'failed'
  error: null,
  totalPages: 0,
  currentPage: 1,
  filters: {
    id: "",
    storeId: "",
    supplierId: "",
    receiveId: "",
  },
};

const purchasingSlice = createSlice({
  name: "purchasing",
  initialState,
  reducers: {
    setSelectedPurchase: (state, action) => {
      state.selectedPurchase = action.payload;
    },
    setSelectedReturnPurchase: (state, action) => {
      state.selectedReturnPurchase = action.payload;
    },
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    resetFilters: (state) => {
      state.filters = {
        id: "",
        storeId: "",
        supplierId: "",
        receiveId: "",
      };
    },
    setCurrentPage: (state, action) => {
      state.currentPage = action.payload;
    },
  },
  extraReducers: (builder) => {
    // Handle purchase query results
    builder.addMatcher(
      purchasingApi.endpoints.getPurchases.matchFulfilled,
      (state, { payload }) => {
        state.status = "succeeded";
        state.purchases = payload.purchases || [];
        state.totalPages = payload.totalPages || 1;
        state.error = null;
      }
    );
    
    builder.addMatcher(
      purchasingApi.endpoints.getPurchases.matchPending,
      (state) => {
        state.status = "loading";
      }
    );
    
    builder.addMatcher(
      purchasingApi.endpoints.getPurchases.matchRejected,
      (state, { error }) => {
        state.status = "failed";
        state.error = error.message;
      }
    );
    
    // Handle return purchase query results
    builder.addMatcher(
      purchasingApi.endpoints.getReturnPurchases.matchFulfilled,
      (state, { payload }) => {
        state.status = "succeeded";
        state.returnPurchases = payload.returnPurchases || [];
        state.totalPages = payload.totalPages || 1;
        state.error = null;
      }
    );
    
    builder.addMatcher(
      purchasingApi.endpoints.getReturnPurchases.matchPending,
      (state) => {
        state.status = "loading";
      }
    );
    
    builder.addMatcher(
      purchasingApi.endpoints.getReturnPurchases.matchRejected,
      (state, { error }) => {
        state.status = "failed";
        state.error = error.message;
      }
    );
    
    // Reset selected item after mutations
    const resetSelectedAfterMutation = (state) => {
      state.selectedPurchase = null;
      state.selectedReturnPurchase = null;
    };
    
    // Apply reset to all mutation success cases
    [
      'createPurchase',
      'updatePurchase',
      'deletePurchase',
      'togglePostPurchase',
      'createReturnPurchase',
      'updateReturnPurchase',
      'deleteReturnPurchase',
      'togglePostReturnPurchase'
    ].forEach(endpoint => {
      builder.addMatcher(
        purchasingApi.endpoints[endpoint].matchFulfilled,
        resetSelectedAfterMutation
      );
    });
  },
});

export const {
  setSelectedPurchase,
  setSelectedReturnPurchase,
  setFilters,
  resetFilters,
  setCurrentPage,
} = purchasingSlice.actions;

export default purchasingSlice.reducer;

// Selectors
export const selectAllPurchases = (state) => state.purchasing.purchases;
export const selectReturnPurchases = (state) => state.purchasing.returnPurchases;
export const selectPurchaseById = (state, purchaseId) => 
  state.purchasing.purchases.find(purchase => purchase.id === purchaseId);
export const selectReturnPurchaseById = (state, returnPurchaseId) => 
  state.purchasing.returnPurchases.find(returnPurchase => returnPurchase.id === returnPurchaseId);
export const selectPurchaseStatus = (state) => state.purchasing.status;
export const selectPurchaseError = (state) => state.purchasing.error;
export const selectPurchaseTotalPages = (state) => state.purchasing.totalPages;
export const selectPurchaseCurrentPage = (state) => state.purchasing.currentPage;
export const selectPurchaseFilters = (state) => state.purchasing.filters;