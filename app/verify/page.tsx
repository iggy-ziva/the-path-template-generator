import { Suspense } from "react";
import VerifyForm from "./VerifyForm";

export const metadata = { title: "Verify — The Path" };

export default function VerifyPage() {
  return (
    <Suspense fallback={
      <main style={{ minHeight: "100vh", background: "#0f0e0c", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ color: "#888", fontSize: "14px" }}>Loading…</div>
      </main>
    }>
      <VerifyForm />
    </Suspense>
  );
}
