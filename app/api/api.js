// app/api/baseUrl.js

export const BASE_URL = "https://lesiiskoleserver.com";

// Optional helper to safely build URLs
export const apiUrl = (path = "") => {
  const base = String(BASE_URL).replace(/\/+$/, "");
  const p = String(path).trim();
  if (!p) return base;
  return p.startsWith("/") ? `${base}${p}` : `${base}/${p}`;
};