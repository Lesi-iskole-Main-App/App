// src/app/paymentApi.js
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { BASE_URL } from "./api/api";

export const paymentApi = createApi({
  reducerPath: "paymentApi",
  baseQuery: fetchBaseQuery({
    baseUrl: `${BASE_URL}/api/payment`,
    prepareHeaders: (headers, { getState }) => {
      const token = getState()?.auth?.token;
      if (token) headers.set("Authorization", `Bearer ${token}`);
      headers.set("Content-Type", "application/json");
      return headers;
    },
    credentials: "include",
  }),
  tagTypes: ["PaymentStatus"],
  endpoints: (builder) => ({
    createCheckout: builder.mutation({
      query: ({ paperId }) => ({
        url: "/checkout",
        method: "POST",
        body: { paperId },
      }),
      invalidatesTags: (_res, _err, arg) => [
        { type: "PaymentStatus", id: String(arg?.paperId) },
      ],
    }),

    getMyPaymentStatus: builder.query({
      query: ({ paperId }) => ({
        url: `/my/${paperId}`,
        method: "GET",
      }),
      providesTags: (_res, _err, arg) => [
        { type: "PaymentStatus", id: String(arg?.paperId) },
      ],
    }),
  }),
});

export const { useCreateCheckoutMutation, useGetMyPaymentStatusQuery } = paymentApi;