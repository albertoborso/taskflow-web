import type { ProjectCreateInput, ProjectUpdateInput } from "@/types/domain";

export type ProjectFieldErrors = Partial<Record<"name" | "description", string>>;
type ValidationResult<T> = { data: T; errors?: never } | { errors: ProjectFieldErrors; data?: never };

function validateFields(value: unknown, creating: boolean): ValidationResult<ProjectUpdateInput> {
  const input = typeof value === "object" && value !== null ? value as Record<string, unknown> : {};
  const errors: ProjectFieldErrors = {};
  const data: ProjectUpdateInput = {};
  if (creating || Object.hasOwn(input, "name")) {
    // PATCH permits null according to the wire contract; FastAPI decides its meaning.
    if (!creating && input.name === null) data.name = null;
    else {
      const name = typeof input.name === "string" ? input.name.trim() : "";
      if (!name || [...name].length > 150) errors.name = "Use a project name with 1–150 characters.";
      else data.name = name;
    }
  }
  if (Object.hasOwn(input, "description")) {
    if (input.description === null || typeof input.description === "string") data.description = input.description;
    else errors.description = "Enter a text description.";
  }
  return Object.keys(errors).length ? { errors } : { data };
}

export function validateCreateProject(value: unknown): ValidationResult<ProjectCreateInput> {
  const result = validateFields(value, true);
  if (result.errors) return { errors: result.errors };
  // Creation validated a required string name above.
  return { data: { ...result.data, name: result.data.name as string } };
}

export function validateUpdateProject(value: unknown): ValidationResult<ProjectUpdateInput> {
  return validateFields(value, false);
}
