import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const transferApi = createApi({
  reducerPath: 'transferApi',
  baseQuery: fetchBaseQuery({
    baseUrl: process.env.REACT_APP_API_URL || 'http://localhost:3000/api/v1',
    prepareHeaders: (headers, { getState }) => {
      const token = getState().auth.token;
      if (token) {
        headers.set('authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ['Transfer'],
  endpoints: (builder) => ({
    // Create transfer order
    createTransfer: builder.mutation({
      query: (data) => ({
        url: '/transfer/create',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Transfer'],
    }),

    // Update transfer order
    updateTransfer: builder.mutation({
      query: ({ headerId, ...data }) => ({
        url: `/transfer/update/${headerId}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['Transfer'],
    }),

    // Get transfer orders with pagination and filters
    getTransfers: builder.query({
      query: ({ page = 1, id, storeFromId, storeToId }) => {
        let url = `/transfer/${page}`;
        const params = new URLSearchParams();
        
        if (id) params.append('id', id);
        if (storeFromId) params.append('storeFromId', storeFromId);
        if (storeToId) params.append('storeToId', storeToId);
        
        const queryString = params.toString();
        if (queryString) url += `?${queryString}`;
        
        return url;
      },
      providesTags: ['Transfer'],
    }),

    // Delete transfer order
    deleteTransfer: builder.mutation({
      query: (headerId) => ({
        url: `/transfer/delete/${headerId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Transfer'],
    }),

    // Post/Unpost transfer order
    toggleTransferPost: builder.mutation({
      query: (headerId) => ({
        url: `/transfer/post/${headerId}`,
        method: 'PATCH',
      }),
      invalidatesTags: ['Transfer'],
    }),
  }),
});

export const {
  useCreateTransferMutation,
  useUpdateTransferMutation,
  useGetTransfersQuery,
  useDeleteTransferMutation,
  useToggleTransferPostMutation,
} = transferApi;