import { clearSessionToken } from "@/lib/server/auth/cookies";
import { authFailure, authJson, checkAuthRequest } from "@/lib/server/auth/http";

export async function POST(request: Request) {
  try {
    const rejected = checkAuthRequest(request);
    if (rejected) return rejected;
    await clearSessionToken();
    return authJson({ success: true });
  } catch (error) {
    return authFailure(error, "logout");
  }
}
