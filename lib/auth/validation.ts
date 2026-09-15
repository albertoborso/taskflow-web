import type { RegisterInput } from "@/types/domain";

export type AuthField = "email" | "password" | "display_name";
export type FieldErrors = Partial<Record<AuthField, string>>;
export type AuthMode = "login" | "register";

export function validateAuthInput(value: unknown, mode: AuthMode):
  | { data: RegisterInput; errors?: never }
  | { errors: FieldErrors; data?: never } {
  const input = typeof value === "object" && value !== null ? value as Record<string, unknown> : {};
  const email = typeof input.email === "string" ? input.email.trim() : "";
  const password = typeof input.password === "string" ? input.password : "";
  const display_name = typeof input.display_name === "string" ? input.display_name.trim() : "";
  const errors: FieldErrors = {};
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.email = "Enter a valid email address.";
  const minimum = mode === "register" ? 15 : 1;
  if ([...password].length < minimum || [...password].length > 128) {
    errors.password = mode === "register" ? "Use 15–128 characters." : "Enter your password (up to 128 characters).";
  }
  if (mode === "register" && (!display_name || [...display_name].length > 100)) {
    errors.display_name = "Use 1–100 characters for your name.";
  }
  return Object.keys(errors).length ? { errors } : { data: { email, password, display_name } };
}
