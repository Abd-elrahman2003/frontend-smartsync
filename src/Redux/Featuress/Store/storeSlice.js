import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  selectedStore: null,
  filters: {
    search: '',
    name: '',
    address: '',
    phone: '',
    locationsId: '',
  },
};

const storeSlice = createSlice({
  name: 'stores',
  initialState,
  reducers: {
    setSelectedStore: (state, action) => {
      state.selectedStore = action.payload;
    },
    clearSelectedStore: (state) => {
      state.selectedStore = null;
    },
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearFilters: (state) => {
      state.filters = initialState.filters;
    },
  },
});

export const {
  setSelectedStore,
  clearSelectedStore,
  setFilters,
  clearFilters,
} = storeSlice.actions;

export default storeSlice.reducer;