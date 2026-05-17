import { getSession } from "@/lib/session";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import DashboardClient from "./DashboardClient";

function getServiceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export const metadata = { title: "Your Funnel — The Path" };

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ funnel?: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");

  const { funnel: funnelId } = await searchParams;

  const supabase = getServiceClient();

  let funnelData = null;
  let allFunnels: { id: string; created_at: string; theme_slug: string | null }[] = [];

  // Load all funnels for this user
  const { data: funnels } = await supabase
    .from("generated_funnels")
    .select("id, created_at, theme_slug")
    .eq("user_id", session.userId)
    .order("created_at", { ascending: false });

  allFunnels = funnels ?? [];

  // Load specific funnel
  const targetId = funnelId ?? allFunnels[0]?.id;
  if (targetId) {
    const { data } = await supabase
      .from("generated_funnels")
      .select("id, content, theme_slug, created_at")
      .eq("id", targetId)
      .eq("user_id", session.userId)
      .single();
    funnelData = data;
  }

  return (
    <DashboardClient
      funnelData={funnelData}
      allFunnels={allFunnels}
      userEmail={session.email}
    />
  );
}
