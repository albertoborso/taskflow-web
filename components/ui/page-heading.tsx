export function PageHeading({ title, description }: { title: string; description: string }) {
  return (
    <header className="space-y-3">
      <h1 className="text-3xl font-semibold tracking-tight">{title}</h1>
      <p className="max-w-xl text-base leading-7 text-zinc-600 dark:text-zinc-400">{description}</p>
    </header>
  );
}
