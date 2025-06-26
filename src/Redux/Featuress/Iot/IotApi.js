import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { toast } from "react-toastify";

// إعداد `fetchBaseQuery` مع التوكن تلقائيًا
const baseQuery = fetchBaseQuery({
  baseUrl: "http://13.60.89.143:4500/api/v1/",
  prepareHeaders: (headers) => {
    const token = localStorage.getItem("token");
    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }
    return headers;
  },
});

export const iotApi = createApi({
  reducerPath: "iotApi",
  baseQuery,
  tagTypes: ["Camera", "Wifi"],

  endpoints: (builder) => ({
    // 🛠️ إضافة كاميرا إلى منتج
    assignCamera: builder.mutation({
      query: ({ productId, body }) => ({
        url: `camera/${productId}`,
        method: "POST",
        body,
      }),
      invalidatesTags: ["Camera"],
      async onQueryStarted(_, { queryFulfilled }) {
        try {
          await queryFulfilled;
        } catch (error) {
          toast.error(error?.data?.message || "Failed to assign camera.");
        }
      },
    }),

    // 🔍 جلب معلومات الكاميرا للمنتج
    getCameraAssignment: builder.query({
      query: (productId) => `camera/${productId}`,
      providesTags: ["Camera"],
    }),

    // ❌ حذف كاميرا من منتج
    deleteCameraAssignment: builder.mutation({
      query: (productId) => ({
        url: `camera/${productId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Camera"],
      async onQueryStarted(_, { queryFulfilled }) {
        try {
          await queryFulfilled;
        } catch (error) {
          toast.error(error?.data?.message || "Failed to remove camera.");
        }
      },
    }),

    // 🛠️ إضافة واي فاي إلى منتج
    assignWifi: builder.mutation({
      query: ({ productId, body }) => ({
        url: `wifi/${productId}`,
        method: "POST",
        body,
      }),
      invalidatesTags: ["Wifi"],
      async onQueryStarted(_, { queryFulfilled }) {
        try {
          await queryFulfilled;
        } catch (error) {
          toast.error(error?.data?.message || "Failed to assign WiFi.");
        }
      },
    }),

    // 🔍 جلب معلومات الواي فاي للمنتج
    getWifiAssignment: builder.query({
      query: (productId) => `wifi/${productId}`,
      providesTags: ["Wifi"],
    }),

    // ❌ حذف واي فاي من منتج
    deleteWifiAssignment: builder.mutation({
      query: (productId) => ({
        url: `wifi/${productId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Wifi"],
      async onQueryStarted(_, { queryFulfilled }) {
        try {
          await queryFulfilled;
        } catch (error) {
          toast.error(error?.data?.message || "Failed to remove WiFi.");
        }
      },
    }),
  }),
});

export const {
  useAssignCameraMutation,
  useGetCameraAssignmentQuery,
  useDeleteCameraAssignmentMutation,
  useAssignWifiMutation,
  useGetWifiAssignmentQuery,
  useDeleteWifiAssignmentMutation,
} = iotApi;
