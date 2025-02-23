import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { toast } from 'react-toastify';

export const storeApi = createApi({
  reducerPath: 'storeApi',
  baseQuery: fetchBaseQuery({
    baseUrl: 'http://localhost:3000/api/v1/store',
    prepareHeaders: (headers) => {
      const token = localStorage.getItem('token');
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ['Store'],
  endpoints: (builder) => ({
    getStores: builder.query({
      query: (page = 1) => `/${page}`,
      providesTags: (result) =>
        result?.stores
          ? [
              ...result.stores.map(({ id }) => ({ type: 'Store', id })),
              { type: 'Store', id: 'LIST' }
            ]
          : [{ type: 'Store', id: 'LIST' }],
      transformResponse: (response) => {
        return {
          stores: response || [],
          totalPages: response.totalPages || 1,
          currentPage: response.currentPage || 1,
          totalStores: response.totalStores || 0
        };
      },
    }),

    createStore: builder.mutation({
      query: (storeData) => ({
        url: '/',
        method: 'POST',
        body: storeData,
      }),
      invalidatesTags: [{ type: 'Store', id: 'LIST' }],
      async onQueryStarted(_, { queryFulfilled }) {
        try {
          await queryFulfilled;
          toast.success('Store created successfully');
        } catch (error) {
          toast.error(error?.data?.message || 'Failed to create store');
        }
      },
    }),

    updateStore: builder.mutation({
      query: ({ id, ...storeData }) => ({
        url: `/${id}`,
        method: 'PUT',
        body: storeData,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'Store', id },
        { type: 'Store', id: 'LIST' }
      ],
      async onQueryStarted({ id }, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled;
          toast.success('Store updated successfully');
        } catch (error) {
          toast.error(error?.data?.message || 'Failed to update store');
        }
      },
    }),

    deleteStore: builder.mutation({
      query: (id) => ({
        url: `/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: [{ type: 'Store', id: 'LIST' }],
      async onQueryStarted(id, { dispatch, queryFulfilled }) {
        try {
          dispatch(
            storeApi.util.updateQueryData('getStores', undefined, (draft) => {
              if (draft?.stores) {
                draft.stores = draft.stores.filter(store => store.id !== id);
                if (draft.totalStores) {
                  draft.totalStores -= 1;
                }
              }
            })
          );
    
          await queryFulfilled;
          toast.success('Store deleted successfully');
        } catch (error) {
          console.error('Error deleting store:', error);
          toast.error(error?.data?.message || 'Failed to delete store');
          dispatch(storeApi.util.invalidateTags([{ type: 'Store', id: 'LIST' }]));
        }
      },
    }),
  }),
});

export const {
  useGetStoresQuery,
  useCreateStoreMutation,
  useUpdateStoreMutation,
  useDeleteStoreMutation,
} = storeApi;