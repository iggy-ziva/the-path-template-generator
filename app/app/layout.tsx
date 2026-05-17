import Link from "next/link";
import { getSession } from "@/lib/session";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();

  return (
    <div style={{ minHeight: "100vh", background: "#0f0e0c", color: "#f5f1ea", fontFamily: "'Inter', -apple-system, sans-serif" }}>
      <header
        style={{
          padding: "16px 40px",
          borderBottom: "1px solid #1a1917",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Link href="/" style={{ textDecoration: "none", color: "#D4A878", fontSize: "13px", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase" }}>
          The Path
        </Link>
        <div style={{ display: "flex", alignItems: "center", gap: "24px", fontSize: "13px", color: "#666" }}>
          {session && <span>{session.email}</span>}
          <form action="/api/auth/logout" method="POST" style={{ margin: 0 }}>
            <button type="submit" style={{ background: "none", border: "none", color: "#555", cursor: "pointer", fontSize: "13px" }}>
              Sign out
            </button>
          </form>
        </div>
      </header>
      {children}
    </div>
  );
}
