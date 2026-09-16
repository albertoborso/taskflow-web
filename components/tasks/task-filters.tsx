"use client";

import { useState, useTransition, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { inputInstant, utcInput } from "@/lib/tasks/dates";
import { taskHref } from "@/lib/tasks/query";
import type { SearchParams } from "@/lib/projects/pagination";
import type { TaskFilters as Filters } from "@/lib/server/api/tasks";

export function TaskFilters({ projectId, params, filters }: { projectId: string; params: SearchParams; filters: Filters }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState("");
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setError("");
    const data = new FormData(event.currentTarget);
    let due: string | null;
    try { due = inputInstant(String(data.get("due_before") ?? "")); } catch {
      setError("Enter a valid due-before date and time in UTC."); return;
    }
    if (filters.due_before && due === new Date(filters.due_before).toISOString()) due = filters.due_before;
    const href = taskHref(projectId, params, { status: String(data.get("status") ?? ""), priority: String(data.get("priority") ?? ""), due_before: due, offset: "0" });
    startTransition(() => router.push(href, { scroll: false }));
  }
  return <form method="get" action={`/projects/${encodeURIComponent(projectId)}`} onSubmit={submit} className="space-y-3 rounded-lg bg-zinc-100 p-4 dark:bg-zinc-900" aria-busy={pending}>
    <fieldset disabled={pending} className="grid items-end gap-3 sm:grid-cols-2 lg:grid-cols-4">
      <legend className="mb-2 font-semibold">Filter tasks</legend>
      <div><label htmlFor="filter-status">Status</label><select id="filter-status" name="status" defaultValue={filters.status ?? ""} className="task-input"><option value="">All statuses</option><option value="todo">To do</option><option value="in_progress">In progress</option><option value="done">Done</option></select></div>
      <div><label htmlFor="filter-priority">Priority</label><select id="filter-priority" name="priority" defaultValue={filters.priority ?? ""} className="task-input"><option value="">All priorities</option><option value="1">1</option><option value="2">2</option><option value="3">3</option></select></div>
      <div><label htmlFor="filter-due">Due before (UTC)</label><input id="filter-due" name="due_before" type="datetime-local" step="any" defaultValue={utcInput(filters.due_before ?? null)} aria-invalid={Boolean(error)} aria-describedby={error ? "filter-date-error" : undefined} className="task-input" /></div>
      <button type="submit" className="rounded bg-foreground px-4 py-2 text-background">{pending ? "Filtering…" : "Apply filters"}</button>
    </fieldset>
    {error && <p id="filter-date-error" role="alert">{error}</p>}
    <button type="button" disabled={pending} className="underline underline-offset-4" onClick={() => startTransition(() => router.push(taskHref(projectId, params, { status: null, priority: null, due_before: null, offset: "0" }), { scroll: false }))}>Clear filters</button>
    <noscript>JavaScript is required to apply date filters correctly.</noscript>
  </form>;
}
