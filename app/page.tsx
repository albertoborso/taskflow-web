import { redirect } from "next/navigation";
import { getSession } from "@/lib/server/auth/session";
import { SessionUnavailable } from "@/components/auth/session-unavailable";

export default async function Home() {
  const session = await getSession();
  if (session.status === "unavailable") return <main className="mx-auto max-w-lg px-6 py-16"><SessionUnavailable requestId={session.requestId} /></main>;
  redirect(session.status === "authenticated" ? "/dashboard" : "/login");
}
