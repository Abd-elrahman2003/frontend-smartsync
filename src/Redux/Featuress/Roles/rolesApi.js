import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { toast } from 'react-toastify';

const baseQuery = fetchBaseQuery({
  baseUrl: 'http://localhost:3000/api/v1',
  prepareHeaders: (headers) => {
    const token = localStorage.getItem('token');
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }
    return headers;
  },
});

export const rolesApi = createApi({
  reducerPath: 'rolesApi',
  baseQuery,
  tagTypes: ['Roles'],

  endpoints: (builder) => ({
    getRoles: builder.query({
      query: () => '/roles',
      providesTags: ['Roles'],
    }),

    createRole: builder.mutation({
      query: (roleName) => ({
        url: '/roles',
        method: 'POST',
        body: { name: roleName },
      }),
      invalidatesTags: ['Roles'],
      async onQueryStarted({ queryFulfilled }) {
        try {
          await queryFulfilled;
          toast.success(`Role created successfully!`);
        } catch (error) {
          toast.error(error?.data?.message || 'Failed to create role.');
        }
      },
    }),

    updateRole: builder.mutation({
      query: ({ oldName, newName }) => ({
        url: `/roles/${oldName}`,
        method: 'PATCH',
        body: { newName },
      }),
      invalidatesTags: ['Roles'],
      async onQueryStarted({ queryFulfilled }) {
        try {
          await queryFulfilled;
          toast.success(`Role updated Successfully`);
        } catch (error) {
          toast.error(error?.data?.message || 'Failed to update role.');
        }
      },
    }),

    deleteRole: builder.mutation({
      query: (roleName) => ({
        url: `/roles/${roleName}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Roles'],
      async onQueryStarted({ queryFulfilled }) {
        try {
          await queryFulfilled;
          toast.success(`Role deleted successfully!`);
        } catch (error) {
          toast.error(error?.data?.message || 'Failed to delete role.');
        }
      },
    }),

    assignRoleToUser: builder.mutation({
      query: ({ userId, roleIds }) => ({
        url: `/roles/assign/${userId}`,  
        method: "POST",
        body: { roleIds }, 
      }),
      invalidatesTags: ["Roles"],
      async onQueryStarted({ queryFulfilled }) {
          await queryFulfilled;      
        },
    }),
    
    
    getFormattedScreens: builder.query({
      query: (roleId) => `/roles/formatted/${roleId}`,
      providesTags: ['Roles'],
    }),

    assignPermissionsToRole: builder.mutation({
      query: ({ roleName, permissions }) => ({
        url: `/roles/assign-permissions`,
        method: 'POST',
        body: { roleName, permissions },
      }),
      invalidatesTags: ['Roles'],
      async onQueryStarted({ queryFulfilled }) {
        try {
          await queryFulfilled;
          toast.success(`Permissions assigned to role Successfully`);
        } catch (error) {
          toast.error(error?.data?.message || 'Failed to assign permissions.');
        }
      },
    }),
  }),
});

export const {
  useGetRolesQuery,
  useCreateRoleMutation,
  useUpdateRoleMutation,
  useDeleteRoleMutation,
  useAssignRoleToUserMutation,
  useGetFormattedScreensQuery,
  useAssignPermissionsToRoleMutation,
} = rolesApi;
