import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { toast } from 'react-toastify';

export const categoriesApi = createApi({
  reducerPath: 'categoriesApi',
  baseQuery: fetchBaseQuery({
    baseUrl: 'http://localhost:3000/api/v1/categories',
    prepareHeaders: (headers) => {
      const token = localStorage.getItem('token');
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ['Category'],
  endpoints: (builder) => ({
    getCategories: builder.query({
      query: () => '/',
      providesTags: ['Category'],
      async onQueryStarted(_, { queryFulfilled }) {
        try {
          await queryFulfilled;
        } catch (error) {
          toast.error(error?.data?.message || 'Failed to fetch categories');
        }
      },
    }),
    createCategory: builder.mutation({
      query: (categoryData) => ({
        url: '/',
        method: 'POST',
        body: categoryData,
      }),
      invalidatesTags: ['Category'],
      async onQueryStarted(_, { queryFulfilled }) {
        try {
          await queryFulfilled;
          toast.success('Category created successfully');
        } catch (error) {
          toast.error(error?.data?.message || 'Failed to create category');
        }
      },
    }),
    updateCategory: builder.mutation({
      query: ({ route, ...categoryData }) => ({
        url: `${route}`,
        method: 'PUT',
        body: categoryData,
      }),
      invalidatesTags: ['Category'],
      async onQueryStarted(_, { queryFulfilled }) {
        try {
          await queryFulfilled;
          toast.success('Category updated successfully');
        } catch (error) {
          toast.error(error?.data?.message || 'Failed to update category');
        }
      },
    }),
    deleteCategory: builder.mutation({
      query: (route) => ({
        url: `${route}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Category'],
      async onQueryStarted(_, { queryFulfilled }) {
        try {
          await queryFulfilled;
          toast.success('Category deleted successfully');
        } catch (error) {
          toast.error(error?.data?.message || 'Failed to delete category');
        }
      },
    }),
  }),
});

export const {
  useGetCategoriesQuery,
  useCreateCategoryMutation,
  useUpdateCategoryMutation,
  useDeleteCategoryMutation,
} = categoriesApi;
