import type { TaskCreateInput, TaskUpdateInput } from "@/types/domain";
import { isInstant } from "./dates";

export const TASK_FIELDS = ["title", "description", "status", "priority", "due_at"] as const;
export const TASK_STATUSES = ["todo", "in_progress", "done"] as const;
export type TaskField = typeof TASK_FIELDS[number];
export type TaskFieldErrors = Partial<Record<TaskField, string>>;
type Result<T> = { data: T; errors?: never } | { data?: never; errors: TaskFieldErrors };

function fields(value: unknown, creating: boolean): Result<TaskUpdateInput> {
  const input = typeof value === "object" && value !== null ? value as Record<string, unknown> : {};
  const data: TaskUpdateInput = {};
  const errors: TaskFieldErrors = {};
  if (creating || Object.hasOwn(input, "title")) {
    if (!creating && input.title === null) data.title = null;
    else if (typeof input.title !== "string" || !input.title.trim() || [...input.title.trim()].length > 200) errors.title = "Use a title with 1–200 characters.";
    else data.title = input.title.trim();
  }
  if (Object.hasOwn(input, "description")) {
    if (input.description === null || typeof input.description === "string") data.description = input.description;
    else errors.description = "Enter a text description.";
  }
  if (Object.hasOwn(input, "status")) {
    if (!creating && input.status === null) data.status = null;
    else if (input.status === "todo" || input.status === "in_progress" || input.status === "done") data.status = input.status;
    else errors.status = "Choose To do, In progress, or Done.";
  }
  if (Object.hasOwn(input, "priority")) {
    if (!creating && input.priority === null) data.priority = null;
    else if (input.priority === 1 || input.priority === 2 || input.priority === 3) data.priority = input.priority;
    else errors.priority = "Choose priority 1, 2, or 3.";
  }
  if (Object.hasOwn(input, "due_at")) {
    if (input.due_at === null || isInstant(input.due_at)) data.due_at = input.due_at;
    else errors.due_at = "Use a valid timestamp with Z or an explicit timezone offset, or null.";
  }
  return Object.keys(errors).length ? { errors } : { data };
}

export function validateCreateTask(value: unknown): Result<TaskCreateInput> {
  const result = fields(value, true);
  if (result.errors) return { errors: result.errors };
  return { data: result.data as TaskCreateInput };
}

export function validateUpdateTask(value: unknown): Result<TaskUpdateInput> {
  return fields(value, false);
}
