// categoriesSlice.js
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  selectedCategory: null,
  filters: {
    search: '',
    name: '',
  },
};

const categoriesSlice = createSlice({
  name: 'categories',
  initialState,
  reducers: {
    setSelectedCategory: (state, action) => {
      state.selectedCategory = action.payload;
    },
    clearSelectedCategory: (state) => {
      state.selectedCategory = null;
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
  setSelectedCategory,
  clearSelectedCategory,
  setFilters,
  clearFilters,
} = categoriesSlice.actions;

export default categoriesSlice.reducer;