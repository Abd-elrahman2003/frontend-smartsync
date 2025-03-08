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
        currentPage: response.currentPage,
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
        currentPage: response.currentPage,
      }),
    }),

    // Get Components of a Product
    getProductComponents: builder.query({
      query: ({ productId, pageNumber }) => `/products/${productId}/${pageNumber}`,
      transformResponse: (response) => ({
        components: response.getComponents || [],
        totalComponents: response.totalComponents || 0,
        totalPages: response.totalPages || 1,
        currentPage: response.currentPage
      }),
      providesTags: ["Products"],
    }),

    // Get Product Images
    getProductImages: builder.query({
      query: (productId) => `/products/images/${productId}`,
      transformResponse: (response) => ({
        images: response.images || []
      }),
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
        } catch (error) {
          toast.error(error?.data?.message || "Failed to create product.");
        }
      },
    }),

    // Update Product
    updateProduct: builder.mutation({
      query: ({ productId, updatedData }) => ({
        url: `/products/${productId}`,
        method: "PUT",
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

    // Add Product Images
    addProductImages: builder.mutation({
      query: ({ productId, images }) => {
        const formData = new FormData();
        for (let i = 0; i < images.length; i++) {
          formData.append("images", images[i]);
        }
        return {
          url: `/products/images/${productId}`,
          method: "POST",
          body: formData
        };
      },
      invalidatesTags: ["Products"],
      async onQueryStarted(_, { queryFulfilled }) {
        try {
          await queryFulfilled;
        } catch (error) {
          toast.error(error?.data?.message || "Failed to upload images.");
        }
      },
    }),

   // Delete Product Image
   deleteProductImage: builder.mutation({
    query: (imageId) => ({
      url: `/products/images/${imageId}`, // يعتمد فقط على imageId
      method: "DELETE",
    }),
    invalidatesTags: ["ProductImages"],
    async onQueryStarted(_, { queryFulfilled }) {
      try {
        await queryFulfilled;
      } catch (error) {
        toast.error(error?.data?.message || "Failed to delete image.");
      }
    },
  }),
    // Assign Component to Product
    assignProductComponent: builder.mutation({
      query: ({ productId, componentId, quantity, timeExpentency }) => ({
        url: `/products/${productId}/${componentId}`,
        method: "POST",
        body: { quantity, timeExpentency },
      }),
      invalidatesTags: ["Products"],
      async onQueryStarted({ productId, componentId }, { queryFulfilled }) {
        try {
          await queryFulfilled;
          toast.success("Component assigned successfully!");
        } catch (error) {
          toast.error(error?.data?.message || "Failed to assign component.");
        }
      },
    }),

    // Remove Component from Product
    deleteProductComponent: builder.mutation({
      query: ({ productId, componentId }) => ({
        url: `/products/${productId}/${componentId}`,
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
  useGetProductImagesQuery,
  useCreateProductMutation,
  useUpdateProductMutation,
  useDeleteProductMutation,
  useAddProductImagesMutation,
  useDeleteProductImageMutation,
  useAssignProductComponentMutation,
  useDeleteProductComponentMutation,
} = productsApi;