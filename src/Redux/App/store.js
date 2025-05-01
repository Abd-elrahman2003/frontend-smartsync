import { configureStore } from '@reduxjs/toolkit';
import { authApi } from '../Featuress/auth/authApi';
import { screensApi } from '../Featuress/screens/screensApi';
import { usersApi } from '../Featuress/users/usersApi';
import { permissionsApi } from '../Featuress/permissions/permissionsApi';
import { productsApi } from '../Featuress/Products/ProductsApi';
import { categoriesApi } from '../Featuress/categories/categoriesApi';
import { storeApi } from '../Featuress/Store/storeApi';
import { purchasingApi } from '../Featuress/Purchasing/purchasingApi';
import { supplierApi } from '../Featuress/Suppliers/supplierApi';
import { transfersApi } from '../Featuress/Transfer/transfersApi';
import { adjustApi } from '../Featuress/Adjust/adjustApi';
import { iotApi } from '../Featuress/Iot/IotApi'; 
import { sellingApi } from '../Featuress/Selling/sellingApi';
import { stockReportApi } from '../Featuress/Reports/StockReport/stockReportApi';
import { purchaseReportApi } from '../Featuress/Reports/PurchaseReport/purchaseReportApi';

import authReducer from '../Featuress/auth/authSlice';
import screensReducer from '../Featuress/screens/screensSlice';
import locationReducer from '../Featuress/locations/locationSlice';
import usersReducer from '../Featuress/users/usersSlice';
import permissionsReducer from '../Featuress/permissions/permissionsSlice';
import { rolesApi } from '../Featuress/Roles/rolesApi';
import { locationsApi } from '../Featuress/locations/locationApis';
import rolesReducer from '../Featuress/Roles/rolesSlice';
import productsReducer from '../Featuress/Products/ProductsSlice';
import categoriesReducer from '../Featuress/categories/categoriesSlice';
import storeReducer from '../Featuress/Store/storeSlice';
import purchasingReducer from '../Featuress/Purchasing/purchasingSlice';
import supplierReducer from '../Featuress/Suppliers/supplierSlice';
import transfersReducer from '../Featuress/Transfer/transfersSlice';
import adjustReducer from '../Featuress/Adjust/adjustSlice';
import iotReducer from '../Featuress/Iot/IotSlice'
import sellingReducer  from '../Featuress/Selling/sellingSlice';
import stockReportReducer from '../Featuress/Reports/StockReport/stockReportSlice';
import purchaseReportReducer from '../Featuress/Reports/PurchaseReport/purchaseReportSlice';


export const store = configureStore({
  reducer: {
    // API reducers
    [authApi.reducerPath]: authApi.reducer,
    [screensApi.reducerPath]: screensApi.reducer,
    [usersApi.reducerPath]: usersApi.reducer,
    [permissionsApi.reducerPath]: permissionsApi.reducer,
    [productsApi.reducerPath]: productsApi.reducer, 
    [purchasingApi.reducerPath]: purchasingApi.reducer,
    [sellingApi.reducerPath]: sellingApi.reducer,
    [supplierApi.reducerPath]: supplierApi.reducer,
    [transfersApi.reducerPath]: transfersApi.reducer,
    [adjustApi.reducerPath]: adjustApi.reducer,
    [stockReportApi.reducerPath]: stockReportApi.reducer,
    [purchaseReportApi.reducerPath]: purchaseReportApi.reducer,

    // Slices
    [rolesApi.reducerPath]:rolesApi.reducer,
    [locationsApi.reducerPath]:locationsApi.reducer,
    [categoriesApi.reducerPath]: categoriesApi.reducer,
    [storeApi.reducerPath]: storeApi.reducer,
    [iotApi.reducerPath]: iotApi.reducer, 

    // Slice reducers
    auth: authReducer,
    screens: screensReducer,
    users: usersReducer,
    permissions: permissionsReducer,
    products: productsReducer,
    roles: rolesReducer,
    locations: locationReducer,
    categories: categoriesReducer,
    store: storeReducer,
    purchasing: purchasingReducer,
    suppliers: supplierReducer,
    transfers: transfersReducer,
    adjust: adjustReducer,
    iot:iotReducer,
    Selling: sellingReducer,
    stockReport: stockReportReducer,
    purchaseReport: purchaseReportReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(
      authApi.middleware,
      screensApi.middleware,
      usersApi.middleware,
      permissionsApi.middleware,
      rolesApi.middleware,
      productsApi.middleware,
      locationsApi.middleware,
      categoriesApi.middleware,
      storeApi.middleware,
      purchasingApi.middleware,
      supplierApi.middleware,
      transfersApi.middleware,
      adjustApi.middleware,
      iotApi.middleware,
      sellingApi.middleware,
      stockReportApi.middleware,
      purchaseReportApi.middleware,
    ),
});

export default store;