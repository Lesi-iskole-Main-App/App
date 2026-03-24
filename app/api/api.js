// app/api/api.js

const rawEnvUrl = process.env.EXPO_PUBLIC_API_URL;

if (!rawEnvUrl || !String(rawEnvUrl).trim()) {
  throw new Error("EXPO_PUBLIC_API_URL is not defined in .env");
}

const normalizeUrl = (url = "") => String(url).trim().replace(/\/+$/, "");

export const BASE_URL = normalizeUrl(rawEnvUrl);

