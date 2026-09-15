import { loginUser } from "@/lib/server/api/auth";
import { validateAuthInput } from "@/lib/auth/validation";
import { setSessionToken } from "@/lib/server/auth/cookies";
import { authFailure, authJson, checkAuthRequest } from "@/lib/server/auth/http";

export async function POST(request: Request) {
  try {
    const rejected = checkAuthRequest(request);
    if (rejected) return rejected;
    const input = await request.json().catch(() => null);
    if (input === null) return authJson({ message: "Send a valid JSON object." }, 400);
    const result = validateAuthInput(input, "login");
    if (result.errors) return authJson({ message: "Please check your details.", fieldErrors: result.errors }, 422);
    const { email, password } = result.data;
    const token = await loginUser({ email, password });
    await setSessionToken(token.access_token, token.expires_in);
    return authJson({ success: true });
  } catch (error) {
    return authFailure(error, "login");
  }
}
