import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "The Path Template Generator",
  description: "AI-powered funnel template generator for coaches and facilitators",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
