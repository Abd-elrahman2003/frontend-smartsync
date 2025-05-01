// supplierApi.js
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { toast } from 'react-toastify';

export const supplierApi = createApi({
  reducerPath: 'supplierApi',
  baseQuery: fetchBaseQuery({
    baseUrl: 'http://localhost:3000/api/v1/supplier',
    prepareHeaders: (headers) => {
      const token = localStorage.getItem('token');
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ['Supplier'],
  endpoints: (builder) => ({
    getSuppliers: builder.query({
      query: (page = 1) => `/${page}`,
      providesTags: (result) =>
        result?.suppliers
          ? [
              ...result.suppliers.map(({ id }) => ({ type: 'Supplier', id })),
              { type: 'Supplier', id: 'LIST' }
            ]
          : [{ type: 'Supplier', id: 'LIST' }],
      transformResponse: (response) => {
        return {
          suppliers: response || [],
          totalPages: response.totalPages || 1,
          currentPage: response.currentPage || 1,
          totalSuppliers: response.totalSuppliers || 0
        };
      },
    }),

    createSupplier: builder.mutation({
      query: (supplierData) => ({
        url: '/',
        method: 'POST',
        body: supplierData,
      }),
      invalidatesTags: [{ type: 'Supplier', id: 'LIST' }],
      async onQueryStarted(_, { queryFulfilled }) {
        try {
          await queryFulfilled;
          toast.success('Supplier created successfully');
        } catch (error) {
          toast.error(error?.data?.message || 'Failed to create supplier');
        }
      },
    }),

    updateSupplier: builder.mutation({
      query: ({ id, ...supplierData }) => ({
        url: `/${id}`,
        method: 'PUT',
        body: supplierData,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'Supplier', id },
        { type: 'Supplier', id: 'LIST' }
      ],
      async onQueryStarted({ id }, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled;
          toast.success('Supplier updated successfully');
        } catch (error) {
          toast.error(error?.data?.message || 'Failed to update supplier');
        }
      },
    }),

    deleteSupplier: builder.mutation({
      query: (id) => ({
        url: `/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: [{ type: 'Supplier', id: 'LIST' }],
      async onQueryStarted(id, { dispatch, queryFulfilled }) {
        try {
          dispatch(
            supplierApi.util.updateQueryData('getSuppliers', undefined, (draft) => {
              if (draft?.suppliers) {
                draft.suppliers = draft.suppliers.filter(supplier => supplier.id !== id);
                if (draft.totalSuppliers) {
                  draft.totalSuppliers -= 1;
                }
              }
            })
          );
    
          await queryFulfilled;
          toast.success('Supplier deleted successfully');
        } catch (error) {
          console.error('Error deleting supplier:', error);
          toast.error(error?.data?.message || 'Failed to delete supplier');
          dispatch(supplierApi.util.invalidateTags([{ type: 'Supplier', id: 'LIST' }]));
        }
      },
    }),
  }),
});

export const {
  useGetSuppliersQuery,
  useCreateSupplierMutation,
  useUpdateSupplierMutation,
  useDeleteSupplierMutation,
} = supplierApi;
