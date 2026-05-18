import { Suspense } from "react";
import LoginForm from "./LoginForm";

export const metadata = { title: "Sign In — The Path" };

export default function LoginPage() {
  return (
    <Suspense fallback={
      <main style={{ minHeight: "100vh", background: "#FCFAF6", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ color: "#8A7A6A", fontSize: "14px", fontFamily: "Barlow, sans-serif" }}>Loading…</div>
      </main>
    }>
      <LoginForm />
    </Suspense>
  );
}
