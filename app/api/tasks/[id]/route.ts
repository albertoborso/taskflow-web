import { updateTask, deleteTask } from "@/lib/server/api/tasks";
import { checkMutationRequest, jsonResponse } from "@/lib/server/http";
import { taskErrorResponse } from "@/lib/server/tasks/errors";
import { validateUpdateTask } from "@/lib/tasks/validation";

export async function PATCH(request: Request, context: RouteContext<"/api/tasks/[id]">) {
  try {
    const rejected = checkMutationRequest(request);
    if (rejected) return rejected;
    const { id } = await context.params;
    const input = await request.json().catch(() => null);
    if (!input || typeof input !== "object" || Array.isArray(input)) return jsonResponse({ message: "Send a valid JSON object." }, 400);
    const result = validateUpdateTask(input);
    if (result.errors) return jsonResponse({ message: "Please check the task details.", fieldErrors: result.errors }, 422);
    await updateTask(id, result.data);
    return jsonResponse({ success: true });
  } catch (error) { return taskErrorResponse(error); }
}
export async function DELETE(request: Request, context: RouteContext<"/api/tasks/[id]">) {
  try {
    const rejected = checkMutationRequest(request);
    if (rejected) return rejected;
    const { id } = await context.params;
    await deleteTask(id);
    return new Response(null, { status: 204, headers: { "Cache-Control": "no-store" } });
  } catch (error) { return taskErrorResponse(error); }
}
