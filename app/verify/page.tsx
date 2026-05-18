import { Suspense } from "react";
import VerifyForm from "./VerifyForm";

export const metadata = { title: "Verify — The Path" };

export default function VerifyPage() {
  return (
    <Suspense fallback={
      <main style={{ minHeight: "100vh", background: "#FCFAF6", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ color: "#8A7A6A", fontSize: "14px", fontFamily: "Barlow, sans-serif" }}>Loading…</div>
      </main>
    }>
      <VerifyForm />
    </Suspense>
  );
}
