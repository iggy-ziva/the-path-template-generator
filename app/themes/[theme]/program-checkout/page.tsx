import { notFound } from "next/navigation";
import { getTheme } from "@/lib/themes";
import ProgramCheckoutClient from "./ProgramCheckoutClient";

export default async function ProgramCheckoutPage({
  params,
}: {
  params: Promise<{ theme: string }>;
}) {
  const { theme: themeSlug } = await params;
  const theme = getTheme(themeSlug);
  if (!theme) notFound();
  return <ProgramCheckoutClient theme={theme} />;
}
