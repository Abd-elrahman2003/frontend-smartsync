import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  products: [],
  selectedProduct: null, 
};

const productsSlice = createSlice({
  name: 'products',
  initialState, 
  reducers: {
    setProducts: (state, action) => {
      state.products = action.payload;
    },
    selectProduct: (state, action) => {
      state.selectedProduct = action.payload;
    },
    clearSelectedProduct: (state) => {
      state.selectedProduct = null;
    },
  },
});

export const { setProducts, selectProduct, clearSelectedProduct } = productsSlice.actions;

export default productsSlice.reducer;