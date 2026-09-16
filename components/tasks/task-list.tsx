import Link from "next/link";
import { redirect } from "next/navigation";
import { listTasks } from "@/lib/server/api/tasks";
import { taskFailure } from "@/lib/server/tasks/errors";
import { taskHref, taskQuery } from "@/lib/tasks/query";
import type { SearchParams } from "@/lib/projects/pagination";
import { TaskCard } from "./task-card";
import { TaskFilters } from "./task-filters";
import { TaskForm } from "./task-form";

export async function TaskList({ projectId, params }: { projectId: string; params: SearchParams }) {
  const { filters, invalid } = taskQuery(params);
  let page;
  let failure;
  try { page = await listTasks(projectId, filters); } catch (error) {
    failure = taskFailure(error);
    if (failure.status === 401) redirect("/login?expired=1");
  }
  const activeFilters = Boolean(filters.status || filters.priority || filters.due_before);
  return <section aria-labelledby="tasks-title" className="space-y-6">
    <div><h2 id="tasks-title" tabIndex={-1} className="text-2xl font-semibold">Tasks</h2><p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">All dates and times are shown in UTC.</p></div>
    <TaskFilters key={JSON.stringify(filters)} projectId={projectId} params={params} filters={filters} />
    {invalid && <p role="alert">Some URL filters were invalid and have been ignored. Apply filters to correct them.</p>}
    {failure && <div className="space-y-2" role="alert"><p>{failure.message}</p>{failure.requestId && <p>Support reference: {failure.requestId}</p>}<a href="" className="underline">Reload tasks</a></div>}
    {page && <>
      {page.items.length === 0 ? <p className="rounded-lg border border-dashed border-zinc-400 p-6">{filters.offset > 0 ? "No tasks on this page. Use Previous to go back." : activeFilters ? "No tasks match these filters." : "No tasks yet. Create your first task below."}</p> :
        <ul aria-label="Tasks" className="grid gap-4">{page.items.map(task => <li key={task.id}><TaskCard task={{ id: task.id, project_id: task.project_id, title: task.title, description: task.description, status: task.status, priority: task.priority, due_at: task.due_at, completed_at: task.completed_at, created_at: task.created_at, updated_at: task.updated_at }} /></li>)}</ul>}
      <nav aria-label="Task pagination" className="flex gap-6">
        {filters.offset > 0 && <Link className="underline" href={taskHref(projectId, params, { limit: String(filters.limit), offset: String(Math.max(0, filters.offset - filters.limit)) })}>Previous</Link>}
        {page.items.length === filters.limit && <Link className="underline" href={taskHref(projectId, params, { limit: String(filters.limit), offset: String(filters.offset + filters.limit) })}>Next</Link>}
      </nav>
    </>}
    <details className="rounded-lg border border-zinc-300 p-5 dark:border-zinc-700" open>
      <summary className="mb-4 cursor-pointer text-lg font-semibold">Create a task</summary>
      <TaskForm projectId={projectId} />
    </details>
  </section>;
}
