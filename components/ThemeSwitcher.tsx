"use client";

import { usePathname, useRouter } from "next/navigation";
import { THEME_LIST, type ThemeSlug } from "@/lib/themes";

function getEquivalentPath(currentPath: string, newSlug: ThemeSlug): string {
  // Matches /themes/[slug]/...rest
  const match = currentPath.match(/^\/themes\/[^/]+(\/.*)?$/);
  if (match) {
    const rest = match[1] ?? "";
    return `/themes/${newSlug}${rest}`;
  }
  return `/themes/${newSlug}`;
}

export default function ThemeSwitcher({ currentSlug }: { currentSlug?: ThemeSlug }) {
  const pathname = usePathname();
  const router = useRouter();

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 1000,
        background: "rgba(255,255,255,0.95)",
        backdropFilter: "blur(8px)",
        borderBottom: "1px solid rgba(0,0,0,0.08)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "6px",
        padding: "8px 16px",
        flexWrap: "wrap",
      }}
    >
      <span
        style={{
          fontSize: "11px",
          fontWeight: 600,
          letterSpacing: "0.08em",
          textTransform: "uppercase",
          color: "#888",
          marginRight: "8px",
          whiteSpace: "nowrap",
        }}
      >
        Choose your vibe
      </span>
      {THEME_LIST.map((theme) => {
        const isActive = theme.slug === currentSlug;
        return (
          <button
            key={theme.slug}
            onClick={() => router.push(getEquivalentPath(pathname, theme.slug))}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              padding: "5px 12px",
              borderRadius: "100px",
              border: isActive
                ? `2px solid ${theme.swatch}`
                : "2px solid transparent",
              background: isActive ? `${theme.swatch}15` : "transparent",
              cursor: "pointer",
              transition: "all 0.15s ease",
              fontSize: "12px",
              fontWeight: isActive ? 700 : 500,
              color: isActive ? theme.swatch : "#444",
              outline: "none",
            }}
            onMouseEnter={(e) => {
              if (!isActive) {
                (e.currentTarget as HTMLButtonElement).style.background =
                  `${theme.swatch}10`;
                (e.currentTarget as HTMLButtonElement).style.color = theme.swatch;
              }
            }}
            onMouseLeave={(e) => {
              if (!isActive) {
                (e.currentTarget as HTMLButtonElement).style.background = "transparent";
                (e.currentTarget as HTMLButtonElement).style.color = "#444";
              }
            }}
          >
            <span
              style={{
                width: "10px",
                height: "10px",
                borderRadius: "50%",
                background: theme.swatch,
                flexShrink: 0,
              }}
            />
            <span>{theme.label}</span>
            <span
              style={{
                fontSize: "10px",
                color: "#999",
                display: isActive ? "none" : "inline",
              }}
            >
              · {theme.descriptor.split(" · ")[0]}
            </span>
          </button>
        );
      })}
    </div>
  );
}
