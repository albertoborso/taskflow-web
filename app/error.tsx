"use client";
export default function ErrorPage({ reset }: { reset: () => void }) {
  return <main className="mx-auto max-w-lg space-y-4 px-6 py-16">
    <h1 className="text-2xl font-semibold">Unable to load this page</h1>
    <p role="alert">Account services may be unavailable. Please try again.</p>
    <button onClick={reset} className="underline underline-offset-4">Try again</button>
    <p><a href="/login" className="underline underline-offset-4">Go to login</a></p>
  </main>;
}
