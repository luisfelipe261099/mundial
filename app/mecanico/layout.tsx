import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getSession, homeFor } from "@/lib/auth";
import "./mecanico.css";
import MecShell from "./_components/mec-shell";

export const metadata: Metadata = {
  title: "Mecânico — Auto Mecânica Mundial",
  description: "Área do mecânico (protótipo).",
  robots: { index: false, follow: false },
};

export default async function MecanicoLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (session.kind !== "mecanico" && session.kind !== "admin") redirect(homeFor(session.kind));

  return (
    <div className="mec-root">
      <MecShell>{children}</MecShell>
    </div>
  );
}
