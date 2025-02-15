import { configureStore } from '@reduxjs/toolkit';
import { authApi } from '../Featuress/auth/authApi';
import { screensApi } from '../Featuress/screens/screensApi';
import { usersApi } from '../Featuress/users/usersApi';
import { permissionsApi } from '../Featuress/permissions/permissionsApi';
import { rolesApi } from '../Featuress/Roles/rolesApi';
import { productsApi } from '../Featuress/Products/ProductsApi'; // إضافة الـ API الخاص بالمنتجات
import { categoriesApi } from '../Featuress/categories/categoriesApi';

import authReducer from '../Featuress/auth/authSlice';
import screensReducer from '../Featuress/screens/screensSlice';
import usersReducer from '../Featuress/users/usersSlice';
import permissionsReducer from '../Featuress/permissions/permissionsSlice';
import rolesReducer from '../Featuress/Roles/rolesSlice';
import productsReducer from '../Featuress/Products/ProductsSlice'; 
import categoriesReducer from '../Featuress/categories/categoriesSlice';

export const store = configureStore({
  reducer: {
    // API reducers
    [authApi.reducerPath]: authApi.reducer,
    [screensApi.reducerPath]: screensApi.reducer,
    [usersApi.reducerPath]: usersApi.reducer,
    [permissionsApi.reducerPath]: permissionsApi.reducer,
    [rolesApi.reducerPath]: rolesApi.reducer,
    [productsApi.reducerPath]: productsApi.reducer, 

    // Slices
    [categoriesApi.reducerPath]: categoriesApi.reducer,
    
    // Slice reducers
    auth: authReducer,
    screens: screensReducer,
    users: usersReducer,
    permissions: permissionsReducer,
    roles: rolesReducer,
    products: productsReducer, 
    categories: categoriesReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(
      authApi.middleware,
      screensApi.middleware,
      usersApi.middleware,
      permissionsApi.middleware,
      rolesApi.middleware,
      productsApi.middleware ,
      categoriesApi.middleware
    ),
});

export default store;