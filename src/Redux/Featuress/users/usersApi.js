import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { toast } from 'react-toastify';

export const usersApi = createApi({
  reducerPath: 'usersApi',
  baseQuery: fetchBaseQuery({ 
    baseUrl: 'http://13.60.89.143:4500/api/v1/users',
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
    
    // ✅ Fetch users with pagination & search filters
    getUsers: builder.query({
      query: ({ page = 1, id, firstName, lastName, email }) => ({
        url: `/${page}`,
        method: 'GET',
        params: { id, firstName, lastName, email }, // Adds query parameters
      }),
      providesTags: ['Users'],
      transformResponse: (response) => response,
    }),

    // ✅ Create a new user
    createUser: builder.mutation({
      query: (userData) => ({
        url: '/',
        method: 'POST',
        body: userData,
      }),
      invalidatesTags: ['Users'],
      async onQueryStarted(_, { queryFulfilled }) {
        try {
          await queryFulfilled;
        } catch (error) {
          console.error('Create User Error:', error);
        }
      },
    }),

    // ✅ Update user details
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

    // ✅ Delete a user
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
