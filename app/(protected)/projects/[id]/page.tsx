import { PageHeading } from "@/components/ui/page-heading";
import { requireSession } from "@/lib/server/auth/session";

export default async function ProjectPage() {
  await requireSession();
  return <PageHeading title="Project" description="Project details and tasks will be available here soon." />;
}
