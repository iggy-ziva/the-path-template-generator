import { Suspense } from "react";
import DesignServiceThankYouContent from "./DesignServiceThankYouContent";

export default function DesignServiceThankYouPage() {
  return (
    <Suspense fallback={
      <main style={{ minHeight: "100vh", background: "#FCFAF6", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <p style={{ color: "#8A7A6A", fontFamily: "var(--font-barlow), sans-serif" }}>Loading…</p>
      </main>
    }>
      <DesignServiceThankYouContent />
    </Suspense>
  );
}
