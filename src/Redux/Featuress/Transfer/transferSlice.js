import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  currentTransfer: null,
  transferFilters: {
    id: null,
    storeFromId: null,
    storeToId: null,
    page: 1,
  },
  selectedItems: [],
  error: null,
};

const transferSlice = createSlice({
  name: 'transfer',
  initialState,
  reducers: {
    // Set current transfer being worked on
    setCurrentTransfer: (state, action) => {
      state.currentTransfer = action.payload;
    },

    // Clear current transfer
    clearCurrentTransfer: (state) => {
      state.currentTransfer = null;
    },

    // Update transfer filters
    setTransferFilters: (state, action) => {
      state.transferFilters = {
        ...state.transferFilters,
        ...action.payload,
      };
    },

    // Reset filters to initial state
    resetTransferFilters: (state) => {
      state.transferFilters = initialState.transferFilters;
    },

    // Add item to selected items
    addSelectedItem: (state, action) => {
      const item = action.payload;
      const existingItem = state.selectedItems.find(i => i.productId === item.productId);
      
      if (existingItem) {
        state.selectedItems = state.selectedItems.map(i =>
          i.productId === item.productId ? { ...i, quantity: item.quantity } : i
        );
      } else {
        state.selectedItems.push(item);
      }
    },

    // Remove item from selected items
    removeSelectedItem: (state, action) => {
      state.selectedItems = state.selectedItems.filter(
        item => item.productId !== action.payload
      );
    },

    // Clear all selected items
    clearSelectedItems: (state) => {
      state.selectedItems = [];
    },

    // Set error state
    setError: (state, action) => {
      state.error = action.payload;
    },

    // Clear error state
    clearError: (state) => {
      state.error = null;
    },
  },
});

export const {
  setCurrentTransfer,
  clearCurrentTransfer,
  setTransferFilters,
  resetTransferFilters,
  addSelectedItem,
  removeSelectedItem,
  clearSelectedItems,
  setError,
  clearError,
} = transferSlice.actions;

// Selectors
export const selectCurrentTransfer = (state) => state.transfer.currentTransfer;
export const selectTransferFilters = (state) => state.transfer.transferFilters;
export const selectSelectedItems = (state) => state.transfer.selectedItems;
export const selectTransferError = (state) => state.transfer.error;

export default transferSlice.reducer;