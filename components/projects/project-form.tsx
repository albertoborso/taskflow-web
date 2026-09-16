"use client";
import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { ApiError } from "@/lib/api/error";
import { mutateProject } from "@/lib/api/projects";
import { validateCreateProject, validateUpdateProject, type ProjectFieldErrors } from "@/lib/projects/validation";

export function ProjectForm({ project }: { project?: { id: string; name: string; description: string | null } }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState("");
  const [requestId, setRequestId] = useState<string>();
  const [errors, setErrors] = useState<ProjectFieldErrors>({});
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending) return;
    const form = event.currentTarget;
    const input = Object.fromEntries(new FormData(form));
    const result = project ? validateUpdateProject(input) : validateCreateProject(input);
    setErrors(result.errors ?? {}); setMessage(""); setRequestId(undefined);
    if (result.errors) return;
    setPending(true);
    try {
      const data = await mutateProject(project ? "PATCH" : "POST", project?.id, result.data);
      if (!project && typeof data.id === "string") router.push(`/projects/${encodeURIComponent(data.id)}`);
      setMessage(project ? "Project saved." : "Project created.");
      if (!project) form.reset();
      router.refresh();
    } catch (error) {
      if (error instanceof ApiError) {
        setMessage(error.message); setRequestId(error.requestId);
        const fields: ProjectFieldErrors = {};
        for (const detail of error.details) {
          const field = detail.loc[0];
          if (field === "name" || field === "description") fields[field] = detail.msg;
        }
        setErrors(fields);
      } else setMessage("Unable to complete this change.");
    } finally { setPending(false); }
  }
  return <form method="post" action="/api/projects" onSubmit={submit} noValidate className="space-y-4" aria-busy={pending}>
    <noscript>JavaScript is required to manage projects.</noscript>
    <fieldset disabled={pending} className="space-y-4 disabled:opacity-60">
      <div><label htmlFor="project-name" className="block font-medium">Project name</label>
        <input id="project-name" name="name" defaultValue={project?.name ?? ""} required aria-invalid={Boolean(errors.name)} aria-describedby={errors.name ? "name-error" : undefined} className="mt-2 w-full rounded border border-zinc-400 bg-transparent px-3 py-2" />
        {errors.name && <p id="name-error" role="alert">{errors.name}</p>}</div>
      <div><label htmlFor="project-description" className="block font-medium">Description (optional)</label>
        <textarea id="project-description" name="description" defaultValue={project?.description ?? ""} rows={4} aria-invalid={Boolean(errors.description)} aria-describedby={errors.description ? "description-error" : undefined} className="mt-2 w-full rounded border border-zinc-400 bg-transparent px-3 py-2" />
        {errors.description && <p id="description-error" role="alert">{errors.description}</p>}</div>
      <button className="rounded bg-foreground px-4 py-2 font-medium text-background" type="submit">{pending ? "Saving…" : project ? "Save changes" : "Create project"}</button>
    </fieldset>
    {message && <p role="status">{message}</p>}
    {requestId && <p className="text-sm">Support reference: {requestId}</p>}
  </form>;
}
