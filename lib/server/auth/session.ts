import "server-only";
import { cache } from "react";
import { redirect } from "next/navigation";
import { ApiError } from "@/lib/api/error";
import { apiFetch, type RequestOptions } from "@/lib/server/api/client";
import { getCurrentUser } from "@/lib/server/api/auth";
import { safeRequestId } from "./request-id";
import { readSessionToken } from "./cookies";
import type { User } from "@/types/domain";

type Session =
  | { status: "authenticated"; user: User; token: string }
  | { status: "anonymous"; expired: boolean; requestId?: string }
  | { status: "unavailable"; requestId?: string };

// React cache deduplicates within one server render, not between users/requests.
// This result contains a credential: never pass the session to Client Components.
export const getSession = cache(async (): Promise<Session> => {
  const token = await readSessionToken();
  if (!token) return { status: "anonymous", expired: false };
  try {
    return { status: "authenticated", user: await getCurrentUser(token), token };
  } catch (error) {
    const requestId = error instanceof ApiError ? safeRequestId(error.requestId) : undefined;
    if (error instanceof ApiError && error.status === 401) {
      return { status: "anonymous", expired: true, requestId };
    }
    return { status: "unavailable", requestId };
  }
});

// No navigation here: safe for JSON Route Handlers and domain operations.
export async function verifySession() {
  const session = await getSession();
  if (session.status === "anonymous") {
    throw new ApiError({ status: 401, code: session.expired ? "UNAUTHORIZED" : "SESSION_MISSING", message: "Please log in again.", requestId: session.requestId });
  }
  if (session.status === "unavailable") {
    throw new ApiError({ status: 503, code: "SESSION_UNAVAILABLE", message: "Unable to verify your session. Please try again.", requestId: session.requestId });
  }
  return session;
}

// Page-only adapter. JSON handlers must use verifySession instead.
export async function requireSession() {
  try {
    return await verifySession();
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) redirect(error.code === "SESSION_MISSING" ? "/login" : "/login?expired=1");
    throw error;
  }
}

export async function authenticatedFetch<T>(
  path: `/api/v1/${string}`,
  options: Omit<RequestOptions, "token"> = {},
): Promise<T> {
  const { token } = await verifySession();
  return apiFetch<T>(path, { ...options, token });
}
