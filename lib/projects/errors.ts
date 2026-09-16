export const UNCERTAIN_WRITE_MESSAGE = "The operation may have completed. Reload and check the result before trying again.";

export const PROJECT_FAILURE_CODES = [
  "BAD_REQUEST", "UNAUTHORIZED", "FORBIDDEN", "NOT_FOUND", "CONFLICT",
  "VALIDATION_ERROR", "RATE_LIMITED", "SERVICE_UNAVAILABLE",
  "UPSTREAM_TIMEOUT", "UPSTREAM_NETWORK_ERROR",
] as const;
export type ProjectFailureCode = typeof PROJECT_FAILURE_CODES[number];
