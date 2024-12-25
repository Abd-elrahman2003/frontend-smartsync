import { configureStore } from '@reduxjs/toolkit';
import { authApi } from '../Featuress/auth/authApi';
import { screensApi } from '../Featuress/screens/screensApi';
import authReducer from '../Featuress/auth/authSlice';
import screensReducer from '../Featuress/screens/screensSlice';

export const store = configureStore({
  reducer: {
    [authApi.reducerPath]: authApi.reducer,
    [screensApi.reducerPath]: screensApi.reducer,
    auth: authReducer,
    screens: screensReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(authApi.middleware, screensApi.middleware),
});

export default store;