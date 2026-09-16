import { createTask } from "@/lib/server/api/tasks";
import { checkMutationRequest, jsonResponse } from "@/lib/server/http";
import { taskErrorResponse } from "@/lib/server/tasks/errors";
import { validateCreateTask } from "@/lib/tasks/validation";

export async function POST(request: Request, context: RouteContext<"/api/projects/[id]/tasks">) {
  try {
    const rejected = checkMutationRequest(request);
    if (rejected) return rejected;
    const { id } = await context.params;
    const input = await request.json().catch(() => null);
    if (!input || typeof input !== "object" || Array.isArray(input)) return jsonResponse({ message: "Send a valid JSON object." }, 400);
    const result = validateCreateTask(input);
    if (result.errors) return jsonResponse({ message: "Please check the task details.", fieldErrors: result.errors }, 422);
    const task = await createTask(id, result.data);
    return jsonResponse({ id: task.id }, 201);
  } catch (error) { return taskErrorResponse(error); }
}
