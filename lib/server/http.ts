import "server-only";
import { getAppOrigin } from "./config";

export function jsonResponse(body: unknown, status = 200) {
  return Response.json(body, { status, headers: { "Cache-Control": "no-store" } });
}

export function checkMutationRequest(request: Request): Response | undefined {
  if (request.headers.get("origin") !== getAppOrigin(request.url)) {
    return jsonResponse({ message: "Request origin is not allowed." }, 403);
  }
  if (request.headers.get("content-type")?.split(";")[0].trim().toLowerCase() !== "application/json") {
    return jsonResponse({ message: "Send a JSON request." }, 415);
  }
}
