import "server-only";

// Resolve lazily: placeholder pages and builds do not need a live backend.
export function getApiOrigin(): string {
  const value = process.env.TASKFLOW_API_URL;
  if (!value) throw new Error("TASKFLOW_API_URL is required for API requests.");

  let url: URL;
  try {
    url = new URL(value);
  } catch {
    throw new Error("TASKFLOW_API_URL must be a valid HTTP(S) origin.");
  }
  if (
    !["http:", "https:"].includes(url.protocol) ||
    url.username || url.password || url.search || url.hash ||
    url.pathname !== "/" ||
    (process.env.NODE_ENV === "production" && url.protocol !== "https:")
  ) {
    throw new Error("TASKFLOW_API_URL must be an origin without credentials, path, query, or fragment; production requires HTTPS.");
  }
  return url.origin;
}

// Explicit in production so proxy/forwarded host headers cannot define trust.
export function getAppOrigin(requestUrl: string): string {
  const value = process.env.APP_ORIGIN;
  if (!value && process.env.NODE_ENV === "production") {
    throw new Error("APP_ORIGIN is required in production.");
  }
  const url = new URL(value ?? new URL(requestUrl).origin);
  if (!["http:", "https:"].includes(url.protocol) || url.username || url.password ||
    url.pathname !== "/" || url.search || url.hash ||
    (process.env.NODE_ENV === "production" && url.protocol !== "https:")) {
    throw new Error("APP_ORIGIN must be an origin; production requires HTTPS.");
  }
  return url.origin;
}
