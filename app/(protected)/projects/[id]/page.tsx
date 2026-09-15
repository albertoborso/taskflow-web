import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { PageHeading } from "@/components/ui/page-heading";
import { ProjectForm } from "@/components/projects/project-form";
import { DeleteProject } from "@/components/projects/delete-project";
import { ProjectError } from "@/components/projects/project-error";
import { requireSession } from "@/lib/server/auth/session";
import { getProject } from "@/lib/server/api/projects";
import { projectFailure } from "@/lib/server/projects/errors";

export default async function ProjectPage({ params }: PageProps<"/projects/[id]">) {
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
  return <div className="max-w-2xl space-y-8">
    <Link href="/dashboard" className="underline underline-offset-4">Back to projects</Link>
    <PageHeading title={project.name} description="Project details" />
    <p className="whitespace-pre-wrap break-words">{project.description || "No description."}</p>
    <section className="space-y-4" aria-labelledby="edit-title">
      <h2 id="edit-title" className="text-xl font-semibold">Edit project</h2>
      <ProjectForm key={project.id} project={{ id: project.id, name: project.name, description: project.description }} />
    </section>
    <section className="space-y-2"><h2 className="text-xl font-semibold">Tasks</h2><p>Task management is coming in Milestone 4.</p></section>
    <DeleteProject id={project.id} name={project.name} />
  </div>;
}
