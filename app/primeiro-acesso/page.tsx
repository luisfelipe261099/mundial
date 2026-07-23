import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession, homeFor } from "@/lib/auth";
import { business } from "../_data/business";
import { PrimeiroAcessoForm } from "./primeiro-acesso-form";

export const metadata: Metadata = {
  title: "Primeiro acesso — Auto Mecânica Mundial",
  robots: { index: false, follow: false },
};

export default async function PrimeiroAcessoPage() {
  const session = await getSession();
  if (session) redirect(homeFor(session.kind));

  return (
    <main className="flex min-h-dvh items-center justify-center bg-[#05070c] px-5 py-10">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center text-center">
          <Image
            src="/images/logo.png"
            alt={business.name}
            width={56}
            height={56}
            className="size-14 rounded-full ring-1 ring-white/10"
          />
          <h1
            className="mt-4 text-xl font-extrabold tracking-tight text-white"
            style={{ fontFamily: "var(--font-outfit)" }}
          >
            Primeiro acesso
          </h1>
          <p className="mt-1 text-sm text-slate-400">
            Já é cliente da oficina? Ative sua conta com a placa e o telefone cadastrado.
          </p>
        </div>

        <PrimeiroAcessoForm />

        <p className="mt-6 text-center text-sm text-slate-400">
          Já ativou?{" "}
          <Link href="/login" className="font-semibold text-blue-400">
            Entrar
          </Link>
        </p>
      </div>
    </main>
  );
}
