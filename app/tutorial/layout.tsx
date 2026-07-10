import type { Metadata } from "next";
import "./tutorial.css";

export const metadata: Metadata = {
  title: "Tutorial — Oficina Noturna",
  description: "Guia de uso da plataforma para administrador, mecânico e cliente.",
  robots: { index: false, follow: false },
};

export default function TutorialLayout({ children }: { children: React.ReactNode }) {
  return <div className="tut-root">{children}</div>;
}
