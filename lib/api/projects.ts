import { mutateResource } from "./mutation";
import type { ProjectCreateInput, ProjectUpdateInput } from "@/types/domain";

export function mutateProject(method: "POST" | "PATCH" | "DELETE", id?: string, input?: ProjectCreateInput | ProjectUpdateInput) {
  return mutateResource(id ? `/api/projects/${encodeURIComponent(id)}` : "/api/projects", method, input, ["name", "description"]);
}
