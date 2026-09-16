"use client";

import { useId, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { TaskForm } from "./task-form";
import { deleteTask } from "@/lib/api/tasks";
import { ApiError } from "@/lib/api/error";
import { displayInstant } from "@/lib/tasks/dates";
import type { Task } from "@/types/domain";

const statuses = { todo: "To do", in_progress: "In progress", done: "Done" };
export function TaskCard({ task }: { task: Task }) {
  const labelId = useId();
  const router = useRouter();
  const busy = useRef(false);
  const [editing, setEditing] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState("");
  const [requestId, setRequestId] = useState<string>();
  const editButton = useRef<HTMLButtonElement>(null);
  const deleteButton = useRef<HTMLButtonElement>(null);
  function closeEdit() { setEditing(false); editButton.current?.focus(); }
  async function remove() {
    if (busy.current) return;
    busy.current = true; setPending(true); setMessage(""); setRequestId(undefined);
    try {
      await deleteTask(task.id);
      setMessage("Task deleted.");
      document.getElementById("tasks-title")?.focus();
      router.refresh();
    } catch (error) {
      setMessage(error instanceof ApiError ? error.message : "Unable to confirm deletion. Reload and check before retrying.");
      if (error instanceof ApiError) setRequestId(error.requestId);
      busy.current = false; setPending(false);
    }
  }
  return <article aria-labelledby={labelId} className="min-w-0 space-y-4 rounded-xl border border-zinc-300 bg-white p-5 dark:border-zinc-700 dark:bg-zinc-950">
    <div className="flex flex-wrap items-start justify-between gap-3">
      <h3 id={labelId} className="min-w-0 break-words text-lg font-semibold">{task.title}</h3>
      <span className="rounded-full bg-zinc-100 px-3 py-1 text-sm font-medium dark:bg-zinc-800">{statuses[task.status]}</span>
    </div>
    <p className="whitespace-pre-wrap break-words text-zinc-600 dark:text-zinc-400">{task.description || "No description."}</p>
    <dl className="grid gap-3 text-sm sm:grid-cols-3">
      <div><dt className="font-medium">Priority</dt><dd>{task.priority}</dd></div>
      <div><dt className="font-medium">Due</dt><dd>{displayInstant(task.due_at)}</dd></div>
      <div><dt className="font-medium">Completed</dt><dd>{task.completed_at ? displayInstant(task.completed_at) : "Not completed"}</dd></div>
    </dl>
    <div className="flex flex-wrap gap-5">
      <button ref={editButton} type="button" disabled={confirming || pending} aria-expanded={editing} onClick={() => setEditing(!editing)} className="underline underline-offset-4">{editing ? "Close editor" : "Edit task"}</button>
      <button ref={deleteButton} type="button" disabled={editing || pending} aria-expanded={confirming} onClick={() => setConfirming(!confirming)} className="underline underline-offset-4">Delete task</button>
    </div>
    {editing && <section aria-label={`Edit ${task.title}`} className="border-t border-zinc-300 pt-4 dark:border-zinc-700">
      <TaskForm projectId={task.project_id} task={task} onSaved={() => { closeEdit(); setMessage("Task saved."); }} />
    </section>}
    {confirming && <section aria-label="Confirm task deletion" className="space-y-3 rounded-lg border border-red-300 p-4">
      <p>Delete “{task.title}”? This cannot be undone.</p>
      <div className="flex gap-4">
        <button type="button" disabled={pending} onClick={remove} className="rounded bg-red-700 px-4 py-2 text-white">{pending ? "Deleting…" : "Confirm deletion"}</button>
        <button type="button" disabled={pending} onClick={() => { setConfirming(false); deleteButton.current?.focus(); }} className="underline">Cancel</button>
      </div>
    </section>}
    {message && <p role="status">{message}</p>}
    {requestId && <p className="text-sm">Support reference: {requestId}</p>}
  </article>;
}
