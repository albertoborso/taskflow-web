import Link from "next/link";
import { getSession, requireSession } from "@/lib/server/auth/session";
import { LogoutButton } from "@/components/auth/logout-button";
import { SessionUnavailable } from "@/components/auth/session-unavailable";

export default async function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (session.status === "unavailable") return <main className="mx-auto max-w-lg px-6 py-16"><SessionUnavailable requestId={session.requestId} /></main>;
  const { user } = await requireSession();
  return (
    <div className="mx-auto w-full max-w-5xl space-y-12 px-6 py-10">
      <nav aria-label="Main navigation" className="flex flex-wrap items-center gap-6">
        <Link href="/" className="font-semibold underline underline-offset-4">TaskFlow</Link>
        <Link href="/dashboard" className="underline underline-offset-4">Dashboard</Link>
        <span className="ml-auto">{user.display_name}</span>
        <LogoutButton />
      </nav>
      <main>{children}</main>
    </div>
  );
}
