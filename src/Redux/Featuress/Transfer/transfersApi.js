import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const transfersApi = createApi({
  reducerPath: "transferApi",
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
  tagTypes: ["Transfer"],
  endpoints: (builder) => ({
    // Get transfer orders with filters
    getTransfers: builder.query({
      query: ({ page = 1, id, storeFromId, storeToId }) => {
        let url = `/transfer/${page}`;
        const params = new URLSearchParams();
        
        if (id) params.append("id", id);
        if (storeFromId) params.append("storeFromId", storeFromId);
        if (storeToId) params.append("storeToId", storeToId);
        
        const queryString = params.toString();
        if (queryString) {
          url += `?${queryString}`;
        }
        
        return url;
      },
      providesTags: ["Transfer"],
    }),
    
    // Create transfer order
    createTransfer: builder.mutation({
      query: (transferData) => ({
        url: "/transfer/create",
        method: "POST",
        body: transferData,
      }),
      invalidatesTags: ["Transfer"],
    }),
    
    // Update transfer order
    updateTransfer: builder.mutation({
      query: ({ headerId, ...transferData }) => ({
        url: `/transfer/update/${headerId}`,
        method: "PUT",
        body: transferData,
      }),
      invalidatesTags: ["Transfer"],
    }),
    
    // Delete transfer order
    deleteTransfer: builder.mutation({
      query: (headerId) => ({
        url: `/transfer/delete/${headerId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Transfer"],
    }),
    
    // Toggle post status of transfer order
    togglePostTransfer: builder.mutation({
      query: (headerId) => ({
        url: `/transfer/post/${headerId}`,
        method: "PATCH",
      }),
      invalidatesTags: ["Transfer"],
    }),
  }),
});

export const {
  useGetTransfersQuery,
  useCreateTransferMutation,
  useUpdateTransferMutation,
  useDeleteTransferMutation,
  useTogglePostTransferMutation,
} = transfersApi;