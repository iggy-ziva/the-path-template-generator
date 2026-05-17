import { notFound } from "next/navigation";
import { getTheme } from "@/lib/themes";
import ThemeSwitcher from "@/components/ThemeSwitcher";
import FunnelNav from "@/components/FunnelNav";
import type { ThemeSlug } from "@/lib/themes";
import "./threshold.css";

export default async function ThemeLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ theme: string }>;
}) {
  const { theme: themeSlug } = await params;
  const theme = getTheme(themeSlug);
  if (!theme) notFound();

  const c = theme.colors;
  const f = theme.fonts;

  // Inline CSS variable overrides scoped to this theme's root.
  const cssVars: React.CSSProperties = {
    ["--surface-canvas" as never]: c.surfaceCanvas,
    ["--surface-sunken" as never]: c.surfaceSunken,
    ["--surface-raised" as never]: c.surfaceRaised,
    ["--surface-accent" as never]: c.surfaceAccent,
    ["--surface-inverse" as never]: c.surfaceInverse,
    ["--text-primary" as never]: c.textPrimary,
    ["--text-secondary" as never]: c.textSecondary,
    ["--text-tertiary" as never]: c.textTertiary,
    ["--text-inverse" as never]: c.textInverse,
    ["--text-accent" as never]: c.textAccent,
    ["--accent-primary" as never]: c.accentPrimary,
    ["--accent-primary-hover" as never]: c.accentPrimaryHover,
    ["--accent-primary-light" as never]: c.accentPrimaryLight,
    ["--accent-primary-hover-light" as never]: c.accentPrimaryHoverLight,
    ["--accent-secondary" as never]: c.accentSecondary,
    ["--accent-tertiary" as never]: c.accentPrimary,
    ["--accent-highlight" as never]: c.accentHighlight,
    ["--border-subtle" as never]: c.borderSubtle,
    ["--border-strong" as never]: c.borderStrong,
    ["--success" as never]: c.success,
    ["--font-display" as never]: f.displayFamily,
    ["--font-body" as never]: f.bodyFamily,
    ["--font-mono" as never]: f.monoFamily ?? "ui-monospace, monospace",
  };

  return (
    <>
      <style
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{
          __html: `@import url('${theme.fonts.googleFontsUrl}');`,
        }}
      />
      <ThemeSwitcher currentSlug={theme.slug as ThemeSlug} />
      <div className="theme-root theme-page" style={cssVars}>
        {children}
      </div>
      <FunnelNav slug={theme.slug as ThemeSlug} />
    </>
  );
}
