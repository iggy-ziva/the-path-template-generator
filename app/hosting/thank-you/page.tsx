import Link from "next/link";

export default function HostingThankYouPage() {
  const Z = {
    cream:     "#FCFAF6",
    creamDeep: "#F5EEE0",
    charcoal:  "#2E2E2E",
    muted:     "#8A7A6A",
    pink:      "#FF007E",
    coral:     "#FA2A45",
    white:     "#FFFFFF",
  };

  return (
    <div style={{ minHeight: "100vh", background: Z.cream, display: "flex", alignItems: "center", justifyContent: "center", padding: 24, fontFamily: 'var(--font-barlow), -apple-system, sans-serif' }}>
      <div style={{ maxWidth: 560, width: "100%", textAlign: "center" }}>

        {/* Icon */}
        <div style={{ width: 72, height: 72, borderRadius: "50%", background: `linear-gradient(135deg, ${Z.pink}, ${Z.coral})`, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 32px", fontSize: 32, boxShadow: "0 8px 32px rgba(255,0,126,0.25)" }}>
          🚀
        </div>

        <h1 style={{ fontFamily: '"kudryashev-d-contrast", serif', fontSize: "clamp(2rem, 5vw, 2.8rem)", fontWeight: 400, color: Z.charcoal, lineHeight: 1.15, marginBottom: 16 }}>
          Your funnel is in our hands
        </h1>

        <p style={{ fontSize: 17, color: Z.muted, lineHeight: 1.7, marginBottom: 40 }}>
          Thank you for your order. The Ziva team will be in touch within <strong style={{ color: Z.charcoal }}>24 hours</strong> to collect your API keys and platform credentials. Setup typically completes within one week.
        </p>

        {/* What happens next */}
        <div style={{ background: Z.white, borderRadius: 16, padding: "28px 32px", marginBottom: 32, textAlign: "left", boxShadow: "0 2px 16px rgba(0,0,0,0.05)" }}>
          <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: Z.pink, marginBottom: 20 }}>
            What happens next
          </p>
          {[
            { n: "1", title: "We reach out within 24 hours", body: "Expect an email from development@ziva.marketing. We'll schedule a short call or exchange details via email." },
            { n: "2", title: "We collect your credentials", body: "We'll ask for API keys from your payment processor, email platform, webinar tool and domain registrar." },
            { n: "3", title: "Your funnel goes live", body: "We configure, test and deploy your funnel. You'll receive a handover document with login details and instructions." },
          ].map((step) => (
            <div key={step.n} style={{ display: "flex", gap: 16, marginBottom: 20 }}>
              <div style={{ width: 28, height: 28, borderRadius: "50%", background: `linear-gradient(135deg, ${Z.pink}, ${Z.coral})`, color: Z.white, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, flexShrink: 0 }}>
                {step.n}
              </div>
              <div>
                <p style={{ fontWeight: 700, color: Z.charcoal, fontSize: 14, marginBottom: 3 }}>{step.title}</p>
                <p style={{ fontSize: 13, color: Z.muted, lineHeight: 1.6 }}>{step.body}</p>
              </div>
            </div>
          ))}
        </div>

        <p style={{ fontSize: 13, color: Z.muted, marginBottom: 28 }}>
          Questions? Email us at{" "}
          <a href="mailto:development@ziva.marketing" style={{ color: Z.pink, fontWeight: 600 }}>
            development@ziva.marketing
          </a>
        </p>

        <Link href="/app/wizard" style={{ display: "inline-block", padding: "13px 32px", background: Z.charcoal, color: Z.white, borderRadius: 12, fontSize: 14, fontWeight: 700, textDecoration: "none", letterSpacing: "0.02em" }}>
          Back to wizard
        </Link>
      </div>
    </div>
  );
}
