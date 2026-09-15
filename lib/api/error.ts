import type { ValidationDetail } from "@/types/api";

export interface ApiErrorOptions {
  // null means no HTTP response was received.
  status: number | null;
  code: string;
  message: string;
  details?: ValidationDetail[];
  requestId?: string;
}

export class ApiError extends Error {
  readonly status: number | null;
  readonly code: string;
  readonly details: ValidationDetail[];
  readonly requestId?: string;

  constructor(options: ApiErrorOptions) {
    super(options.message);
    this.name = "ApiError";
    this.status = options.status;
    this.code = options.code;
    this.details = options.details ?? [];
    this.requestId = options.requestId;
  }
}
