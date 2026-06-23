import type { Metadata, Viewport } from "next";
import { redirect } from "next/navigation";
import { getSession, homeFor } from "@/lib/auth";
import { getNaoLidas } from "@/lib/client-data";
import "./app.css";
import AppShell from "./_components/app-shell";

// O wrapper .app-root liga o tema escuro (via html:has(.app-root) no app.css),
// sem afetar o site de marketing. Fontes (--font-outfit/--font-work-sans) já
// vêm do root layout.
export const metadata: Metadata = {
  title: "App do Cliente — Auto Mecânica Mundial",
  description: "Protótipo do aplicativo do cliente da Auto Mecânica Mundial.",
  robots: { index: false, follow: false },
  // Comporta-se como app ao ser instalado na tela inicial (iOS).
  appleWebApp: { capable: true, title: "Mundial", statusBarStyle: "black-translucent" },
};

export const viewport: Viewport = {
  themeColor: "#0a0e17",
};

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (session.kind !== "cliente") redirect(homeFor(session.kind));

  const unread = await getNaoLidas(session.id);

  return (
    <div className="app-root">
      <AppShell unread={unread}>{children}</AppShell>
    </div>
  );
}
