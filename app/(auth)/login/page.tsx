import { redirect } from "next/navigation";
import { PageHeading } from "@/components/ui/page-heading";
import { AuthForm } from "@/components/auth/auth-form";
import { SessionUnavailable } from "@/components/auth/session-unavailable";
import { getSession } from "@/lib/server/auth/session";

export default async function LoginPage({ searchParams }: PageProps<"/login">) {
  const session = await getSession();
  if (session.status === "authenticated") redirect("/dashboard");
  if (session.status === "unavailable") return <SessionUnavailable requestId={session.requestId} />;
  const params = await searchParams;
  return <>
    <PageHeading title="Log in" description="Welcome back to TaskFlow." />
    {params.registered === "1" && <p role="status" className="mt-4">Account created. Log in to continue.</p>}
    {(session.expired || params.expired === "1") && <p role="status" className="mt-4">Your session has expired or is invalid. Please log in again.</p>}
    {session.requestId && <p className="mt-2 text-sm">Support reference: {session.requestId}</p>}
    <AuthForm mode="login" />
  </>;
}
