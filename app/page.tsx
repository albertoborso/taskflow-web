import Link from "next/link";
import { PageHeading } from "@/components/ui/page-heading";

export default function Home() {
  return (
    <main className="mx-auto w-full max-w-3xl space-y-8 px-6 py-20">
      <PageHeading title="TaskFlow" description="A workspace for your projects and tasks. Coming soon." />
      <nav aria-label="Explore TaskFlow" className="flex flex-wrap gap-6">
        <Link href="/login" className="underline underline-offset-4">Log in</Link>
        <Link href="/register" className="underline underline-offset-4">Register</Link>
        <Link href="/dashboard" className="underline underline-offset-4">Dashboard preview</Link>
      </nav>
    </main>
  );
}
