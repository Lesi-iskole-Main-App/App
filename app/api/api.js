// app/api/baseUrl.js

/**
 * ✅ Put your REAL NODE BACKEND URL here
 * Examples:
 *  - https://your-backend.onrender.com
 *  - https://api.charithgimhan.com
 *  - https://www.charithgimhan.com   (ONLY if backend is actually serving /api routes)
 */
export const BASE_URL = "https://bakend-k0f6.onrender.com"; // <-- change to your backend

// Optional helper to safely build URLs
export const apiUrl = (path = "") => {
  const base = String(BASE_URL).replace(/\/+$/, "");
  const p = String(path).trim();
  if (!p) return base;
  return p.startsWith("/") ? `${base}${p}` : `${base}/${p}`;
};