"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ThemeSlug } from "@/lib/themes";

const FUNNEL_STEPS = [
  { label: "Event Landing", path: "" },
  { label: "Checkout", path: "/checkout" },
  { label: "Upsell", path: "/upsell" },
  { label: "Thank You", path: "/thank-you" },
  { label: "Replay", path: "/replay" },
  { label: "Program", path: "/program" },
  { label: "Program Checkout", path: "/program-checkout" },
  { label: "Program Thank You", path: "/program-thank-you" },
];

export default function FunnelNav({ slug }: { slug: ThemeSlug }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  return (
    <div
      style={{
        position: "fixed",
        bottom: "24px",
        right: "24px",
        zIndex: 999,
      }}
    >
      {open && (
        <div
          style={{
            position: "absolute",
            bottom: "48px",
            right: 0,
            background: "#fff",
            border: "1px solid rgba(0,0,0,0.1)",
            borderRadius: "12px",
            padding: "8px",
            boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
            minWidth: "200px",
          }}
        >
          {FUNNEL_STEPS.map((step, i) => {
            const href = `/themes/${slug}${step.path}`;
            const isActive = pathname === href;
            return (
              <Link
                key={step.path}
                href={href}
                onClick={() => setOpen(false)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  padding: "8px 12px",
                  borderRadius: "8px",
                  textDecoration: "none",
                  background: isActive ? "#f0f0f0" : "transparent",
                  color: "#222",
                  fontSize: "13px",
                  fontWeight: isActive ? 600 : 400,
                  transition: "background 0.1s",
                }}
              >
                <span
                  style={{
                    width: "20px",
                    height: "20px",
                    borderRadius: "50%",
                    background: isActive ? "#222" : "#eee",
                    color: isActive ? "#fff" : "#666",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "10px",
                    fontWeight: 700,
                    flexShrink: 0,
                  }}
                >
                  {i + 1}
                </span>
                {step.label}
              </Link>
            );
          })}
        </div>
      )}
      <button
        onClick={() => setOpen((v) => !v)}
        style={{
          background: "#0f0e0c",
          color: "#fff",
          border: "none",
          borderRadius: "100px",
          padding: "10px 18px",
          cursor: "pointer",
          fontSize: "12px",
          fontWeight: 600,
          letterSpacing: "0.04em",
          boxShadow: "0 4px 16px rgba(0,0,0,0.2)",
          display: "flex",
          alignItems: "center",
          gap: "8px",
        }}
      >
        <span>{open ? "✕" : "☰"}</span>
        Funnel steps
      </button>
    </div>
  );
}
