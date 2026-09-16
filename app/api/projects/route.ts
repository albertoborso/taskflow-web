import { createProject } from "@/lib/server/api/projects";
import { checkMutationRequest, jsonResponse } from "@/lib/server/http";
import { projectErrorResponse } from "@/lib/server/projects/errors";
import { validateCreateProject } from "@/lib/projects/validation";

export async function POST(request: Request) {
  try {
    const rejected = checkMutationRequest(request);
    if (rejected) return rejected;
    const input = await request.json().catch(() => null);
    if (!input || typeof input !== "object" || Array.isArray(input)) return jsonResponse({ message: "Send a valid JSON object." }, 400);
    const result = validateCreateProject(input);
    if (result.errors) return jsonResponse({ message: "Please check the project details.", fieldErrors: result.errors }, 422);
    const project = await createProject(result.data);
    // Only the ID is needed for navigation; never forward arbitrary upstream fields.
    return jsonResponse({ id: project.id }, 201);
  } catch (error) {
    return projectErrorResponse(error);
  }
}
