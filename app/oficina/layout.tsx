import type { Metadata } from "next";
import "./admin.css";
import AdminShell from "./_components/admin-shell";

export const metadata: Metadata = {
  title: "Painel da Oficina — Auto Mecânica Mundial",
  description: "Painel administrativo da Auto Mecânica Mundial (protótipo).",
  robots: { index: false, follow: false },
};

export default function OficinaLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="admin-root">
      <AdminShell>{children}</AdminShell>
    </div>
  );
}
