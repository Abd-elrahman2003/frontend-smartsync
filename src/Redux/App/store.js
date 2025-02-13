import { configureStore } from '@reduxjs/toolkit';
import { authApi } from '../Featuress/auth/authApi';
import { screensApi } from '../Featuress/screens/screensApi';
import { usersApi } from '../Featuress/users/usersApi';
import { permissionsApi } from '../Featuress/permissions/permissionsApi';
import { categoriesApi } from '../Featuress/categories/categoriesApi';

import authReducer from '../Featuress/auth/authSlice';
import screensReducer from '../Featuress/screens/screensSlice';
import usersReducer from '../Featuress/users/usersSlice';
import permissionsReducer from '../Featuress/permissions/permissionsSlice';
import categoriesReducer from '../Featuress/categories/categoriesSlice';

export const store = configureStore({
  reducer: {
    [authApi.reducerPath]: authApi.reducer,
    [screensApi.reducerPath]: screensApi.reducer,
    [usersApi.reducerPath]: usersApi.reducer,
    [permissionsApi.reducerPath]: permissionsApi.reducer,
    [categoriesApi.reducerPath]: categoriesApi.reducer,  // Added categoriesApi
    auth: authReducer,
    screens: screensReducer,
    users: usersReducer,
    permissions: permissionsReducer,
    categories: categoriesReducer,  // Added categoriesReducer
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(
      authApi.middleware,
      screensApi.middleware,
      usersApi.middleware,
      permissionsApi.middleware,
      categoriesApi.middleware  // Added categoriesApi middleware
    ),
});

export default store;
