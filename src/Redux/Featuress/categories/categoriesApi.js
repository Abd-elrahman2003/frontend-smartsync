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
      query: (page = 1) => `/${page}`,
      providesTags: (result) =>
        result?.categories
          ? [
              ...result.categories.map(({ id }) => ({ type: 'Category', id })),
              { type: 'Category', id: 'LIST' }
            ]
          : [{ type: 'Category', id: 'LIST' }],
      transformResponse: (response) => {
        return {
          categories: response.categories || [],
          totalPages: response.totalPages || 1,
          currentPage: response.currentPage || 1,
          totalCategories: response.totalCategories || 0
        };
      },
    }),

    createCategory: builder.mutation({
      query: (categoryData) => ({
        url: '/',
        method: 'POST',
        body: categoryData,
      }),
      invalidatesTags: [{ type: 'Category', id: 'LIST' }],
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
      query: ({ id, ...categoryData }) => ({
        url: `/${id}`,
        method: 'PUT',
        body: categoryData,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'Category', id },
        { type: 'Category', id: 'LIST' }
      ],
      async onQueryStarted({ id }, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled;
          toast.success('Category updated successfully');
        } catch (error) {
          toast.error(error?.data?.message || 'Failed to update category');
        }
      },
    }),

    deleteCategory: builder.mutation({
      query: (id) => ({
        url: `/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: [{ type: 'Category', id: 'LIST' }],
      async onQueryStarted(id, { dispatch, queryFulfilled }) {
        try {
          // Optimistic update to remove category from the local state
          dispatch(
            categoriesApi.util.updateQueryData('getCategories', undefined, (draft) => {
              if (draft?.categories) {
                // Filter out the category that is being deleted
                draft.categories = draft.categories.filter(category => category.id !== id);
    
                // Decrease the total category count
                if (draft.totalCategories) {
                  draft.totalCategories -= 1;
                }
              }
            })
          );
    
          // Wait for the deletion to complete on the server
          await queryFulfilled;
    
          // Show success toast after the successful deletion
          toast.success('Category deleted successfully');
        } catch (error) {
          // Log the error and show an error toast message
          console.error('Error deleting category:', error);
          toast.error(error?.data?.message || 'Failed to delete category');
    
          // Invalidate the cache to restore the category list if deletion fails
          dispatch(categoriesApi.util.invalidateTags([{ type: 'Category', id: 'LIST' }]));
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
