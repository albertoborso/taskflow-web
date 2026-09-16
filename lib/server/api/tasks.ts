import "server-only";
import { authenticatedFetch } from "@/lib/server/auth/session";
import type { Page, PaginationParams } from "@/types/api";
import type { Task, TaskPriority, TaskStatus, TaskCreateInput, TaskUpdateInput } from "@/types/domain";

export interface TaskFilters extends PaginationParams {
  status?: TaskStatus;
  priority?: TaskPriority;
  due_before?: string;
}

export function listTasks(projectId: string, filters: TaskFilters = {}): Promise<Page<Task>> {
  return authenticatedFetch<Page<Task>>(`/api/v1/projects/${encodeURIComponent(projectId)}/tasks`, {
    query: { ...filters },
  });
}

export function getTask(id: string): Promise<Task> {
  return authenticatedFetch<Task>(`/api/v1/tasks/${encodeURIComponent(id)}`);
}

export function createTask(projectId: string, input: TaskCreateInput): Promise<Task> {
  return authenticatedFetch<Task>(`/api/v1/projects/${encodeURIComponent(projectId)}/tasks`, { method: "POST", body: input });
}

export function updateTask(id: string, input: TaskUpdateInput): Promise<Task> {
  return authenticatedFetch<Task>(`/api/v1/tasks/${encodeURIComponent(id)}`, { method: "PATCH", body: input });
}

export function deleteTask(id: string): Promise<void> {
  return authenticatedFetch<void>(`/api/v1/tasks/${encodeURIComponent(id)}`, { method: "DELETE" });
}
