import { configureStore } from '@reduxjs/toolkit';
import { authApi } from '../Featuress/auth/authApi';
import { screensApi } from '../Featuress/screens/screensApi';
import { usersApi } from '../Featuress/users/usersApi';
import { permissionsApi } from '../Featuress/permissions/permissionsApi';
import { rolesApi } from '../Featuress/Roles/rolesApi';
import { categoriesApi } from '../Featuress/categories/categoriesApi';
import { storeApi } from '../Featuress/Store/storeApi';

import authReducer from '../Featuress/auth/authSlice';
import screensReducer from '../Featuress/screens/screensSlice';
import usersReducer from '../Featuress/users/usersSlice';
import permissionsReducer from '../Featuress/permissions/permissionsSlice';
import rolesReducer from '../Featuress/Roles/rolesSlice';
import categoriesReducer from '../Featuress/categories/categoriesSlice';
import storeReducer from '../Featuress/Store/storeSlice';

export const store = configureStore({
  reducer: {
    // API reducers
    [authApi.reducerPath]: authApi.reducer,
    [screensApi.reducerPath]: screensApi.reducer,
    [usersApi.reducerPath]: usersApi.reducer,
    [permissionsApi.reducerPath]: permissionsApi.reducer,
    [rolesApi.reducerPath]: rolesApi.reducer,
    [categoriesApi.reducerPath]: categoriesApi.reducer,
    [storeApi.reducerPath]: storeApi.reducer,

    // Slice reducers
    auth: authReducer,
    screens: screensReducer,
    users: usersReducer,
    permissions: permissionsReducer,
    roles: rolesReducer,
    categories: categoriesReducer,
    store: storeReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(
      authApi.middleware,
      screensApi.middleware,
      usersApi.middleware,
      permissionsApi.middleware,
      rolesApi.middleware,
      categoriesApi.middleware,
      storeApi.middleware,
    ),
});

export default store;
