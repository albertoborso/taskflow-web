import Link from "next/link";
import { redirect } from "next/navigation";
import { PageHeading } from "@/components/ui/page-heading";
import { ProjectForm } from "@/components/projects/project-form";
import { ProjectError } from "@/components/projects/project-error";
import { requireSession } from "@/lib/server/auth/session";
import { listProjects } from "@/lib/server/api/projects";
import { projectFailure } from "@/lib/server/projects/errors";
import { dashboardHref, projectPagination } from "@/lib/projects/pagination";

export default async function DashboardPage({ searchParams }: PageProps<"/dashboard">) {
  const { user } = await requireSession();
  const params = await searchParams;
  const { limit, offset } = projectPagination(params);
  let page;
  try { page = await listProjects({ limit, offset }); } catch (error) {
    const failure = projectFailure(error);
    if (failure.status === 401) redirect("/login?expired=1");
    return <ProjectError {...failure} />;
  }
  return <div className="space-y-10">
    <PageHeading title={`Welcome, ${user.display_name}`} description="Manage your projects in TaskFlow." />
    <section className="space-y-4" aria-labelledby="projects-title">
      <h2 id="projects-title" className="text-2xl font-semibold">Your projects</h2>
      {page.items.length === 0 ? <p>{offset === 0 ? "No projects yet. Create your first project below." : "No projects on this page. Use Previous to go back."}</p> :
        <ul className="grid gap-4 sm:grid-cols-2">{page.items.map(project => <li key={project.id} className="rounded-lg border border-zinc-300 p-5">
          <Link href={`/projects/${encodeURIComponent(project.id)}`} className="break-words text-lg font-semibold underline underline-offset-4">{project.name}</Link>
          <p className="mt-2 line-clamp-3 whitespace-pre-wrap break-words text-zinc-600 dark:text-zinc-400">{project.description || "No description."}</p>
        </li>)}</ul>}
      <nav aria-label="Project pagination" className="flex gap-6">
        {offset > 0 && <Link className="underline" href={dashboardHref(params, limit, Math.max(0, offset - limit))}>Previous</Link>}
        {page.items.length === limit && <Link className="underline" href={dashboardHref(params, limit, offset + limit)}>Next</Link>}
      </nav>
    </section>
    <section className="max-w-xl space-y-4" aria-labelledby="create-title">
      <h2 id="create-title" className="text-2xl font-semibold">Create a project</h2>
      <ProjectForm />
    </section>
  </div>;
}
