import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  selectedScreen: null,
  filters: {
    search: '',
    type: 'all',
  },
};

const screensSlice = createSlice({
  name: 'screens',
  initialState,
  reducers: {
    setSelectedScreen: (state, action) => {
      state.selectedScreen = action.payload;
    },
    clearSelectedScreen: (state) => {
      state.selectedScreen = null;
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
  setSelectedScreen,
  clearSelectedScreen,
  setFilters,
  clearFilters,
} = screensSlice.actions;

export default screensSlice.reducer;