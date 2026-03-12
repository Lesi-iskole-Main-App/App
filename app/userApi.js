import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { BASE_URL } from "./api/api";

export const userApi = createApi({
  reducerPath: "userApi",
  baseQuery: fetchBaseQuery({
    baseUrl: `${BASE_URL}/api/user`,
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
  tagTypes: ["MyProfile"],
  endpoints: (builder) => ({
    getMyProfile: builder.query({
      query: () => ({
        url: "/me",
        method: "GET",
      }),
      providesTags: ["MyProfile"],
    }),

    saveStudentGradeSelection: builder.mutation({
      query: (body) => ({
        url: "/student/grade-selection",
        method: "PATCH",
        body,
      }),
      invalidatesTags: ["MyProfile"],
    }),
  }),
});

export const {
  useGetMyProfileQuery,
  useSaveStudentGradeSelectionMutation,
} = userApi;