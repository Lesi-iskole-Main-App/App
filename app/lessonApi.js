import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { BASE_URL } from "./api/api";

export const lessonApi = createApi({
  reducerPath: "lessonApi",
  baseQuery: fetchBaseQuery({
    baseUrl: `${BASE_URL}/api/lesson`,
    credentials: "include",
    prepareHeaders: (headers, { getState }) => {
      const token = getState()?.auth?.token;
      if (token) headers.set("Authorization", `Bearer ${token}`);
      headers.set("Content-Type", "application/json");
      return headers;
    },
  }),
  tagTypes: ["Lesson"],
  endpoints: (builder) => ({
    getLessonsByClassId: builder.query({
      query: (classId) => ({
        url: `/class/${classId}`,
        method: "GET",
      }),
      transformResponse: (res) => {
        if (Array.isArray(res?.lessons)) return res.lessons;
        return [];
      },
      providesTags: ["Lesson"],
    }),
  }),
});

export const { useGetLessonsByClassIdQuery } = lessonApi;