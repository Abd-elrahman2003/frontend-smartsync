import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  isAuthenticated: !!localStorage.getItem('token'),
  user: (localStorage.getItem('user') && localStorage.getItem('user') !== 'undefined') 
    ? JSON.parse(localStorage.getItem('user')) 
    : null,
  token: localStorage.getItem('token') || null,
};




const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    loginSuccess: (state, action) => {
      state.isAuthenticated = true;
      state.user = action.payload.user;
      state.token = action.payload.token;
    },
    logout: (state) => {
      state.isAuthenticated = false;
      state.token = null; // إزالة التوكن فقط
      localStorage.removeItem('token'); // مسح التوكن فقط
    },
    
    
  },
});

export const { loginSuccess, logout } = authSlice.actions;

export default authSlice.reducer;
