import "server-only";
import { apiFetch } from "./client";
import type { Page, PaginationParams } from "@/types/api";
import type { Task, TaskPriority, TaskStatus } from "@/types/domain";

export interface TaskFilters extends PaginationParams {
  status?: TaskStatus;
  priority?: TaskPriority;
  due_before?: string;
}

export function listTasks(token: string, projectId: string, filters: TaskFilters = {}): Promise<Page<Task>> {
  return apiFetch<Page<Task>>(`/api/v1/projects/${encodeURIComponent(projectId)}/tasks`, {
    token, query: { ...filters },
  });
}

export function getTask(token: string, id: string): Promise<Task> {
  return apiFetch<Task>(`/api/v1/tasks/${encodeURIComponent(id)}`, { token });
}
