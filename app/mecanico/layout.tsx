import type { Metadata } from "next";
import "./mecanico.css";
import MecShell from "./_components/mec-shell";

export const metadata: Metadata = {
  title: "Mecânico — Auto Mecânica Mundial",
  description: "Área do mecânico (protótipo).",
  robots: { index: false, follow: false },
};

export default function MecanicoLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="mec-root">
      <MecShell>{children}</MecShell>
    </div>
  );
}
