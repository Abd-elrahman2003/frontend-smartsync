import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { toast } from 'react-toastify';

export const locationsApi = createApi({
  reducerPath: 'locationApis',
  baseQuery: fetchBaseQuery({
    baseUrl: 'http://localhost:3000/api/v1/location',
    prepareHeaders: (headers) => {
      const token = localStorage.getItem('token');
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ['Location'],
  endpoints: (builder) => ({
    getLocation: builder.query({
      query: (params) => {
        let param = `/${params.page}`
        console.log("param")
        console.log(param)
        return param
      },
      providesTags: ['Location'],
      async onQueryStarted(_, { queryFulfilled }) {
        try {
          await queryFulfilled;
        } catch (error) {
          toast.error(error?.data?.message || 'Failed to fetch screens');
        }
      },
    }),
    createLocation: builder.mutation({
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
    updateLocation: builder.mutation({
      query: ({ id, ...screenData }) => ({
        url: `${id}`,
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
    deleteLocation: builder.mutation({
      query: (id) => ({
        url: `${id}`,
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
  useGetLocationQuery,
  useCreateLocationMutation,
  useUpdateLocationMutation,
  useDeleteLocationMutation,
} = locationsApi;
