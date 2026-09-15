import "server-only";
import { apiFetch } from "./client";
import type { Page, PaginationParams } from "@/types/api";
import type { Project } from "@/types/domain";

export function listProjects(token: string, pagination: PaginationParams = {}): Promise<Page<Project>> {
  return apiFetch<Page<Project>>("/api/v1/projects", { token, query: { ...pagination } });
}

export function getProject(token: string, id: string): Promise<Project> {
  return apiFetch<Project>(`/api/v1/projects/${encodeURIComponent(id)}`, { token });
}
