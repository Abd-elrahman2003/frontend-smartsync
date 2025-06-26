import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { toast } from 'react-toastify';

export const screensApi = createApi({
  reducerPath: 'screensApi',
  baseQuery: fetchBaseQuery({
    baseUrl: 'http://13.60.89.143:4500/api/v1/screens',
    prepareHeaders: (headers) => {
      const token = localStorage.getItem('token');
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ['Screen'],
  endpoints: (builder) => ({
    getScreens: builder.query({
      query: () => '/',
      providesTags: ['Screen'],
      async onQueryStarted(_, { queryFulfilled }) {
        try {
          await queryFulfilled;
        } catch (error) {
          toast.error(error?.data?.message || 'Failed to fetch screens');
        }
      },
    }),
    createScreen: builder.mutation({
      query: (screenData) => ({
        url: '/',
        method: 'POST',
        body: screenData,
      }),
      invalidatesTags: ['Screen'],
      async onQueryStarted(_, { queryFulfilled }) {
        try {
          await queryFulfilled;
          toast.success('Screen created successfully');
        } catch (error) {
          toast.error(error?.data?.message || 'Failed to create screen');
        }
      },
    }),
    updateScreen: builder.mutation({
      query: ({ route, ...screenData }) => ({
        url: `${route}`,
        method: 'PUT',
        body: screenData,
      }),
      invalidatesTags: ['Screen'],
      async onQueryStarted(_, { queryFulfilled }) {
        try {
          await queryFulfilled;
          toast.success('Screen updated successfully');
        } catch (error) {
          toast.error(error?.data?.message || 'Failed to update screen');
        }
      },
    }),
    deleteScreen: builder.mutation({
      query: (route) => ({
        url: `${route}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Screen'],
      async onQueryStarted(_, { queryFulfilled }) {
        try {
          await queryFulfilled;
          toast.success('Screen deleted successfully');
        } catch (error) {
          toast.error(error?.data?.message || 'Failed to delete screen');
        }
      },
    }),
  }),
});

export const {
  useGetScreensQuery,
  useCreateScreenMutation,
  useUpdateScreenMutation,
  useDeleteScreenMutation,
} = screensApi;
