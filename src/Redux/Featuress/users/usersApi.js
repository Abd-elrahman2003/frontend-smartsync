// usersApi.js
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { toast } from 'react-toastify';

export const usersApi = createApi({
  reducerPath: 'usersApi',
  baseQuery: fetchBaseQuery({ 
    baseUrl: 'http://localhost:3000/api/v1/users',
    prepareHeaders: (headers) => {
      const token = localStorage.getItem('token');
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ['Users'],
  endpoints: (builder) => ({
    getUsers: builder.query({
      query: () => '/',
      providesTags: ['Users'],
      transformResponse: (response) => {
        console.log('API Response:', response);
        return response;
      },
    }),

    createUser: builder.mutation({
      query: (userData) => ({
        url: '/',
        method: 'POST',
        body: userData,
      }),
      invalidatesTags: ['Users'],
      transformResponse: (response) => {
        console.log('Create Response:', response);
        return response;
      },
      async onQueryStarted(_, { queryFulfilled }) {
        try {
          await queryFulfilled;
          // Toast message will be handled in the component
        } catch (error) {
          console.error('Create User Error:', error);
        }
      },
    }),

    updateUser: builder.mutation({
      query: ({ id, ...patch }) => ({
        url: `/${id}`,
        method: 'PUT',
        body: patch,
      }),
      invalidatesTags: ['Users'],
      async onQueryStarted({ id }, { queryFulfilled }) {
        try {
          await queryFulfilled;
          toast.success(`User updated successfully!`);
        } catch (error) {
          toast.error(error?.data?.message || 'Error updating user.');
        }
      },
    }),

    deleteUser: builder.mutation({
      query: (id) => ({
        url: `/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Users'],
      async onQueryStarted(id, { queryFulfilled }) {
        try {
          await queryFulfilled;
          toast.success(`User deleted successfully!`);
        } catch (error) {
          toast.error(error?.data?.message || 'Error deleting user.');
        }
      },
    }),
  }),
});

export const {
  useGetUsersQuery,
  useCreateUserMutation,
  useUpdateUserMutation,
  useDeleteUserMutation,
} = usersApi;