import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { loginSuccess } from './authSlice';
import { toast } from 'react-toastify'; // لإظهار رسائل التوست

export const authApi = createApi({
  reducerPath: 'authApi',
  baseQuery: fetchBaseQuery({ baseUrl: 'http://13.60.89.143:4500/api/v1/register' }),
  endpoints: (builder) => ({
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
      async onQueryStarted(credentials, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          if (data && data.token && data.user) {
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));
            dispatch(loginSuccess({ user: data.user, token: data.token }));
            toast.success(`Login successful!...Welcome back, ${data.user.firstName}!`);
          } else {
            toast.error('User data or token is missing.');
          }
        } catch (error) {
          toast.error(error?.data?.message || 'Invalid email or password.');
        }
      },
    }),
    requestResetPassword: builder.mutation({
      query: (data) => ({
        url: '/request-reset-password',
        method: 'POST',
        body: data,
      }),
    }),
    resetPassword: builder.mutation({
      query: ({ token, newPassword }) => ({
        url: '/reset-password',
        method: 'POST',
        body: { token, newPassword },
      }),
    }),
    updateName: builder.mutation({
      query: (nameData) => ({
        url: '/update-name',
        method: 'PUT',
        body: nameData,
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      }),
    }),
    updatePassword: builder.mutation({
      query: (passwordData) => ({
        url: '/update-password',
        method: 'PUT',
        body: passwordData,
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      }),
    }),
    updateImage: builder.mutation({
      query: (imageData) => ({
        url: '/update-image',
        method: 'PUT',
        body: imageData,
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      }),
    }),
    getProfile: builder.query({
      query: () => ({
        url: '/profile',
        method: 'GET',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      }),
    }),
  }),
});

export const {
  useSignupUserMutation,
  useSigninUserMutation,
  useRequestResetPasswordMutation,
  useResetPasswordMutation,
  useUpdateNameMutation,
  useUpdatePasswordMutation,
  useUpdateImageMutation,
  useGetProfileQuery,
} = authApi;
