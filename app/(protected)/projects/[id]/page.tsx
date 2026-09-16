import Link from "next/link";
import { Suspense } from "react";
import { TaskList } from "@/components/tasks/task-list";
import { notFound, redirect } from "next/navigation";
import { PageHeading } from "@/components/ui/page-heading";
import { ProjectForm } from "@/components/projects/project-form";
import { DeleteProject } from "@/components/projects/delete-project";
import { ProjectError } from "@/components/projects/project-error";
import { requireSession } from "@/lib/server/auth/session";
import { getProject } from "@/lib/server/api/projects";
import { projectFailure } from "@/lib/server/projects/errors";

export default async function ProjectPage({ params, searchParams }: PageProps<"/projects/[id]">) {
  await requireSession();
  const { id } = await params;
  let project;
  try { project = await getProject(id); } catch (error) {
    const failure = projectFailure(error);
    if (failure.status === 401) redirect("/login?expired=1");
    if (failure.status === 404) {
      // Keep the real not-found response and identical public wording for missing
      // and inaccessible projects. Log only the validated opaque support reference.
      if (failure.requestId) console.warn("project_unavailable", { requestId: failure.requestId });
      notFound();
    }
    return <ProjectError {...failure} />;
  }
  const query = await searchParams;
  return <div className="space-y-8">
    <Link href="/dashboard" className="underline underline-offset-4">Back to projects</Link>
    <PageHeading title={project.name} description="Project details" />
    <p className="whitespace-pre-wrap break-words">{project.description || "No description."}</p>
    <details className="max-w-2xl rounded-lg border border-zinc-300 p-5 dark:border-zinc-700">
      <summary className="mb-4 cursor-pointer text-lg font-semibold">Project settings</summary>
    <section className="space-y-4" aria-labelledby="edit-title">
      <h2 id="edit-title" className="text-xl font-semibold">Edit project</h2>
      <ProjectForm key={project.id} project={{ id: project.id, name: project.name, description: project.description }} />
    </section>
    <div className="mt-6"><DeleteProject id={project.id} name={project.name} /></div>
    </details>
    <Suspense key={JSON.stringify(query)} fallback={<p role="status">Loading tasks…</p>}>
      <TaskList projectId={project.id} params={query} />
    </Suspense>
  </div>;
}
