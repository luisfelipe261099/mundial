import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession, homeFor } from "@/lib/auth";
import { business } from "../_data/business";
import { LoginForm } from "./login-form";

export const metadata: Metadata = {
  title: "Entrar — Auto Mecânica Mundial",
  robots: { index: false, follow: false },
};

export default async function LoginPage() {
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
            {business.name}
          </h1>
          <p className="mt-1 text-sm text-slate-400">Acesse sua conta</p>
        </div>

        <LoginForm />

        <p className="mt-6 text-center text-xs leading-relaxed text-slate-500">
          Cliente: entre com o <strong className="text-slate-300">e-mail</strong> ou a{" "}
          <strong className="text-slate-300">placa do carro</strong> + senha.
        </p>

        <p className="mt-4 text-center text-sm text-slate-400">
          Novo por aqui?{" "}
          <Link href="/cadastro" className="font-semibold text-blue-400">
            Criar conta
          </Link>
        </p>

        <p className="mt-2 text-center text-sm text-slate-400">
          Primeira vez?{" "}
          <Link href="/tutorial" className="font-semibold text-blue-400">
            Veja o tutorial
          </Link>
        </p>
      </div>
    </main>
  );
}
