// Shared by server normalization and browser response handling.
// Only expose bounded opaque references, never arbitrary upstream text.
export function safeRequestId(value: unknown): string | undefined {
  return typeof value === "string" && /^[A-Za-z0-9][A-Za-z0-9_-]{0,127}$/.test(value)
    ? value
    : undefined;
}
