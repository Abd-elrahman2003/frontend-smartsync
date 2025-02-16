import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  selectedScreen: null,
  filters: {
    search: '',
    type: 'all',
  },
};

const locationSlice = createSlice({
  name: 'locations',
  initialState,
  reducers: {
    setSelectedLocation: (state, action) => {
      state.selectedScreen = action.payload;
    },
    clearSelectedLocation: (state) => {
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
  setSelectedLocation,
  clearSelectedLocation,
  setFilters,
  clearFilters,
} = locationSlice.actions;

export default locationSlice.reducer;