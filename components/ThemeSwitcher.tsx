"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { THEME_LIST, THEMES, type ThemeSlug } from "@/lib/themes";
import AuthHeaderActions from "@/components/AuthHeaderActions";
import DownloadThemeModal from "@/components/DownloadThemeModal";

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
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((d) => setIsLoggedIn(!!d))
      .catch(() => {});
  }, []);

  // Note: the figma-export "chrome-free" mode is now handled server-side
  // in `app/themes/[theme]/layout.tsx` — that layout doesn't render this
  // component (or FunnelNav) at all and drops the `.theme-page` class so
  // no 52px top spacer is reserved. This component therefore only needs
  // to handle the in-app preview case.
  const currentTheme = currentSlug ? THEMES[currentSlug] : null;
  const hasFigma = !!currentTheme?.figmaStoragePath;

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

      {/* Theme pills — flex-grow so they fill the space */}
      <div style={{ display: "flex", alignItems: "center", gap: "6px", flexWrap: "wrap", flex: 1 }}>
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

      {/* Download Theme — only when logged in and theme has a file */}
      {isLoggedIn && hasFigma && (
        <>
          <button
            onClick={() => setShowModal(true)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              padding: "6px 14px",
              borderRadius: 8,
              background: "#1E1E1E",
              color: "#FFFFFF",
              fontFamily: "var(--font-barlow), -apple-system, sans-serif",
              fontSize: 12,
              fontWeight: 700,
              border: "none",
              cursor: "pointer",
              flexShrink: 0,
              letterSpacing: "0.02em",
            }}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
              <polyline points="7 10 12 15 17 10"/>
              <line x1="12" y1="15" x2="12" y2="3"/>
            </svg>
            Download Theme
          </button>

          {showModal && currentTheme && (
            <DownloadThemeModal
              themeSlug={currentTheme.slug}
              themeLabel={currentTheme.label}
              onClose={() => setShowModal(false)}
            />
          )}
        </>
      )}

      {/* Auth actions — pinned to the right */}
      <div style={{ marginLeft: "auto", flexShrink: 0 }}>
        <AuthHeaderActions variant="light" />
      </div>
    </div>
  );
}
