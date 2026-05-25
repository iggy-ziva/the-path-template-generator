import { getSession } from "@/lib/session";
import AppHeader from "./AppHeader";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#FCFAF6",
        color: "#2E2E2E",
        fontFamily: 'var(--font-barlow), -apple-system, sans-serif',
      }}
    >
      <AppHeader email={session?.email} />
      {children}
    </div>
  );
}
