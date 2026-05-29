"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";

const Z = {
  cream:     "#FCFAF6",
  creamDeep: "#F5EEE0",
  charcoal:  "#2E2E2E",
  muted:     "#8A7A6A",
  pink:      "#FF007E",
  coral:     "#FA2A45",
  white:     "#FFFFFF",
  font:      'var(--font-barlow), -apple-system, sans-serif',
  serif:     '"kudryashev-d-contrast", serif',
};

interface Props {
  funnelId: string;
  onClose: () => void;
}

export default function DownloadFunnelModal({ funnelId, onClose }: Props) {
  const [mounted, setMounted] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [hostingLoading, setHostingLoading] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  async function handleZipDownload() {
    setDownloading(true);
    try {
      const res = await fetch(`/api/wizard/export/${funnelId}`);
      if (!res.ok) throw new Error("Download failed");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `funnel-${funnelId.slice(0, 8)}.zip`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      alert("Download failed — please try again.");
    } finally {
      setDownloading(false);
    }
  }

  async function handleHosting() {
    setHostingLoading(true);
    try {
      const res = await fetch("/api/stripe/hosting", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ funnelId }),
      });
      const { url } = await res.json();
      if (url) window.location.href = url;
    } catch {
      alert("Could not start checkout — please try again.");
      setHostingLoading(false);
    }
  }

  if (!mounted) return null;

  return createPortal(
    <div
      onClick={onClose}
      style={{ position: "fixed", inset: 0, zIndex: 200, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{ background: Z.white, borderRadius: 20, padding: "40px 36px", maxWidth: 620, width: "100%", boxShadow: "0 24px 80px rgba(0,0,0,0.18)" }}
      >
        {/* Header */}
        <div style={{ marginBottom: 32 }}>
          <h2 style={{ fontFamily: Z.serif, fontSize: 28, fontWeight: 400, color: Z.charcoal, marginBottom: 8 }}>
            Get your funnel live
          </h2>
          <p style={{ fontFamily: Z.font, fontSize: 15, color: Z.muted, lineHeight: 1.6 }}>
            Your AI-generated funnel is ready. Choose how you'd like to deploy it.
          </p>
        </div>

        {/* Option 1 — ZIP Download */}
        <div style={{ border: `1.5px solid ${Z.creamDeep}`, borderRadius: 16, padding: 24, marginBottom: 16 }}>
          <div style={{ display: "flex", alignItems: "flex-start", gap: 16 }}>
            <div style={{ fontSize: 28, flexShrink: 0 }}>📦</div>
            <div style={{ flex: 1 }}>
              <p style={{ fontFamily: Z.font, fontSize: 16, fontWeight: 700, color: Z.charcoal, marginBottom: 4 }}>
                Download the files yourself
              </p>
              <p style={{ fontFamily: Z.font, fontSize: 13, color: Z.muted, lineHeight: 1.6, marginBottom: 16 }}>
                Get a ZIP archive containing all HTML, CSS and JavaScript files. You&apos;ll need to upload these to your own web host (e.g. Netlify, Vercel, cPanel). Ideal if you have a developer on your team.
              </p>
              <button
                onClick={handleZipDownload}
                disabled={downloading}
                style={{
                  padding: "11px 24px",
                  background: downloading ? Z.creamDeep : Z.charcoal,
                  color: downloading ? Z.muted : Z.white,
                  border: "none",
                  borderRadius: 10,
                  fontFamily: Z.font,
                  fontSize: 13,
                  fontWeight: 700,
                  cursor: downloading ? "not-allowed" : "pointer",
                  letterSpacing: "0.02em",
                  transition: "all 0.2s",
                }}
              >
                {downloading ? "Preparing download…" : "Download ZIP →"}
              </button>
            </div>
          </div>
        </div>

        {/* Option 2 — ZIVA Hosting */}
        <div style={{ border: `1.5px solid ${Z.pink}30`, borderRadius: 16, padding: 24, background: `${Z.pink}04`, marginBottom: 28 }}>
          <div style={{ display: "flex", alignItems: "flex-start", gap: 16 }}>
            <div style={{ fontSize: 28, flexShrink: 0 }}>🚀</div>
            <div style={{ flex: 1 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
                <p style={{ fontFamily: Z.font, fontSize: 16, fontWeight: 700, color: Z.charcoal }}>
                  Let Ziva handle everything
                </p>
                <span style={{ background: `linear-gradient(135deg, ${Z.pink}, ${Z.coral})`, color: Z.white, fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 100, letterSpacing: "0.05em" }}>
                  RECOMMENDED
                </span>
              </div>
              <p style={{ fontFamily: Z.font, fontSize: 13, color: Z.muted, lineHeight: 1.6, marginBottom: 8 }}>
                We set up, host and configure your entire funnel — domain connection, payment processor, email integrations and platform setup all included. We&apos;ll contact you within 24 hours to collect API keys and platform credentials.
              </p>
              <p style={{ fontFamily: Z.font, fontSize: 12, color: Z.muted, marginBottom: 16 }}>
                Note: hosting and ongoing platform costs (Stripe, email, webinar tool) are billed separately.
              </p>
              <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
                <button
                  onClick={handleHosting}
                  disabled={hostingLoading}
                  style={{
                    padding: "11px 24px",
                    background: hostingLoading ? Z.creamDeep : `linear-gradient(135deg, ${Z.pink}, ${Z.coral})`,
                    color: hostingLoading ? Z.muted : Z.white,
                    border: "none",
                    borderRadius: 10,
                    fontFamily: Z.font,
                    fontSize: 13,
                    fontWeight: 700,
                    cursor: hostingLoading ? "not-allowed" : "pointer",
                    letterSpacing: "0.02em",
                    boxShadow: hostingLoading ? "none" : "0 4px 16px rgba(255,0,126,0.25)",
                    transition: "all 0.2s",
                  }}
                >
                  {hostingLoading ? "Redirecting…" : "Get Ziva to host it →"}
                </button>
                <span style={{ fontFamily: Z.font, fontSize: 16, fontWeight: 700, color: Z.charcoal }}>
                  $1,499
                </span>
              </div>
            </div>
          </div>
        </div>

        <button
          onClick={onClose}
          style={{ background: "none", border: "none", color: Z.muted, fontFamily: Z.font, fontSize: 13, cursor: "pointer", padding: 0 }}
        >
          ← Back to preview
        </button>
      </div>
    </div>,
    document.body
  );
}
