import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const adjustApi = createApi({
  reducerPath: "adjustApi",
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
  tagTypes: ["Adjust"],
  endpoints: (builder) => ({
    // Get adjust orders with filters
    getAdjusts: builder.query({
      query: ({ page = 1, id, storeId }) => {
        let url = `/adjust/${page}`;
        const params = new URLSearchParams();
        
        if (id) params.append("id", id);
        if (storeId) params.append("storeId", storeId);
        
        const queryString = params.toString();
        if (queryString) {
          url += `?${queryString}`;
        }
        
        return url;
      },
      providesTags: ["Adjust"],
    }),
    
    // Create adjust order
    createAdjust: builder.mutation({
      query: (adjustData) => ({
        url: "/adjust/create",
        method: "POST",
        body: adjustData,
      }),
      invalidatesTags: ["Adjust"],
    }),
    
    // Update adjust order
    updateAdjust: builder.mutation({
      query: ({ headerId, ...adjustData }) => ({
        url: `/adjust/update/${headerId}`,
        method: "PUT",
        body: adjustData,
      }),
      invalidatesTags: ["Adjust"],
    }),
    
    // Delete adjust order
    deleteAdjust: builder.mutation({
      query: (headerId) => ({
        url: `/adjust/delete/${headerId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Adjust"],
    }),
    
    // Toggle post status of adjust order
    togglePostAdjust: builder.mutation({
      query: (headerId) => ({
        url: `/adjust/post/${headerId}`,
        method: "PATCH",
      }),
      invalidatesTags: ["Adjust"],
    }),
  }),
});

export const {
  useGetAdjustsQuery,
  useCreateAdjustMutation,
  useUpdateAdjustMutation,
  useDeleteAdjustMutation,
  useTogglePostAdjustMutation,
} = adjustApi;