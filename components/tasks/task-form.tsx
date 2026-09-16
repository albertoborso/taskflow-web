"use client";

import { useId, useRef, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { ApiError } from "@/lib/api/error";
import { createTask, updateTask } from "@/lib/api/tasks";
import { inputInstant, utcInput } from "@/lib/tasks/dates";
import { TASK_FIELDS, validateCreateTask, validateUpdateTask, type TaskField, type TaskFieldErrors } from "@/lib/tasks/validation";
import type { Task, TaskUpdateInput } from "@/types/domain";

export function TaskForm({ projectId, task, onSaved }: { projectId: string; task?: Task; onSaved?: () => void }) {
  const prefix = useId();
  const router = useRouter();
  const busy = useRef(false);
  const [pending, setPending] = useState(false);
  const [errors, setErrors] = useState<TaskFieldErrors>({});
  const [message, setMessage] = useState("");
  const [requestId, setRequestId] = useState<string>();
  const fieldId = (field: TaskField) => `${prefix}-${field}`;
  const attributes = (field: TaskField) => ({ id: fieldId(field), name: field, "aria-invalid": Boolean(errors[field]), "aria-describedby": errors[field] ? `${fieldId(field)}-error` : field === "due_at" ? `${prefix}-utc` : undefined });
  const errorFor = (field: TaskField) => errors[field] && <p id={`${fieldId(field)}-error`} role="alert" className="text-sm text-red-700 dark:text-red-400">{errors[field]}</p>;

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy.current) return;
    const form = event.currentTarget;
    const values = Object.fromEntries(new FormData(form));
    setErrors({}); setMessage(""); setRequestId(undefined);
    let due: string | null;
    try { due = inputInstant(String(values.due_at ?? "")); } catch {
      setErrors({ due_at: "Enter a valid UTC date and time, or leave it blank." });
      return;
    }
    const input = { title: String(values.title), description: String(values.description), status: values.status, priority: Number(values.priority), due_at: due };
    const patch: TaskUpdateInput = {};
    if (task) {
      if (input.title !== task.title) patch.title = input.title;
      if (input.description !== (task.description ?? "")) patch.description = input.description;
      if (input.status !== task.status) patch.status = input.status as TaskUpdateInput["status"];
      if (input.priority !== task.priority) patch.priority = input.priority as TaskUpdateInput["priority"];
      // Compare instants, not formatting. An untouched timestamp keeps its original
      // offset and sub-millisecond precision by being omitted from PATCH.
      if (due !== (task.due_at ? new Date(task.due_at).toISOString() : null)) patch.due_at = due;
      if (Object.keys(patch).length === 0) { setMessage("No changes to save."); return; }
    }
    const result = task ? validateUpdateTask(patch) : validateCreateTask(input);
    if (result.errors) { setErrors(result.errors); return; }
    busy.current = true; setPending(true);
    try {
      if (task) await updateTask(task.id, result.data);
      else {
        const created = validateCreateTask(input);
        if (created.errors) { setErrors(created.errors); return; }
        await createTask(projectId, created.data);
        form.reset();
      }
      setMessage(task ? "Task saved." : "Task created. Active filters or pagination may hide it.");
      onSaved?.();
      router.refresh();
    } catch (error) {
      if (error instanceof ApiError) {
        setMessage(error.message); setRequestId(error.requestId);
        const fields: TaskFieldErrors = {};
        for (const detail of error.details) for (const field of TASK_FIELDS) if (detail.loc.includes(field)) fields[field] = detail.msg;
        setErrors(fields);
      } else setMessage("Unable to confirm the change. Reload and check before retrying.");
    } finally { busy.current = false; setPending(false); }
  }

  return <form method="post" action={`/api/projects/${encodeURIComponent(projectId)}/tasks`} onSubmit={submit} noValidate aria-busy={pending} className="space-y-4">
    <noscript>JavaScript is required to manage tasks.</noscript>
    <fieldset disabled={pending} className="grid gap-4 disabled:opacity-60">
      <div><label htmlFor={fieldId("title")} className="block font-medium">Title</label>
        <input {...attributes("title")} required defaultValue={task?.title ?? ""} className="task-input" />{errorFor("title")}</div>
      <div><label htmlFor={fieldId("description")} className="block font-medium">Description (optional)</label>
        <textarea {...attributes("description")} defaultValue={task?.description ?? ""} rows={3} className="task-input" />{errorFor("description")}</div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div><label htmlFor={fieldId("status")} className="block font-medium">Status</label>
          <select {...attributes("status")} defaultValue={task?.status ?? "todo"} className="task-input">
            <option value="todo">To do</option><option value="in_progress">In progress</option><option value="done">Done</option>
          </select>{errorFor("status")}</div>
        <div><label htmlFor={fieldId("priority")} className="block font-medium">Priority</label>
          <select {...attributes("priority")} defaultValue={task?.priority ?? 2} className="task-input">
            <option value="1">1</option><option value="2">2</option><option value="3">3</option>
          </select>{errorFor("priority")}</div>
      </div>
      <div><label htmlFor={fieldId("due_at")} className="block font-medium">Due date and time (UTC)</label>
        <input {...attributes("due_at")} type="datetime-local" step="any" defaultValue={utcInput(task?.due_at ?? null)} className="task-input" />
        <p id={`${prefix}-utc`} className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">Enter UTC, not local time. Leave blank for no due date.</p>{errorFor("due_at")}</div>
      <button type="submit" className="justify-self-start rounded-md bg-foreground px-4 py-2 font-medium text-background">{pending ? "Saving…" : task ? "Save task" : "Create task"}</button>
    </fieldset>
    {message && <p role="status">{message}</p>}
    {requestId && <p className="text-sm">Support reference: {requestId}</p>}
  </form>;
}
