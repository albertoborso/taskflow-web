import "server-only";
import { authenticatedFetch } from "@/lib/server/auth/session";
import type { Page, PaginationParams } from "@/types/api";
import type { Project, ProjectCreateInput, ProjectUpdateInput } from "@/types/domain";

export function listProjects(pagination: PaginationParams = {}): Promise<Page<Project>> {
  return authenticatedFetch<Page<Project>>("/api/v1/projects", { query: { ...pagination } });
}

export function getProject(id: string): Promise<Project> {
  return authenticatedFetch<Project>(`/api/v1/projects/${encodeURIComponent(id)}`);
}

export function createProject(input: ProjectCreateInput): Promise<Project> {
  return authenticatedFetch<Project>("/api/v1/projects", { method: "POST", body: input });
}

export function updateProject(id: string, input: ProjectUpdateInput): Promise<Project> {
  return authenticatedFetch<Project>(`/api/v1/projects/${encodeURIComponent(id)}`, { method: "PATCH", body: input });
}

export function deleteProject(id: string): Promise<void> {
  return authenticatedFetch<void>(`/api/v1/projects/${encodeURIComponent(id)}`, { method: "DELETE" });
}
