import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { BASE_URL } from "./api/api";

export const languageApi = createApi({
  reducerPath: "languageApi",
  baseQuery: fetchBaseQuery({
    baseUrl: `${BASE_URL}/api/language`,
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
  endpoints: (builder) => ({
    saveLanguageSelection: builder.mutation({
      query: (body) => ({
        url: "/select",
        method: "PATCH",
        body, // { language: "si" | "en" }
      }),
    }),

    getMyLanguage: builder.query({
      query: () => ({
        url: "/me",
        method: "GET",
      }),
    }),
  }),
});

export const {
  useSaveLanguageSelectionMutation,
  useGetMyLanguageQuery,
} = languageApi;