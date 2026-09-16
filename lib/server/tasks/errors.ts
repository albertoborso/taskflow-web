import "server-only";
import { ApiError } from "@/lib/api/error";
import { projectFailure } from "@/lib/server/projects/errors";
import { jsonResponse } from "@/lib/server/http";
import { TASK_FIELDS, type TaskFieldErrors } from "@/lib/tasks/validation";

export function taskFailure(error: unknown, mutation = false) {
  const failure = projectFailure(error, mutation);
  const fieldErrors: TaskFieldErrors = {};
  if (error instanceof ApiError && failure.status === 422) for (const detail of error.details) {
    for (const field of TASK_FIELDS) if (detail.loc.includes(field)) fieldErrors[field] = `Check the task ${field === "due_at" ? "due date and timezone" : field}.`;
  }
  return { ...failure, message: failure.message.replaceAll("project", "task").replaceAll("Project", "Task"), fieldErrors };
}
export function taskErrorResponse(error: unknown) {
  const failure = taskFailure(error, true);
  const response = jsonResponse(failure, failure.status);
  if (failure.requestId) response.headers.set("X-Request-ID", failure.requestId);
  return response;
}
