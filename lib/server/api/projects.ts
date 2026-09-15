import "server-only";
import { authenticatedFetch } from "@/lib/server/auth/session";
import type { Page, PaginationParams } from "@/types/api";
import type { Project } from "@/types/domain";

export function listProjects(pagination: PaginationParams = {}): Promise<Page<Project>> {
  return authenticatedFetch<Page<Project>>("/api/v1/projects", { ...pagination });
}

export function getProject(id: string): Promise<Project> {
  return authenticatedFetch<Project>(`/api/v1/projects/${encodeURIComponent(id)}`);
}
