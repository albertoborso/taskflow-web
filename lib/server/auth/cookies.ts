import "server-only";
import { cookies } from "next/headers";

const SESSION_COOKIE = "taskflow_session";
const options = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
};

export async function readSessionToken(): Promise<string | undefined> {
  return (await cookies()).get(SESSION_COOKIE)?.value;
}

// Call writes only inside Route Handlers, never while rendering a page.
export async function setSessionToken(token: string, expiresIn: number) {
  (await cookies()).set(SESSION_COOKIE, token, { ...options, maxAge: expiresIn });
}

export async function clearSessionToken() {
  (await cookies()).set(SESSION_COOKIE, "", { ...options, maxAge: 0 });
}
