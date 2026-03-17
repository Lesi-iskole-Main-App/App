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
  tagTypes: ["Lessons"],
  endpoints: (builder) => ({
    getLessonsByClassId: builder.query({
      query: (classId) => ({
        url: `/class/${classId}`,
        method: "GET",
      }),
      transformResponse: (res) => ({
        lessons: Array.isArray(res?.lessons) ? res.lessons : [],
        access: String(res?.access || "full").toLowerCase(),
        message: String(res?.message || ""),
      }),
      providesTags: (result, error, classId) => [
        { type: "Lessons", id: String(classId) },
      ],
    }),
  }),
});

export const { useGetLessonsByClassIdQuery } = lessonApi;