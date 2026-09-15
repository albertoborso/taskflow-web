import Link from "next/link";

// Organizational group only: authentication is intentionally deferred.
export default function ProtectedLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto w-full max-w-5xl space-y-12 px-6 py-10">
      <nav aria-label="Main navigation" className="flex gap-6">
        <Link href="/" className="font-semibold underline underline-offset-4">TaskFlow</Link>
        <Link href="/dashboard" className="underline underline-offset-4">Dashboard</Link>
      </nav>
      <main>{children}</main>
    </div>
  );
}
