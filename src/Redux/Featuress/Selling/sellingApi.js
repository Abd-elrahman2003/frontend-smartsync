import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const sellingApi = createApi({
  reducerPath: "sellingApi",
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
  tagTypes: ["Selling", "ReturnSelling"],
  endpoints: (builder) => ({
    // Selling endpoints
    getSellings: builder.query({
      query: ({ page = 1, id, storeId, customerId , status}) => {
        let url = `/selling/${page}`;
        const params = new URLSearchParams();
        
        if (id) params.append("id", id);
        if (storeId) params.append("storeId", storeId);
        if (customerId) params.append("customerId", customerId);
        if (status) {
          params.append("status", status);
        }
        const queryString = params.toString();
        if (queryString) {
          url += `?${queryString}`;
        }
        
        return url;
      },
      providesTags: ["Selling"],
    }),
    
    createSelling: builder.mutation({
      query: (sellingData) => ({
        url: "/selling/create",
        method: "POST",
        body: sellingData,
      }),
      invalidatesTags: ["Selling"],
    }),
    
    updateSelling: builder.mutation({
      query: ({ headerId, ...sellingData }) => ({
        url: `/selling/update/${headerId}`,
        method: "PUT",
        body: sellingData,
      }),
      invalidatesTags: ["Selling"],
    }),
    
    deleteSelling: builder.mutation({
      query: (headerId) => ({
        url: `/selling/delete/${headerId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Selling"],
    }),
    
    togglePostSelling: builder.mutation({
      query: (headerId) => ({
        url: `/selling/post/${headerId}`,
        method: "PATCH",
      }),
      invalidatesTags: ["Selling"],
    }),
    
    // Return Selling endpoints
    getReturnSellings: builder.query({
      query: ({ page = 1, id, saleId }) => {
        let url = `/selling/return/${page}`;
        const params = new URLSearchParams();
        
        if (id) params.append("id", id);
        if (saleId) params.append("saleId", saleId);
        
        const queryString = params.toString();
        if (queryString) {
          url += `?${queryString}`;
        }
        
        return url;
      },
      providesTags: ["ReturnSelling"],
    }),
    
    createReturnSelling: builder.mutation({
      query: (returnSellingData) => ({
        url: "/selling/return/create",
        method: "POST",
        body: returnSellingData,
      }),
      invalidatesTags: ["ReturnSelling", "Selling"],
    }),
    
    updateReturnSelling: builder.mutation({
      query: ({ headerId, ...returnSellingData }) => ({
        url: `/selling/return/update/${headerId}`,
        method: "PUT",
        body: returnSellingData,
      }),
      invalidatesTags: ["ReturnSelling", "Selling"],
    }),
    
    deleteReturnSelling: builder.mutation({
      query: (headerId) => ({
        url: `/selling/return/delete/${headerId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["ReturnSelling", "Selling"],
    }),
    
    togglePostReturnSelling: builder.mutation({
      query: (headerId) => ({
        url: `/selling/return/post/${headerId}`,
        method: "PATCH",
      }),
      invalidatesTags: ["ReturnSelling", "Selling"],
    }),
  }),
});

export const {
  // Hooks for regular sellings
  useGetSellingsQuery,
  useCreateSellingMutation,
  useUpdateSellingMutation,
  useDeleteSellingMutation,
  useTogglePostSellingMutation,
  
  // Hooks for return sellings
  useGetReturnSellingsQuery,
  useCreateReturnSellingMutation,
  useUpdateReturnSellingMutation,
  useDeleteReturnSellingMutation,
  useTogglePostReturnSellingMutation,
} = sellingApi;