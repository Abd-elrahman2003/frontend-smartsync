import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const purchaseReportApi = createApi({
  reducerPath: "purchaseReportApi",
  baseQuery: fetchBaseQuery({
    baseUrl: "http://localhost:3000/api/v1",
    prepareHeaders: (headers, { getState }) => {
      const token = getState().auth.token;
      if (token) {
        headers.set("authorization", `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ["PurchaseReport"],
  endpoints: (builder) => ({
    getPurchaseReport: builder.query({
      query: ({ page = 1, code, name }) => {
        // Using the endpoint path with page parameter
        let url = `/purchase-report/${page}`;
        const params = new URLSearchParams();
        
        if (code) params.append("code", code);
        if (name) params.append("name", name);
        
        const queryString = params.toString();
        if (queryString) {
          url += `?${queryString}`;
        }
        
        return url;
      },
      providesTags: ["PurchaseReport"],
    }),
  }),
});

export const {
  useGetPurchaseReportQuery,
} = purchaseReportApi;