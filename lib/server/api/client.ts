import "server-only";

import { ApiError } from "@/lib/api/error";
import { getApiOrigin } from "@/lib/server/config";
import type { ApiErrorResponse, ValidationDetail } from "@/types/api";

export interface RequestOptions {
  method?: "GET" | "POST" | "PATCH" | "DELETE";
  token?: string;
  query?: Record<string, string | number | undefined>;
  body?: unknown;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isValidationDetail(value: unknown): value is ValidationDetail {
  return isRecord(value) && typeof value.type === "string" &&
    typeof value.msg === "string" && Array.isArray(value.loc) &&
    value.loc.every((part) => typeof part === "string" || typeof part === "number");
}

function isApiErrorResponse(value: unknown): value is ApiErrorResponse {
  return isRecord(value) && isRecord(value.error) &&
    typeof value.error.code === "string" && typeof value.error.message === "string" &&
    typeof value.request_id === "string" &&
    (value.error.details === undefined ||
      (Array.isArray(value.error.details) && value.error.details.every(isValidationDetail)));
}

// T describes the documented contract; successful payloads are not schema-validated.
export async function apiFetch<T>(
  path: `/api/v1/${string}`,
  options: RequestOptions = {},
): Promise<T> {
  const origin = getApiOrigin();
  const url = new URL(path, origin);
  if (url.origin !== origin || !url.pathname.startsWith("/api/v1/")) {
    throw new Error("API requests must stay within the configured /api/v1/ endpoint.");
  }
  for (const [key, value] of Object.entries(options.query ?? {})) {
    if (value !== undefined) url.searchParams.set(key, String(value));
  }
  const headers = new Headers({ Accept: "application/json" });
  if (options.token) headers.set("Authorization", `Bearer ${options.token}`);
  if (options.body !== undefined) headers.set("Content-Type", "application/json");
  const body = options.body === undefined ? undefined : JSON.stringify(options.body);
  const signal = AbortSignal.timeout(30_000);
  let responseStatus: number | null = null;
  let requestId: string | undefined;

  try {
    const response = await fetch(url, {
      method: options.method ?? "GET", headers, body, signal,
      cache: "no-store", redirect: "error",
    });
    responseStatus = response.status;
    requestId = response.headers.get("x-request-id") ?? undefined;
    if (response.status === 204) return undefined as T;

    // Read text first so HTML errors and empty responses become normalized errors.
    const text = await response.text();
    let data: unknown;
    try {
      data = JSON.parse(text);
    } catch {
      throw new ApiError({
        status: response.status,
        code: response.ok ? "INVALID_RESPONSE" : "HTTP_ERROR",
        message: response.ok ? "The API returned an invalid response." : "The API request failed.",
        requestId: response.headers.get("x-request-id") ?? undefined,
      });
    }
    if (!response.ok) {
      const error = isApiErrorResponse(data) ? data : undefined;
      throw new ApiError({
        status: response.status,
        code: error?.error.code ?? "HTTP_ERROR",
        message: error?.error.message ?? "The API request failed.",
        details: error?.error.details,
        requestId: error?.request_id ?? response.headers.get("x-request-id") ?? undefined,
      });
    }
    return data as T;
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError({
      status: responseStatus,
      requestId,
      code: signal.aborted ? "TIMEOUT" : "NETWORK_ERROR",
      message: signal.aborted ? "The API request timed out. Please try again." : "Unable to reach the API. Please try again.",
    });
  }
}
