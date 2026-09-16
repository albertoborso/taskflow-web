import { mutateResource } from "./mutation";
import { TASK_FIELDS } from "@/lib/tasks/validation";
import type { TaskCreateInput, TaskUpdateInput } from "@/types/domain";

export function createTask(projectId: string, input: TaskCreateInput) {
  return mutateResource(`/api/projects/${encodeURIComponent(projectId)}/tasks`, "POST", input, TASK_FIELDS);
}
export function updateTask(id: string, input: TaskUpdateInput) {
  return mutateResource(`/api/tasks/${encodeURIComponent(id)}`, "PATCH", input, TASK_FIELDS);
}
export function deleteTask(id: string) {
  return mutateResource(`/api/tasks/${encodeURIComponent(id)}`, "DELETE", {}, TASK_FIELDS);
}
