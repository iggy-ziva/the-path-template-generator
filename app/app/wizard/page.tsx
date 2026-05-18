import { Suspense } from "react";
import { getSession } from "@/lib/session";
import WizardClient from "./WizardClient";

export const metadata = { title: "Customisation Wizard — The Path" };

export default async function WizardPage() {
  const session = await getSession();
  return (
    <Suspense fallback={
      <div style={{ minHeight: "60vh", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--font-barlow), sans-serif", color: "#8A7A6A" }}>
        Loading…
      </div>
    }>
      <WizardClient userEmail={session?.email ?? ""} />
    </Suspense>
  );
}
