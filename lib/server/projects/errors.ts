import "server-only";
import { ApiError } from "@/lib/api/error";
import { safeRequestId } from "@/lib/server/auth/request-id";
import { jsonResponse } from "@/lib/server/http";
import { UNCERTAIN_WRITE_MESSAGE, type ProjectFailureCode } from "@/lib/projects/errors";
import type { ProjectFieldErrors } from "@/lib/projects/validation";

export function projectFailure(error: unknown, mutation = false) {
  const api = error instanceof ApiError ? error : undefined;
  const status = api?.status && [400,401,403,404,409,422,429].includes(api.status) ? api.status : 503;
  const codes: Record<number, ProjectFailureCode> = {
    400: "BAD_REQUEST", 401: "UNAUTHORIZED", 403: "FORBIDDEN", 404: "NOT_FOUND",
    409: "CONFLICT", 422: "VALIDATION_ERROR", 429: "RATE_LIMITED", 503: "SERVICE_UNAVAILABLE",
  };
  const code = status === 503 && api?.code === "TIMEOUT" ? "UPSTREAM_TIMEOUT"
    : status === 503 && api?.code === "NETWORK_ERROR" ? "UPSTREAM_NETWORK_ERROR" : codes[status];
  const uncertain = mutation && (code === "UPSTREAM_TIMEOUT" || code === "UPSTREAM_NETWORK_ERROR");
  const messages: Record<number, string> = {
    400: "Send a valid JSON object.",
    401: "Your session has expired. Please log in again.",
    403: "You do not have access to this project.",
    404: "This project is unavailable or no longer exists.",
    409: "This change conflicts with the current project. Reload and try again.",
    422: "Please check the project details.",
    429: "Too many requests. Please wait before trying again.",
    503: "Project services are temporarily unavailable. Please try again.",
  };
  const fieldErrors: ProjectFieldErrors = {};
  if (status === 422) for (const detail of api?.details ?? []) {
    if (detail.loc.includes("name")) fieldErrors.name = "Use a project name with 1–150 characters.";
    if (detail.loc.includes("description")) fieldErrors.description = "Check the project description.";
  }
  return { status, code, message: uncertain ? UNCERTAIN_WRITE_MESSAGE : messages[status], fieldErrors, requestId: safeRequestId(api?.requestId) };
}

export function projectErrorResponse(error: unknown) {
  const failure = projectFailure(error, true);
  const response = jsonResponse(failure, failure.status);
  if (failure.requestId) response.headers.set("X-Request-ID", failure.requestId);
  return response;
}
