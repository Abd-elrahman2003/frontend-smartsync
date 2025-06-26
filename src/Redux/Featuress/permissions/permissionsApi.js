import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { toast } from 'react-toastify';

const baseQuery = fetchBaseQuery({
  baseUrl: 'http://13.60.89.143:4500/api/v1',
  prepareHeaders: (headers) => {
    const token = localStorage.getItem('token');
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }
    return headers;
  },
});

const baseQueryWithErrorHandling = async (args, api, extraOptions) => {
  const result = await baseQuery(args, api, extraOptions);
  if (result.error) {
    toast.error(result.error.data?.message || 'An error occurred');
  }
  return result;
};

export const permissionsApi = createApi({
  reducerPath: 'permissionsApi',
  baseQuery: baseQueryWithErrorHandling,
  tagTypes: ['Permissions'],

  endpoints: (builder) => ({
    getFormattedScreens: builder.query({
      query: (userId) => userId ? `/screens/formatted/${userId}` : '',
      providesTags: ['Permissions'],
    }),

    getUserScreens: builder.query({
      query: () => '/screens',
      providesTags: ['Permissions'],
    }),

    getScreenAccess: builder.query({
      query: (route) => `/screens/access/${route}`,
      providesTags: ['Permissions'],
    }),

    assignPermissions: builder.mutation({
      query: (data) => ({
        url: `/permissions/assign`,
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Permissions'],
      async onQueryStarted(data, { queryFulfilled }) {
        try {
          await queryFulfilled;
          toast.success('Permissions assigned successfully!');
        } catch (error) {
          toast.error(error?.data?.message || 'Error assigning permissions.');
        }
      },
    }),
  }),
});

export const {
  useGetFormattedScreensQuery,
  useGetUserScreensQuery,
  useGetScreenAccessQuery,
  useAssignPermissionsMutation,
} = permissionsApi;