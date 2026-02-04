const isDev = process.env.NODE_ENV === "development";

const backendUrlFromEnv = process.env.NEXT_PUBLIC_API_URL;
if (!backendUrlFromEnv && !isDev) {
  throw new Error("NEXT_PUBLIC_API_URL is required for production builds");
}

const wsUrlFromEnv = process.env.NEXT_PUBLIC_WS_URL;
if (!wsUrlFromEnv && !isDev) {
  throw new Error("NEXT_PUBLIC_WS_URL is required for production builds");
}

export const BACKEND_URL = backendUrlFromEnv ?? "http://localhost:3001";
export const WS_URL = wsUrlFromEnv ?? "ws://localhost:8080";
