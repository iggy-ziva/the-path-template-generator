import { notFound } from "next/navigation";
import { getTheme } from "@/lib/themes";
import ThemeSwitcher from "@/components/ThemeSwitcher";
import FunnelNav from "@/components/FunnelNav";
import type { ThemeSlug } from "@/lib/themes";

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

  return (
    <>
      {/* Google Fonts loaded via link in head — next/head doesn't work in App Router;
          inject as style tag to avoid Suspense issues */}
      <style
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{
          __html: `@import url('${theme.fonts.googleFontsUrl}');`,
        }}
      />
      <ThemeSwitcher currentSlug={theme.slug as ThemeSlug} />
      <div className="theme-page">{children}</div>
      <FunnelNav slug={theme.slug as ThemeSlug} />
    </>
  );
}
