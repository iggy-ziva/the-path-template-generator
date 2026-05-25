"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface Props {
  email?: string | null;
}

export default function AppHeader({ email }: Props) {
  const pathname = usePathname();

  // The funnel preview renders inside the browser viewport with its own
  // toolbar and chrome — the global app header must not appear here.
  if (pathname?.startsWith("/app/preview/")) return null;

  return (
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

      <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
        {email && (
          <span
            style={{
              fontSize: 13,
              color: "#8A7A6A",
              fontWeight: 600,
            }}
          >
            {email}
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
              fontFamily: "var(--font-barlow), sans-serif",
              padding: "7px 14px",
              transition: "border-color 0.2s",
            }}
          >
            Sign out
          </button>
        </form>
      </div>
    </header>
  );
}
