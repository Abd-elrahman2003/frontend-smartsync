import { configureStore } from '@reduxjs/toolkit';
import { authApi } from '../Featuress/auth/authApi';
import authReducer from '../Featuress/auth/authSlice'; 

export const store = configureStore({
  reducer: {
    [authApi.reducerPath]: authApi.reducer, // RTK Query API Reducer
    auth: authReducer, // Auth slice reducer
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(authApi.middleware), // Middleware for RTK Query
});

export default store;
