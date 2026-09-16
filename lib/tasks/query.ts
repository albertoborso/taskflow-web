import { projectPagination, type SearchParams } from "@/lib/projects/pagination";
import { isInstant } from "./dates";
import type { TaskPriority, TaskStatus } from "@/types/domain";

export function taskQuery(params: SearchParams) {
  const filters: { limit: number; offset: number; status?: TaskStatus; priority?: TaskPriority; due_before?: string } = projectPagination(params);
  let invalid = false;
  if (params.status) {
    if (params.status === "todo" || params.status === "in_progress" || params.status === "done") filters.status = params.status;
    else invalid = true;
  }
  if (params.priority) {
    if (params.priority === "1" || params.priority === "2" || params.priority === "3") filters.priority = Number(params.priority) as TaskPriority;
    else invalid = true;
  }
  if (params.due_before) {
    if (isInstant(params.due_before)) filters.due_before = params.due_before;
    else invalid = true;
  }
  return { filters, invalid };
}

export function taskHref(projectId: string, params: SearchParams, changes: Record<string, string | null>) {
  const query = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (Array.isArray(value)) value.forEach(item => query.append(key, item));
    else if (value !== undefined) query.set(key, value);
  }
  for (const [key, value] of Object.entries(changes)) {
    if (value === null || value === "") query.delete(key);
    else query.set(key, value);
  }
  return `/projects/${encodeURIComponent(projectId)}?${query}`;
}
