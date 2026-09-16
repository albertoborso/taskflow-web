import Link from "next/link";

export function ProjectError({ message, requestId }: { message: string; requestId?: string }) {
  return <section className="space-y-3">
    <p role="alert">{message}</p>
    {requestId && <p className="text-sm">Support reference: {requestId}</p>}
    <p><a href="" className="underline underline-offset-4">Reload</a></p>
    <Link href="/dashboard" className="underline underline-offset-4">Back to projects</Link>
  </section>;
}
