import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getSession, homeFor } from "@/lib/auth";
import "./admin.css";
import AdminShell from "./_components/admin-shell";

export const metadata: Metadata = {
  title: "Painel da Oficina — Auto Mecânica Mundial",
  description: "Painel administrativo da Auto Mecânica Mundial (protótipo).",
  robots: { index: false, follow: false },
};

export default async function OficinaLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (session.kind !== "admin") redirect(homeFor(session.kind));

  return (
    <div className="admin-root">
      <AdminShell userName={session.name}>{children}</AdminShell>
    </div>
  );
}
