import { registerUser } from "@/lib/server/api/auth";
import { validateAuthInput } from "@/lib/auth/validation";
import { authFailure, authJson, checkAuthRequest } from "@/lib/server/auth/http";

export async function POST(request: Request) {
  try {
    const rejected = checkAuthRequest(request);
    if (rejected) return rejected;
    const input = await request.json().catch(() => null);
    if (input === null) return authJson({ message: "Send a valid JSON object." }, 400);
    const result = validateAuthInput(input, "register");
    if (result.errors) return authJson({ message: "Please check your details.", fieldErrors: result.errors }, 422);
    await registerUser(result.data);
    return authJson({ success: true }, 201);
  } catch (error) {
    return authFailure(error, "register");
  }
}
