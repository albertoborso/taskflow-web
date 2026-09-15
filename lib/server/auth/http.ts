import "server-only";
import { safeRequestId } from "./request-id";
import { ApiError } from "@/lib/api/error";
import { getAppOrigin } from "@/lib/server/config";
import type { AuthMode, FieldErrors } from "@/lib/auth/validation";

export function authJson(body: unknown, status = 200) {
  return Response.json(body, { status, headers: { "Cache-Control": "no-store" } });
}

export function checkAuthRequest(request: Request): Response | undefined {
  if (request.headers.get("origin") !== getAppOrigin(request.url)) {
    return authJson({ message: "Request origin is not allowed." }, 403);
  }
  if (request.headers.get("content-type")?.split(";")[0].trim().toLowerCase() !== "application/json") {
    return authJson({ message: "Send a JSON request." }, 415);
  }
}

export function authFailure(error: unknown, mode: AuthMode | "logout") {
  const requestId = error instanceof ApiError ? safeRequestId(error.requestId) : undefined;
  function failure(body: unknown, status: number) {
    const response = authJson(body, status);
    if (requestId) response.headers.set("X-Request-ID", requestId);
    return response;
  }
  if (error instanceof ApiError) {
    if (error.status === 401) return failure({ message: "Email or password is incorrect." }, 401);
    if (error.status === 409 && mode === "register") {
      return failure({ message: "An account with this email already exists.", fieldErrors: { email: "Try logging in instead." } }, 409);
    }
    if (error.status === 422) {
      const fieldErrors: FieldErrors = {};
      for (const detail of error.details) {
        const field = detail.loc.find((part) => part === "email" || part === "password" || part === "display_name");
        if (field === "email") fieldErrors.email = "Enter a valid email address.";
        if (field === "password") fieldErrors.password = mode === "register" ? "Use a password with 15–128 characters." : "Check your password.";
        if (field === "display_name") fieldErrors.display_name = "Use a name with 1–100 characters.";
      }
      return failure({ message: "Please check your details.", fieldErrors }, 422);
    }
    if (error.status === 429) return failure({ message: "Too many attempts. Please wait before trying again." }, 429);
  }
  // Never forward upstream messages, response bodies, or credentials.
  return failure({ message: "Account services are temporarily unavailable. Please try again." }, 503);
}
