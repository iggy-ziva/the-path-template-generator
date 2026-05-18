import Image from "next/image";
import Link from "next/link";
import { getSession } from "@/lib/session";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#FCFAF6",
        color: "#2E2E2E",
        fontFamily: 'var(--font-barlow), -apple-system, sans-serif',
      }}
    >
      <header
        style={{
          padding: "0 40px",
          height: 64,
          borderBottom: "1px solid #F5EEE0",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          background: "#FFFFFF",
          position: "sticky",
          top: 0,
          zIndex: 50,
          boxShadow: "0 1px 12px rgba(0,0,0,0.04)",
        }}
      >
        {/* Left: logo + product name */}
        <Link href="/" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: 12 }}>
          <Image
            src="/ziva-marketing-logo.png"
            alt="Ziva Marketing"
            width={80}
            height={30}
            style={{ objectFit: "contain" }}
            priority
          />
        </Link>

        {/* Right: email + sign out */}
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          {session && (
            <span
              style={{
                fontSize: 13,
                color: "#8A7A6A",
                fontWeight: 600,
              }}
            >
              {session.email}
            </span>
          )}
          <form action="/api/auth/logout" method="POST" style={{ margin: 0 }}>
            <button
              type="submit"
              style={{
                background: "none",
                border: "1px solid #F5EEE0",
                borderRadius: 8,
                color: "#8A7A6A",
                cursor: "pointer",
                fontSize: 13,
                fontWeight: 600,
                fontFamily: 'var(--font-barlow), sans-serif',
                padding: "7px 14px",
                transition: "border-color 0.2s",
              }}
            >
              Sign out
            </button>
          </form>
        </div>
      </header>

      {children}
    </div>
  );
}
