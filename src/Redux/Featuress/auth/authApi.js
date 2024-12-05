import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const authApi = createApi({
  reducerPath: 'authApi',
  baseQuery: fetchBaseQuery({ baseUrl: 'http://localhost:3000/api/v1/register' }),
  endpoints: (builder) => ({
    // إضافة endpoint للتحقق من وجود المستخدم
    checkUserExists: builder.query({
      query: (email) => `/check-user?email=${email}`,
    }),
    signupUser: builder.mutation({
      query: (userData) => ({
        url: '/signup',
        method: 'POST',
        body: userData,
      }),
    }),
    signinUser: builder.mutation({
      query: (credentials) => ({
        url: '/signin',
        method: 'POST',
        body: credentials,
      }),
    }),
  }),
});

export const { useCheckUserExistsQuery, useSignupUserMutation, useSigninUserMutation } = authApi;
