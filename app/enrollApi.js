import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { BASE_URL } from "./api/api";

export const enrollApi = createApi({
  reducerPath: "enrollApi",
  baseQuery: fetchBaseQuery({
    baseUrl: `${BASE_URL}/api/enroll`,
    credentials: "include",
    prepareHeaders: (headers, { getState }) => {
      const token = getState()?.auth?.token;
      if (token) headers.set("Authorization", `Bearer ${token}`);
      headers.set("Content-Type", "application/json");
      return headers;
    },
  }),
  tagTypes: ["Enroll", "ApprovedClasses"],
  endpoints: (builder) => ({
    requestEnroll: builder.mutation({
      query: (body) => ({
        url: "/request",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Enroll", "ApprovedClasses"],
    }),

    getMyEnrollRequests: builder.query({
      query: () => ({
        url: "/my",
        method: "GET",
      }),
      providesTags: ["Enroll"],
    }),

    getMyApprovedClasses: builder.query({
      query: () => ({
        url: "/my-approved-classes",
        method: "GET",
      }),
      transformResponse: (res) => {
        if (Array.isArray(res?.items)) return res.items;
        return [];
      },
      providesTags: ["ApprovedClasses"],
    }),
  }),
});

export const {
  useRequestEnrollMutation,
  useGetMyEnrollRequestsQuery,
  useGetMyApprovedClassesQuery,
} = enrollApi;