import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import Link from "next/link";

const ADMIN_EMAILS = [
  "hello@ziva.marketing",
  "ignusvermaak@gmail.com",
  // add additional admin emails here
];

function getServiceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export const metadata = { title: "Admin — The Path" };

interface FunnelRow {
  id: string;
  user_id: string;
  created_at: string;
  theme_slug: string | null;
  submission_id: string | null;
  content: Record<string, unknown>;
}

interface UserRow {
  id: string;
  email: string;
  has_paid: boolean;
  created_at: string;
}

export default async function AdminPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!ADMIN_EMAILS.includes(session.email)) redirect("/app/wizard");

  const supabase = getServiceClient();

  const [{ data: users }, { data: funnels }] = await Promise.all([
    supabase.from("users").select("id, email, has_paid, created_at").order("created_at", { ascending: false }),
    supabase.from("generated_funnels").select("id, user_id, created_at, theme_slug, submission_id, content").order("created_at", { ascending: false }),
  ]);

  const userList = (users ?? []) as UserRow[];
  const funnelList = (funnels ?? []) as FunnelRow[];

  // Build a map of user_id → email for the funnel table
  const userMap = new Map(userList.map(u => [u.id, u]));

  const totalUsers = userList.length;
  const paidUsers = userList.filter(u => u.has_paid).length;
  const totalFunnels = funnelList.length;
  const thisMonth = funnelList.filter(f => {
    const d = new Date(f.created_at);
    const now = new Date();
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  }).length;

  return (
    <div style={{ minHeight: "100vh", background: "#0F0E0C", color: "#f5f1ea", fontFamily: "Inter, sans-serif" }}>

      {/* Top bar */}
      <div style={{ background: "#141412", borderBottom: "1px solid #2a2926", padding: "0 40px", height: 56, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ fontWeight: 700, fontSize: 15 }}>Admin</div>
        <div style={{ fontSize: 12, color: "#555" }}>Logged in as {session.email}</div>
        <Link href="/app/wizard" style={{ fontSize: 12, color: "#555", textDecoration: "none" }}>
          ← Back to app
        </Link>
      </div>

      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "40px" }}>

        {/* Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 20, marginBottom: 48 }}>
          {[
            { label: "Total users", value: totalUsers },
            { label: "Paid users", value: paidUsers },
            { label: "Total funnels generated", value: totalFunnels },
            { label: "Generated this month", value: thisMonth },
          ].map((stat, i) => (
            <div key={i} style={{ background: "#1a1917", borderRadius: 12, padding: "24px", border: "1px solid #2a2926" }}>
              <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: "#555", marginBottom: 8 }}>
                {stat.label}
              </div>
              <div style={{ fontSize: "2rem", fontWeight: 700, color: "#D4A878" }}>{stat.value}</div>
            </div>
          ))}
        </div>

        {/* Generated Funnels */}
        <div style={{ marginBottom: 48 }}>
          <h2 style={{ fontSize: "1.2rem", fontWeight: 700, marginBottom: 20 }}>
            All Generated Funnels ({funnelList.length})
          </h2>
          <div style={{ background: "#1a1917", borderRadius: 12, border: "1px solid #2a2926", overflow: "hidden" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid #2a2926" }}>
                  {["Funnel ID", "User", "Theme", "Pages", "Created", "Actions"].map(h => (
                    <th key={h} style={{ padding: "12px 20px", textAlign: "left", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: "#555" }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {funnelList.map((funnel) => {
                  const user = userMap.get(funnel.user_id);
                  const pagesGenerated = Object.keys(funnel.content ?? {}).length;
                  return (
                    <tr key={funnel.id} style={{ borderBottom: "1px solid #1f1e1c" }}>
                      <td style={{ padding: "14px 20px", fontSize: 12, fontFamily: "monospace", color: "#888" }}>
                        {funnel.id.slice(0, 8)}…
                      </td>
                      <td style={{ padding: "14px 20px", fontSize: 13 }}>
                        <div>{user?.email ?? funnel.user_id.slice(0, 8)}</div>
                        {user?.has_paid && <div style={{ fontSize: 11, color: "#4ade80", marginTop: 2 }}>✓ Paid</div>}
                      </td>
                      <td style={{ padding: "14px 20px", fontSize: 13, color: "#888" }}>
                        {funnel.theme_slug ?? "—"}
                      </td>
                      <td style={{ padding: "14px 20px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <div style={{ height: 6, width: `${(pagesGenerated / 8) * 100}%`, minWidth: 4, maxWidth: 80, background: "#D4A878", borderRadius: 3 }} />
                          <span style={{ fontSize: 12, color: "#888" }}>{pagesGenerated}/8</span>
                        </div>
                      </td>
                      <td style={{ padding: "14px 20px", fontSize: 12, color: "#555" }}>
                        {new Date(funnel.created_at).toLocaleDateString()}<br />
                        <span style={{ fontSize: 11 }}>{new Date(funnel.created_at).toLocaleTimeString()}</span>
                      </td>
                      <td style={{ padding: "14px 20px", display: "flex", gap: 8, flexWrap: "wrap" }}>
                        <Link
                          href={`/app/preview/${funnel.id}`}
                          style={{ fontSize: 12, fontWeight: 700, color: "#D4A878", textDecoration: "none", padding: "5px 10px", border: "1px solid #D4A87840", borderRadius: 6 }}
                        >
                          Preview →
                        </Link>
                        <a
                          href={`/api/wizard/export/${funnel.id}`}
                          style={{ fontSize: 12, fontWeight: 700, color: "#888", textDecoration: "none", padding: "5px 10px", border: "1px solid #444", borderRadius: 6 }}
                        >
                          Export ZIP
                        </a>
                      </td>
                    </tr>
                  );
                })}
                {funnelList.length === 0 && (
                  <tr>
                    <td colSpan={6} style={{ padding: "40px 20px", textAlign: "center", color: "#444", fontSize: 13 }}>
                      No funnels generated yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Users */}
        <div>
          <h2 style={{ fontSize: "1.2rem", fontWeight: 700, marginBottom: 20 }}>
            All Users ({userList.length})
          </h2>
          <div style={{ background: "#1a1917", borderRadius: 12, border: "1px solid #2a2926", overflow: "hidden" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid #2a2926" }}>
                  {["Email", "Status", "Funnels", "Signed up"].map(h => (
                    <th key={h} style={{ padding: "12px 20px", textAlign: "left", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: "#555" }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {userList.map((user) => {
                  const userFunnels = funnelList.filter(f => f.user_id === user.id);
                  return (
                    <tr key={user.id} style={{ borderBottom: "1px solid #1f1e1c" }}>
                      <td style={{ padding: "14px 20px", fontSize: 13, fontWeight: 600 }}>{user.email}</td>
                      <td style={{ padding: "14px 20px" }}>
                        <span style={{ fontSize: 12, padding: "3px 8px", borderRadius: 4, background: user.has_paid ? "rgba(74,222,128,0.1)" : "rgba(255,255,255,0.05)", color: user.has_paid ? "#4ade80" : "#555", fontWeight: 700 }}>
                          {user.has_paid ? "Paid" : "Free"}
                        </span>
                      </td>
                      <td style={{ padding: "14px 20px", fontSize: 13, color: "#888" }}>
                        {userFunnels.length} funnel{userFunnels.length !== 1 ? "s" : ""}
                      </td>
                      <td style={{ padding: "14px 20px", fontSize: 12, color: "#555" }}>
                        {new Date(user.created_at).toLocaleDateString()}
                      </td>
                    </tr>
                  );
                })}
                {userList.length === 0 && (
                  <tr>
                    <td colSpan={4} style={{ padding: "40px 20px", textAlign: "center", color: "#444", fontSize: 13 }}>
                      No users yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Admin note */}
        <div style={{ marginTop: 40, padding: "16px 20px", background: "rgba(212,168,120,0.06)", borderRadius: 10, border: "1px solid rgba(212,168,120,0.15)", fontSize: 13, color: "#888", lineHeight: 1.6 }}>
          <strong style={{ color: "#D4A878" }}>Admin access</strong> — this page is only accessible to emails in the ADMIN_EMAILS allowlist in{" "}
          <code style={{ fontSize: 12 }}>app/admin/page.tsx</code>. To add more admins, add their email to that array and redeploy.
        </div>
      </div>
    </div>
  );
}
