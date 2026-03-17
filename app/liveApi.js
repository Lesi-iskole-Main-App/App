import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { BASE_URL } from "./api/api";

export const liveApi = createApi({
  reducerPath: "liveApi",
  baseQuery: fetchBaseQuery({
    baseUrl: `${BASE_URL}/api/live`,
    credentials: "include",
    prepareHeaders: (headers, { getState }) => {
      const token = getState()?.auth?.token;
      if (token) headers.set("Authorization", `Bearer ${token}`);
      headers.set("Content-Type", "application/json");
      return headers;
    },
  }),
  tagTypes: ["Lives"],
  endpoints: (builder) => ({
    getStudentLives: builder.query({
      query: () => ({
        url: "/student",
        method: "GET",
      }),
      transformResponse: (res) => {
        if (Array.isArray(res?.lives)) return res.lives;
        return [];
      },
      providesTags: ["Lives"],
    }),

    getAllLives: builder.query({
      query: () => ({
        url: "/",
        method: "GET",
      }),
      transformResponse: (res) => {
        if (Array.isArray(res?.lives)) return res.lives;
        return [];
      },
      providesTags: ["Lives"],
    }),

    getLivesByClassId: builder.query({
      query: (classId) => ({
        url: `/class/${classId}`,
        method: "GET",
      }),
      transformResponse: (res) => {
        if (Array.isArray(res?.lives)) return res.lives;
        return [];
      },
      providesTags: (result, error, classId) => [
        { type: "Lives", id: String(classId) },
      ],
    }),

    getLiveByClassIdAndLiveId: builder.query({
      query: ({ classId, liveId }) => ({
        url: `/class/${classId}/${liveId}`,
        method: "GET",
      }),
      transformResponse: (res) => res?.live || null,
      providesTags: (result, error, arg) => [
        { type: "Lives", id: `${String(arg?.classId)}-${String(arg?.liveId)}` },
      ],
    }),
  }),
});

export const {
  useGetStudentLivesQuery,
  useGetAllLivesQuery,
  useGetLivesByClassIdQuery,
  useGetLiveByClassIdAndLiveIdQuery,
} = liveApi;