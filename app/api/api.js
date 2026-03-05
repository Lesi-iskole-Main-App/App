// app/api/api.js

import { Platform } from "react-native";

const ENV_URL = process.env.EXPO_PUBLIC_API_URL?.trim();

if (!ENV_URL) {
  throw new Error("EXPO_PUBLIC_API_URL is not defined in .env");
}

const normalizeUrl = (url) => String(url || "").replace(/\/+$/, "");

const getPlatformBaseUrl = () => {
  // Android emulator cannot access your computer using localhost
  if (
    Platform.OS === "android" &&
    /^http:\/\/localhost(?::\d+)?$/i.test(ENV_URL)
  ) {
    return ENV_URL.replace("http://localhost", "http://10.0.2.2");
  }

  // Web browser should use localhost, not 10.0.2.2
  if (
    Platform.OS === "web" &&
    /^http:\/\/10\.0\.2\.2(?::\d+)?$/i.test(ENV_URL)
  ) {
    return ENV_URL.replace("http://10.0.2.2", "http://localhost");
  }

  return ENV_URL;
};

export const BASE_URL = normalizeUrl(getPlatformBaseUrl());

console.log("BASE_URL:", BASE_URL);