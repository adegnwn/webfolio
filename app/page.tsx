import { redirect } from "next/navigation";

// The landing page arrives in Fase 2 (PRD 8.3, week 10). Until then the root opens the editor.
export default function Home() {
  redirect("/dashboard");
}
