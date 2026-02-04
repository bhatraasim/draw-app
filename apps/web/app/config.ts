export const BACKEND_URL =
  process.env.NEXT_PUBLIC_API_URL ??
  (process.env.NODE_ENV === "development" ? "http://localhost:3001" : "");
export const WS_URL = "ws://localhost:8080";
