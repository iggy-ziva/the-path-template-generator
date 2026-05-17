import { Suspense } from "react";
import LoginForm from "./LoginForm";

export const metadata = { title: "Sign In — The Path" };

export default function LoginPage() {
  return (
    <Suspense fallback={
      <main style={{ minHeight: "100vh", background: "#0f0e0c", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ color: "#888", fontSize: "14px" }}>Loading…</div>
      </main>
    }>
      <LoginForm />
    </Suspense>
  );
}
