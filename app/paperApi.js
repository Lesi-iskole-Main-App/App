import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { BASE_URL } from "./api/api";

export const paperApi = createApi({
  reducerPath: "paperApi",
  baseQuery: fetchBaseQuery({
    baseUrl: `${BASE_URL}/api/paper`,
    prepareHeaders: (headers, { getState }) => {
      const token = getState()?.auth?.token;
      if (token) headers.set("Authorization", `Bearer ${token}`);
      headers.set("Content-Type", "application/json");
      return headers;
    },
    credentials: "include",
  }),
  endpoints: (builder) => ({
    getPublishedPaperSubjects: builder.query({
      query: ({ gradeNumber, paperType, stream }) => {
        const params = new URLSearchParams();
        params.set("gradeNumber", String(gradeNumber));
        params.set("paperType", String(paperType || "Daily Quiz"));
        if (stream) params.set("stream", String(stream));

        return {
          url: `/public/subjects?${params.toString()}`,
          method: "GET",
        };
      },
      transformResponse: (res) => {
        const rawSubjects = Array.isArray(res?.subjects) ? res.subjects : [];

        return rawSubjects
          .map((item) => {
            if (typeof item === "string") {
              const subject = String(item).trim();
              if (!subject) return null;

              return {
                _id: subject,
                subject,
              };
            }

            if (item && typeof item === "object") {
              const subject = String(item.subject || "").trim();
              const _id = String(item._id || subject || "").trim();

              if (!subject) return null;

              return {
                _id,
                subject,
              };
            }

            return null;
          })
          .filter(Boolean);
      },
    }),

    getPublishedPapers: builder.query({
      query: ({ gradeNumber, paperType, stream, subject }) => {
        const params = new URLSearchParams();
        params.set("gradeNumber", String(gradeNumber));
        params.set("paperType", String(paperType || "Model paper"));
        if (stream) params.set("stream", String(stream));
        if (subject) params.set("subject", String(subject));

        return {
          url: `/public?${params.toString()}`,
          method: "GET",
        };
      },
      transformResponse: (res) => {
        if (Array.isArray(res?.papers)) return res.papers;
        return [];
      },
    }),
  }),
});

export const {
  useGetPublishedPaperSubjectsQuery,
  useGetPublishedPapersQuery,
} = paperApi;