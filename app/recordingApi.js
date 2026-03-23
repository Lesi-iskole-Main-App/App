import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { BASE_URL } from "./api/api";

export const recordingApi = createApi({
  reducerPath: "recordingApi",
  baseQuery: fetchBaseQuery({
    baseUrl: `${BASE_URL}/api/recording`,
    credentials: "include",
    prepareHeaders: (headers, { getState }) => {
      const token = getState()?.auth?.token;
      if (token) headers.set("Authorization", `Bearer ${token}`);
      headers.set("Content-Type", "application/json");
      return headers;
    },
  }),
  tagTypes: ["Recording"],
  endpoints: (builder) => ({
    getRecordingsByClassId: builder.query({
      query: (classId) => ({
        url: `/class/${classId}`,
        method: "GET",
      }),
      transformResponse: (res) => {
        if (Array.isArray(res?.recordings)) return res.recordings;
        return [];
      },
      providesTags: (result, error, classId) => [
        { type: "Recording", id: String(classId) },
      ],
    }),
  }),
});

export const { useGetRecordingsByClassIdQuery } = recordingApi;