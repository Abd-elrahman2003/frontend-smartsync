import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const stockReportApi = createApi({
  reducerPath: "stockReportApi",
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
  tagTypes: ["StockReport"],
  endpoints: (builder) => ({
    getStockReport: builder.query({
      query: ({ page = 1, storeName, categoryName, itemName }) => {
        // Using the endpoint path with ID parameters instead of names
        let url = `/stock-report/${page}`;
        const params = new URLSearchParams();
        
        if (storeName) params.append("storeName", storeName);
        if (categoryName) params.append("categoryName", categoryName);
        if (itemName) params.append("itemName", itemName);
        
        const queryString = params.toString();
        if (queryString) {
          url += `?${queryString}`;
        }
        
        return url;
      },
      providesTags: ["StockReport"],
    }),
  }),
});

export const {
  useGetStockReportQuery,
} = stockReportApi;