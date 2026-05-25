import type { Metadata } from "next";
import { Barlow, Caveat } from "next/font/google";
import Script from "next/script";
import "./globals.css";

// Self-hosted via next/font — zero render-blocking network request
const barlow = Barlow({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  style: ["normal", "italic"],
  variable: "--font-barlow",
  display: "swap",
});

const caveat = Caveat({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-caveat",
  display: "swap",
});

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
    <html lang="en" className={`${barlow.variable} ${caveat.variable}`}>
      <head>
        <link rel="preconnect" href="https://use.typekit.net" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://p.typekit.net" crossOrigin="anonymous" />
      </head>
      <body>
        {children}
        <Script
          id="typekit-load"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `(function(){var l=document.createElement('link');l.rel='stylesheet';l.href='https://use.typekit.net/xnp4dyt.css';l.media='print';l.onload=function(){l.media='all'};document.head.appendChild(l);}())`,
          }}
        />
      </body>
    </html>
  );
}
