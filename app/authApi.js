import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { BASE_URL } from "./api/api";

export const authApi = createApi({
  reducerPath: "authApi",
  baseQuery: fetchBaseQuery({
    baseUrl: `${BASE_URL}/api/auth`,
    prepareHeaders: (headers, { getState }) => {
      const token = getState()?.auth?.token;
      if (token) headers.set("Authorization", `Bearer ${token}`);
      headers.set("Content-Type", "application/json");
      return headers;
    },
    credentials: "include",
  }),
  endpoints: (builder) => ({
    signup: builder.mutation({
      query: (body) => ({ url: "/signup", method: "POST", body }),
    }),

    verifySignupOtp: builder.mutation({
      query: ({ phonenumber, code }) => ({
        url: "/whatsapp/verify-code",
        method: "POST",
        body: { phonenumber, code },
      }),
    }),

    verifyForgotOtp: builder.mutation({
      query: ({ identifier, code }) => ({
        url: "/whatsapp/verify-code",
        method: "POST",
        body: {
          identifier,
          code,
          purpose: "reset_password",
        },
      }),
    }),

    resendSignupOtp: builder.mutation({
      query: ({ phonenumber }) => ({
        url: "/whatsapp/send-code",
        method: "POST",
        body: { phonenumber },
      }),
    }),

    signin: builder.mutation({
      query: (body) => ({ url: "/signin", method: "POST", body }),
    }),

    signout: builder.mutation({
      query: () => ({ url: "/signout", method: "POST" }),
    }),

    clearStudentSession: builder.mutation({
      query: (body) => ({
        url: "/student/clear-session",
        method: "POST",
        body,
      }),
    }),

    forgotSendOtp: builder.mutation({
      query: ({ identifier }) => ({
        url: "/forgot-password/send-otp",
        method: "POST",
        body: { identifier },
      }),
    }),

    forgotReset: builder.mutation({
      query: (body) => ({
        url: "/forgot-password/reset",
        method: "POST",
        body,
      }),
    }),
  }),
});

export const {
  useSignupMutation,
  useVerifySignupOtpMutation,
  useVerifyForgotOtpMutation,
  useResendSignupOtpMutation,
  useSigninMutation,
  useSignoutMutation,
  useClearStudentSessionMutation,
  useForgotSendOtpMutation,
  useForgotResetMutation,
} = authApi;