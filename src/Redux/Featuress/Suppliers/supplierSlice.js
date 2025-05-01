// supplierSlice.js
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  selectedSupplier: null,
  filters: {
    search: '',
    fullName: '',
    phone: '',
    email: '',
  },
};

const supplierSlice = createSlice({
  name: 'suppliers',
  initialState,
  reducers: {
    setSelectedSupplier: (state, action) => {
      state.selectedSupplier = action.payload;
    },
    clearSelectedSupplier: (state) => {
      state.selectedSupplier = null;
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
  setSelectedSupplier,
  clearSelectedSupplier,
  setFilters,
  clearFilters,
} = supplierSlice.actions;

export default supplierSlice.reducer;