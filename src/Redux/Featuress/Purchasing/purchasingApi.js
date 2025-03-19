import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const purchasingApi = createApi({
  reducerPath: "purchasingApi",
  baseQuery: fetchBaseQuery({
    baseUrl: "http://localhost:3000/api/v1",
    prepareHeaders: (headers, { getState }) => {
      const token = getState().auth.token;
      if (token) {
        headers.set("authorization", `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ["Purchase", "ReturnPurchase"],
  endpoints: (builder) => ({
    // Purchase endpoints
    getPurchases: builder.query({
      query: ({ page = 1, id, storeId, supplierId, dateFrom, dateTo, productId, isPosted }) => {
        let url = `/purchase/${page}`;
        const params = new URLSearchParams();
        
        if (id) params.append("id", id);
        if (storeId) params.append("storeId", storeId);
        if (supplierId) params.append("supplierId", supplierId);
        if (dateFrom) params.append("dateFrom", dateFrom);
        if (dateTo) params.append("dateTo", dateTo);
        if (productId) params.append("productId", productId);
        if (isPosted !== "") params.append("isPosted", isPosted);
        
        const queryString = params.toString();
        if (queryString) {
          url += `?${queryString}`;
        }
        
        return url;
      },
      providesTags: ["Purchase"],
    }),
    
    createPurchase: builder.mutation({
      query: (purchaseData) => ({
        url: "/purchase/create",
        method: "POST",
        body: purchaseData,
      }),
      invalidatesTags: ["Purchase"],
    }),
    
    updatePurchase: builder.mutation({
      query: ({ headerId, ...purchaseData }) => ({
        url: `/purchase/update/${headerId}`,
        method: "PUT",
        body: purchaseData,
      }),
      invalidatesTags: ["Purchase"],
    }),
    
    deletePurchase: builder.mutation({
      query: (headerId) => ({
        url: `/purchase/delete/${headerId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Purchase"],
    }),
    
    togglePostPurchase: builder.mutation({
      query: (headerId) => ({
        url: `/purchase/post/${headerId}`,
        method: "PATCH",
      }),
      invalidatesTags: ["Purchase"],
    }),
    
    // Return Purchase endpoints
    getReturnPurchases: builder.query({
      query: ({ page = 1, id, receiveId, storeId, supplierId }) => {
        let url = `/purchase/return/${page}`;
        const params = new URLSearchParams();
        
        if (id) params.append("id", id);
        if (receiveId) params.append("receiveId", receiveId);
        if (storeId) params.append("storeId", storeId);
        if (supplierId) params.append("supplierId", supplierId);
        
        const queryString = params.toString();
        if (queryString) {
          url += `?${queryString}`;
        }
        
        return url;
      },
      providesTags: ["ReturnPurchase"],
    }),
    
    createReturnPurchase: builder.mutation({
      query: (returnPurchaseData) => ({
        url: "/purchase/return/create",
        method: "POST",
        body: returnPurchaseData,
      }),
      invalidatesTags: ["ReturnPurchase", "Purchase"],
    }),
    
    updateReturnPurchase: builder.mutation({
      query: ({ headerId, ...returnPurchaseData }) => ({
        url: `/purchase/return/update/${headerId}`,
        method: "PUT",
        body: returnPurchaseData,
      }),
      invalidatesTags: ["ReturnPurchase", "Purchase"],
    }),
    
    deleteReturnPurchase: builder.mutation({
      query: (headerId) => ({
        url: `/purchase/return/delete/${headerId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["ReturnPurchase", "Purchase"],
    }),
    
    togglePostReturnPurchase: builder.mutation({
      query: (headerId) => ({
        url: `/purchase/return/post/${headerId}`,
        method: "PATCH",
      }),
      invalidatesTags: ["ReturnPurchase", "Purchase"],
    }),
  }),
});

export const {
  // Hooks for regular purchases
  useGetPurchasesQuery,
  useCreatePurchaseMutation,
  useUpdatePurchaseMutation,
  useDeletePurchaseMutation,
  useTogglePostPurchaseMutation,
  
  // Hooks for return purchases
  useGetReturnPurchasesQuery,
  useCreateReturnPurchaseMutation,
  useUpdateReturnPurchaseMutation,
  useDeleteReturnPurchaseMutation,
  useTogglePostReturnPurchaseMutation,
} = purchasingApi;