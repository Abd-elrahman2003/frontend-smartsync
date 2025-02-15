// productsApi.js
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { toast } from "react-toastify";

const baseQuery = fetchBaseQuery({
  baseUrl: "http://localhost:3000/api/v1",
  prepareHeaders: (headers) => {
    const token = localStorage.getItem("token");
    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }
    return headers;
  },
});

export const productsApi = createApi({
  reducerPath: "productsApi",
  baseQuery,
  tagTypes: ["Products", "Categories"],

  endpoints: (builder) => ({
    // Get Products
    getProducts: builder.query({
      query: (pageNumber) => `/products/${pageNumber}`,    
      transformResponse: (response) => ({
        products: response.products,
        totalProducts: response.totalProducts,
        totalPages: response.totalPages,
        currentPage: response.currentPage
      }),
      providesTags: ["Products"],
    }),

    // Get Categories with proper response structure
    getCategories: builder.query({
      query: (pageNumber) => `/categories/${pageNumber}`,
      providesTags: ["Categories"],
      transformResponse: (response) => ({
        categories: response.categories,
        totalCategories: response.totalCategories,
        totalPages: response.totalPages,
        currentPage: response.currentPage
      }),
    }),

    // Get Components of a Product
    getProductComponents: builder.query({
      query: ({ productId, pageNumber }) => `/products/${productId}/components?page=${pageNumber}`,
      providesTags: ["Products"],
    }),

    // Create Product
    createProduct: builder.mutation({
      query: (productData) => ({
        url: "/products",
        method: "POST",
        body: productData,
      }),
      invalidatesTags: ["Products"],
      async onQueryStarted(productData, { queryFulfilled }) {
        try {
          await queryFulfilled;
          toast.success(`Product "${productData.get('name')}" created successfully!`);
        } catch (error) {
          toast.error(error?.data?.message || "Failed to create product.");
        }
      },
    }),

    // Update Product
    updateProduct: builder.mutation({
      query: ({ productId, updatedData }) => ({
        url: `/products/${productId}`,
        method: "PATCH",
        body: updatedData,
      }),
      invalidatesTags: ["Products"],
    }),

    // Delete Product
    deleteProduct: builder.mutation({
      query: (productId) => ({
        url: `/products/${productId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Products"],
    }),

    // Add Image to Product
    addProductImage: builder.mutation({
      query: ({ productId, image }) => {
        const formData = new FormData();
        formData.append("image", image);
        return {
          url: `/products/${productId}/images`,
          method: "POST",
          body: formData,
        };
      },
      invalidatesTags: ["Products"],
    }),

    // Delete Product Image
    deleteProductImage: builder.mutation({
      query: (imageId) => ({
        url: `/products/images/${imageId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Products"],
    }),

    // Assign Component to Product
    assignProductComponent: builder.mutation({
      query: ({ productId, componentId }) => ({
        url: `/products/${productId}/components/${componentId}`,
        method: "POST",
      }),
      invalidatesTags: ["Products"],
    }),

    // Remove Component from Product
    deleteProductComponent: builder.mutation({
      query: ({ productId, componentId }) => ({
        url: `/products/${productId}/components/${componentId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Products"],
    }),
  }),
});

export const {
  useGetProductsQuery,
  useGetCategoriesQuery,
  useGetProductComponentsQuery,
  useCreateProductMutation,
  useUpdateProductMutation,
  useDeleteProductMutation,
  useAddProductImageMutation,
  useDeleteProductImageMutation,
  useAssignProductComponentMutation,
  useDeleteProductComponentMutation,
} = productsApi;