export interface Page<T> {
  items: T[];
  limit: number;
  offset: number;
}

export interface PaginationParams {
  limit?: number;
  offset?: number;
}

export interface ValidationDetail {
  type: string;
  loc: (string | number)[];
  msg: string;
}

export interface ApiErrorResponse {
  error: { code: string; message: string; details?: ValidationDetail[] };
  request_id: string;
}
