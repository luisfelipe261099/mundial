import type { Metadata } from "next";
import "./app.css";
import AppShell from "./_components/app-shell";

// O wrapper .app-root liga o tema escuro (via html:has(.app-root) no app.css),
// sem afetar o site de marketing. Fontes (--font-outfit/--font-work-sans) já
// vêm do root layout.
export const metadata: Metadata = {
  title: "App do Cliente — Auto Mecânica Mundial",
  description: "Protótipo do aplicativo do cliente da Auto Mecânica Mundial.",
  robots: { index: false, follow: false },
};

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="app-root">
      <AppShell>{children}</AppShell>
    </div>
  );
}
