import { configureStore } from '@reduxjs/toolkit';
import { authApi } from '../Featuress/auth/authApi';
import { screensApi } from '../Featuress/screens/screensApi';
import { usersApi } from '../Featuress/users/usersApi';
import authReducer from '../Featuress/auth/authSlice';
import screensReducer from '../Featuress/screens/screensSlice';
import locationReducer from '../Featuress/locations/locationSlice';
import usersReducer from '../Featuress/users/usersSlice';
import permissionsReducer from '../Featuress/permissions/permissionsSlice';
import { permissionsApi } from '../Featuress/permissions/permissionsApi';
import rolesReducer from '../Featuress/Roles/rolesSlice'
import { rolesApi } from '../Featuress/Roles/rolesApi';
import { locationsApi } from '../Featuress/locations/locationApis';

export const store = configureStore({
  reducer: {
    [authApi.reducerPath]: authApi.reducer,
    [screensApi.reducerPath]: screensApi.reducer,
    [usersApi.reducerPath]: usersApi.reducer,
    [permissionsApi.reducerPath]: permissionsApi.reducer,
    [rolesApi.reducerPath]:rolesApi.reducer,
    [locationsApi.reducerPath]:locationsApi.reducer,
    auth: authReducer,
    screens: screensReducer,
    users: usersReducer,
    permissions: permissionsReducer,
    roles:rolesReducer,
    locations:locationReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(
      authApi.middleware,
      screensApi.middleware,
      usersApi.middleware,
      permissionsApi.middleware,
      rolesApi.middleware,
      locationsApi.middleware,
    ),
});

export default store;