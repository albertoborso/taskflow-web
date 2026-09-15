import "server-only";
import { apiFetch } from "./client";
import { ApiError } from "@/lib/api/error";
import type { LoginInput, RegisterInput, TokenResponse, User } from "@/types/domain";

function invalidResponse(): never {
  throw new ApiError({ status: 502, code: "INVALID_RESPONSE", message: "Invalid account response." });
}

export async function getCurrentUser(token: string): Promise<User> {
  const user = await apiFetch<User>("/api/v1/users/me", { token });
  if (!user || [user.id, user.email, user.display_name, user.created_at, user.updated_at].some(value => typeof value !== "string")) {
    invalidResponse();
  }
  // Explicit projection prevents unexpected upstream fields reaching the UI.
  return { id: user.id, email: user.email, display_name: user.display_name, created_at: user.created_at, updated_at: user.updated_at };
}

export async function registerUser(input: RegisterInput): Promise<void> {
  await apiFetch<User>("/api/v1/users", { method: "POST", body: input });
}

export async function loginUser(input: LoginInput): Promise<TokenResponse> {
  const result = await apiFetch<TokenResponse>("/api/v1/auth/token", { method: "POST", body: input });
  if (!result || typeof result.access_token !== "string" ||
    !/^[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/.test(result.access_token) ||
    result.access_token.length > 3500 ||
    !Number.isSafeInteger(result.expires_in) || result.expires_in <= 0 ||
    (result.token_type !== undefined && result.token_type !== "bearer")) {
    invalidResponse();
  }
  return result;
}
