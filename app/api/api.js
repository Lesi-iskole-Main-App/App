// app/api/api.js

const ENV_URL = process.env.EXPO_PUBLIC_API_URL;

if (!ENV_URL) {
  throw new Error(
    "❌ EXPO_PUBLIC_API_URL is not defined in .env file"
  );
}

// remove trailing slash
export const BASE_URL = ENV_URL.replace(/\/+$/, "");