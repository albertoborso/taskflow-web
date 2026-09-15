import "server-only";
import { apiFetch } from "./client";
import type { User } from "@/types/domain";

export function getCurrentUser(token: string): Promise<User> {
  return apiFetch<User>("/api/v1/users/me", { token });
}
