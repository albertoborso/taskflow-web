import { ApiError } from "./error";
import { safeRequestId } from "./request-id";
import { PROJECT_FAILURE_CODES, UNCERTAIN_WRITE_MESSAGE } from "@/lib/projects/errors";

export async function mutateResource(path: `/api/${string}`, method: "POST" | "PATCH" | "DELETE", input: unknown, fields: readonly string[]): Promise<{ id?: string }> {
  const signal = AbortSignal.timeout(70_000);
  let response: Response;
  try {
    response = await fetch(path, {
      method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(input ?? {}),
      redirect: "error", signal,
    });
  } catch {
    throw new ApiError({ status: null, code: signal.aborted ? "TIMEOUT" : "NETWORK_ERROR", message: UNCERTAIN_WRITE_MESSAGE });
  }
  const requestId = safeRequestId(response.headers.get("x-request-id"));
  if (response.status === 401) {
    window.location.replace("/login?expired=1");
    throw new ApiError({ status: 401, code: "UNAUTHORIZED", message: "Please log in again.", requestId });
  }
  if (response.status === 204) return {};
  let data;
  try { data = await response.json(); } catch (error) {
    throw new ApiError({ status: response.status, code: signal.aborted ? "TIMEOUT" : error instanceof SyntaxError ? "INVALID_RESPONSE" : "NETWORK_ERROR", message: UNCERTAIN_WRITE_MESSAGE, requestId });
  }
  if (!response.ok) {
    const code = PROJECT_FAILURE_CODES.find(value => value === data?.code) ?? "API_ERROR";
    throw new ApiError({ status: response.status, code,
      message: code === "UPSTREAM_TIMEOUT" || code === "UPSTREAM_NETWORK_ERROR" ? UNCERTAIN_WRITE_MESSAGE
        : typeof data?.message === "string" ? data.message : "Unable to complete this change.",
      requestId: requestId ?? safeRequestId(data?.requestId),
      details: Object.entries(data?.fieldErrors ?? {}).filter(([field,value]) => fields.includes(field) && typeof value === "string")
        .map(([field,msg]) => ({ type: "validation", loc: [field], msg: msg as string })),
    });
  }
  return data;
}
