import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const API_URL =
  process.env.EXPO_PUBLIC_API_URL ||
  process.env.REACT_APP_API_URL ||
  "http://localhost:8080";

export const reviewApi = createApi({
  reducerPath: "reviewApi",
  baseQuery: fetchBaseQuery({
    baseUrl: `${API_URL}/api/review`,
    credentials: "include",
  }),
  tagTypes: ["Review"],
  endpoints: (builder) => ({
    getAllReviews: builder.query({
      query: () => "/",
      transformResponse: (response) =>
        Array.isArray(response?.data) ? response.data : [],
      providesTags: ["Review"],
    }),

    getReviewById: builder.query({
      query: (reviewId) => `/${reviewId}`,
      transformResponse: (response) => response?.data ?? null,
      providesTags: (result, error, id) => [{ type: "Review", id }],
    }),

    createReview: builder.mutation({
      query: (body) => ({
        url: "/",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Review"],
    }),

    updateReviewById: builder.mutation({
      query: ({ reviewId, ...body }) => ({
        url: `/${reviewId}`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: (result, error, arg) => [
        "Review",
        { type: "Review", id: arg.reviewId },
      ],
    }),

    deleteReviewById: builder.mutation({
      query: (reviewId) => ({
        url: `/${reviewId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Review"],
    }),
  }),
});

export const {
  useGetAllReviewsQuery,
  useGetReviewByIdQuery,
  useCreateReviewMutation,
  useUpdateReviewByIdMutation,
  useDeleteReviewByIdMutation,
} = reviewApi;