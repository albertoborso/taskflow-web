import { redirect } from "next/navigation";
import { PageHeading } from "@/components/ui/page-heading";
import { AuthForm } from "@/components/auth/auth-form";
import { SessionUnavailable } from "@/components/auth/session-unavailable";
import { getSession } from "@/lib/server/auth/session";

export default async function RegisterPage() {
  const session = await getSession();
  if (session.status === "authenticated") redirect("/dashboard");
  if (session.status === "unavailable") return <SessionUnavailable requestId={session.requestId} />;
  return <>
    <PageHeading title="Create an account" description="Get started with TaskFlow." />
    <AuthForm mode="register" />
  </>;
}
