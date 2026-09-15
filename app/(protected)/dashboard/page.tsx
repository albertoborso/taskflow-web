import { PageHeading } from "@/components/ui/page-heading";
import { requireSession } from "@/lib/server/auth/session";

export default async function DashboardPage() {
  const { user } = await requireSession();
  return <>
    <PageHeading title={`Welcome, ${user.display_name}`} description="You’re signed in to TaskFlow." />
    <p className="mt-4">{user.email}</p>
    <p className="mt-6">Your project workspace is coming soon.</p>
  </>;
}
