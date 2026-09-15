import "server-only";
import { authenticatedFetch } from "@/lib/server/auth/session";
import type { Page, PaginationParams } from "@/types/api";
import type { Task, TaskPriority, TaskStatus } from "@/types/domain";

export interface TaskFilters extends PaginationParams {
  status?: TaskStatus;
  priority?: TaskPriority;
  due_before?: string;
}

export function listTasks(projectId: string, filters: TaskFilters = {}): Promise<Page<Task>> {
  return authenticatedFetch<Page<Task>>(`/api/v1/projects/${encodeURIComponent(projectId)}/tasks`, {
    ...filters,
  });
}

export function getTask(id: string): Promise<Task> {
  return authenticatedFetch<Task>(`/api/v1/tasks/${encodeURIComponent(id)}`);
}
