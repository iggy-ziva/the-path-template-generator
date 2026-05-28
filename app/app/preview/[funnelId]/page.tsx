import { getSession } from "@/lib/session";
import { redirect, notFound } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import { splitFunnelContent } from "@/lib/funnel-snapshot";
import PreviewClient from "./_components/PreviewClient";

const ADMIN_EMAILS = ["hello@ziva.marketing", "ignusvermaak@gmail.com"];

function getServiceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export const metadata = { title: "Funnel Preview — The Path" };

export default async function PreviewPage({
  params,
}: {
  params: Promise<{ funnelId: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");

  const { funnelId } = await params;
  const supabase = getServiceClient();

  const isAdmin = ADMIN_EMAILS.includes(session.email);

  // Admins can view any funnel; regular users only their own
  const funnelQuery = supabase
    .from("generated_funnels")
    .select("id, content, theme_slug, created_at, submission_id, user_id")
    .eq("id", funnelId);
  if (!isAdmin) funnelQuery.eq("user_id", session.userId);

  const { data: funnel } = await funnelQuery.single();

  if (!funnel) notFound();

  const { pageContent, wizardSnapshot } = splitFunnelContent(
    funnel.content as Record<string, unknown>,
  );

  // Prefer the frozen snapshot from generation; fall back to live submission for older funnels.
  let wizardData: Record<string, unknown> = wizardSnapshot ?? {};
  if (!wizardSnapshot && funnel.submission_id) {
    const subQuery = supabase
      .from("wizard_submissions")
      .select("step_data")
      .eq("id", funnel.submission_id);
    if (!isAdmin) subQuery.eq("user_id", session.userId);
    const { data: submission } = await subQuery.single();
    if (submission?.step_data) wizardData = submission.step_data as Record<string, unknown>;
  }

  return (
    <PreviewClient
      key={funnel.id}
      funnelId={funnel.id}
      content={pageContent}
      themeSlug={funnel.theme_slug}
      createdAt={funnel.created_at}
      wizardData={wizardData}
    />
  );
}
