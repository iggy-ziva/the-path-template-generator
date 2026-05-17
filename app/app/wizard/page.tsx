import { getSession } from "@/lib/session";
import WizardClient from "./WizardClient";

export const metadata = { title: "Customisation Wizard — The Path" };

export default async function WizardPage() {
  const session = await getSession();
  return <WizardClient userEmail={session?.email ?? ""} />;
}
