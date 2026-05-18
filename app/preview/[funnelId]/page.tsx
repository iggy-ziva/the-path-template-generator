import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import PreviewClient from "./PreviewClient";

async function getServiceClient() {
  const { createClient } = await import("@supabase/supabase-js");
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export default async function PreviewPage({
  params,
}: {
  params: Promise<{ funnelId: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");

  const { funnelId } = await params;
  const supabase = await getServiceClient();

  const { data: funnel } = await supabase
    .from("generated_funnels")
    .select("id, content, theme_slug, created_at")
    .eq("id", funnelId)
    .single();

  if (!funnel) redirect("/app/wizard");

  return <PreviewClient funnel={funnel} />;
}
