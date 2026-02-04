const isDev = process.env.NODE_ENV === "development";

const backendUrlFromEnv = process.env.NEXT_PUBLIC_API_URL;
const wsUrlFromEnv = process.env.NEXT_PUBLIC_WS_URL;

// Log warnings in production if env vars are missing
if (!isDev) {
  if (!backendUrlFromEnv) {
    console.warn("Warning: NEXT_PUBLIC_API_URL is not set. Using fallback.");
  }
  if (!wsUrlFromEnv) {
    console.warn("Warning: NEXT_PUBLIC_WS_URL is not set. Using fallback.");
  }
}

export const BACKEND_URL = backendUrlFromEnv ?? "http://localhost:3001";
export const WS_URL = wsUrlFromEnv ?? "ws://localhost:8080";
