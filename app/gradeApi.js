import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { BASE_URL } from "./api/api";

export const gradeApi = createApi({
  reducerPath: "gradeApi",
  baseQuery: fetchBaseQuery({
    baseUrl: `${BASE_URL}/api/grade`,
    prepareHeaders: (headers, { getState }) => {
      const token = getState()?.auth?.token;

      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }

      headers.set("Content-Type", "application/json");
      return headers;
    },
    credentials: "include",
  }),
  tagTypes: ["Grades", "Streams"],
  endpoints: (builder) => ({
    getGrades: builder.query({
      query: () => ({
        url: "/",
        method: "GET",
      }),
      providesTags: ["Grades"],
    }),

    getGradeByNumber: builder.query({
      query: (gradeNumber) => ({
        url: `/${gradeNumber}`,
        method: "GET",
      }),
      providesTags: ["Grades"],
    }),

    getStreamsByGradeNumber: builder.query({
      query: (gradeValue) => ({
        url: `/streams/${gradeValue}`,
        method: "GET",
      }),
      providesTags: (result, error, arg) => [
        { type: "Streams", id: String(arg) },
      ],
    }),
  }),
});

export const {
  useGetGradesQuery,
  useGetGradeByNumberQuery,
  useGetStreamsByGradeNumberQuery,
} = gradeApi;