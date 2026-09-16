import { updateProject, deleteProject } from "@/lib/server/api/projects";
import { checkMutationRequest, jsonResponse } from "@/lib/server/http";
import { projectErrorResponse } from "@/lib/server/projects/errors";
import { validateUpdateProject } from "@/lib/projects/validation";

export async function PATCH(request: Request, context: RouteContext<"/api/projects/[id]">) {
  try {
    const rejected = checkMutationRequest(request);
    if (rejected) return rejected;
    const { id } = await context.params;
    const input = await request.json().catch(() => null);
    if (!input || typeof input !== "object" || Array.isArray(input)) return jsonResponse({ message: "Send a valid JSON object." }, 400);
    const result = validateUpdateProject(input);
    if (result.errors) return jsonResponse({ message: "Please check the project details.", fieldErrors: result.errors }, 422);
    await updateProject(id, result.data);
    return jsonResponse({ success: true });
  } catch (error) {
    return projectErrorResponse(error);
  }
}

export async function DELETE(request: Request, context: RouteContext<"/api/projects/[id]">) {
  try {
    const rejected = checkMutationRequest(request);
    if (rejected) return rejected;
    const { id } = await context.params;
    await deleteProject(id);
    return new Response(null, { status: 204, headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    return projectErrorResponse(error);
  }
}
