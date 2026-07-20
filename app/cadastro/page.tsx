import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession, homeFor } from "@/lib/auth";
import { business } from "../_data/business";
import { CadastroForm } from "./cadastro-form";

export const metadata: Metadata = {
  title: "Criar conta — Auto Mecânica Mundial",
  robots: { index: false, follow: false },
};

export default async function CadastroPage() {
  const session = await getSession();
  if (session) redirect(homeFor(session.kind));

  return (
    <main className="relative flex min-h-dvh items-center justify-center overflow-hidden bg-[#05070c] px-5 py-10">
      {/* brilhos ambientais */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(42rem 28rem at 78% -10%, rgba(37,99,235,0.16), transparent 60%), radial-gradient(34rem 24rem at 10% 108%, rgba(79,70,229,0.12), transparent 55%)",
        }}
      />

      <div className="relative w-full max-w-sm">
        <div className="flex flex-col items-center text-center">
          <span className="relative isolate">
            <Image
              src="/images/logo.png"
              alt={business.name}
              width={56}
              height={56}
              className="size-14 rounded-full ring-1 ring-white/15"
            />
            <span className="absolute -inset-2 -z-10 rounded-full bg-blue-600/30 blur-xl" />
          </span>
          <h1
            className="mt-4 text-xl font-extrabold tracking-tight text-white"
            style={{ fontFamily: "var(--font-outfit)" }}
          >
            Criar sua conta
          </h1>
          <p className="mt-1 text-sm text-slate-400">Acompanhe seu carro pelo celular.</p>
        </div>

        <div className="mt-8 rounded-2xl border border-white/10 bg-white/[0.04] p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_24px_48px_-24px_rgba(2,6,18,0.9)] backdrop-blur-xl sm:p-6">
          <CadastroForm />
        </div>

        <p className="mt-6 text-center text-sm text-slate-400">
          Já tem conta?{" "}
          <Link
            href="/login"
            className="font-semibold text-blue-400 transition-colors hover:text-blue-300"
          >
            Entrar
          </Link>
        </p>
      </div>
    </main>
  );
}
