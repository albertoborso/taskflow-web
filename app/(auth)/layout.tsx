import Link from "next/link";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="mx-auto w-full max-w-lg space-y-10 px-6 py-16">
      <Link href="/" className="font-semibold underline underline-offset-4">TaskFlow</Link>
      {children}
    </main>
  );
}
