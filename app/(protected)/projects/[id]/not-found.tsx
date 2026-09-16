import Link from "next/link";
export default function ProjectNotFound() {
  return <section className="space-y-4"><h1 className="text-2xl font-semibold">Project unavailable</h1>
    <p>This project is unavailable or no longer exists.</p>
    <Link href="/dashboard" className="underline">Back to projects</Link>
  </section>;
}
