import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { BASE_URL } from "./api/api";

export const classApi = createApi({
  reducerPath: "classApi",
  baseQuery: fetchBaseQuery({
    baseUrl: `${BASE_URL}/api/class`,
    prepareHeaders: (headers, { getState }) => {
      const token = getState()?.auth?.token;
      if (token) headers.set("Authorization", `Bearer ${token}`);
      headers.set("Content-Type", "application/json");
      return headers;
    },
    credentials: "include",
  }),
  endpoints: (builder) => ({
    getClassesByGradeAndSubject: builder.query({
      query: ({ gradeNumber, subjectName = "", streamName = "" }) => {
        const params = new URLSearchParams();

        params.set("gradeNumber", String(gradeNumber));

        if (String(subjectName || "").trim()) {
          params.set("subjectName", String(subjectName).trim());
        }

        if (String(streamName || "").trim()) {
          params.set("streamName", String(streamName).trim());
        }

        return {
          url: `/public?${params.toString()}`,
          method: "GET",
        };
      },
      transformResponse: (res) => {
        if (Array.isArray(res?.classes)) return res.classes;
        return [];
      },
    }),
  }),
});

export const { useGetClassesByGradeAndSubjectQuery } = classApi;