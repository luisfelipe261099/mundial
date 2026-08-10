// Sincroniza o schema do Prisma com o banco antes do build.
//
// O projeto não usa migrations: o banco é único (dev/prod, Neon/Retool) e as
// mudanças de schema entram por `prisma db push`. Rodar isso no build faz o
// deploy se aplicar sozinho — ninguém precisa lembrar de mexer no banco à mão
// antes de publicar.
//
// Falha segura: se o banco não estiver alcançável (ou o DATABASE_URL não
// estiver configurado), o build QUEBRA de propósito. É melhor o deploy não
// sair — a Vercel mantém a versão anterior no ar — do que subir um código que
// espera colunas que o banco ainda não tem.
//
// `db push` roda sem `--accept-data-loss`: mudança aditiva (coluna nova,
// coluna virando nullable) passa; qualquer coisa que apagaria dado para o
// build em vez de destruir.
//
// Escape hatch: SKIP_DB_SYNC=1 pula esta etapa.

import { spawnSync } from "node:child_process";

if (process.env.SKIP_DB_SYNC === "1") {
  console.log("[db-sync] SKIP_DB_SYNC=1 — pulando a sincronização do schema.");
  process.exit(0);
}

if (!process.env.DATABASE_URL) {
  console.error(
    [
      "",
      "[db-sync] DATABASE_URL não está definida neste ambiente de build.",
      "",
      "O build foi interrompido de propósito: sem sincronizar o schema, o app",
      "subiria esperando colunas que o banco pode não ter.",
      "",
      "Como resolver:",
      "  1. Vercel → projeto → Settings → Environment Variables → DATABASE_URL",
      "     precisa estar disponível também para o Build (não só para Runtime).",
      "  2. Ou aplique o schema à mão no banco e refaça o deploy com",
      "     SKIP_DB_SYNC=1.",
      "",
    ].join("\n")
  );
  process.exit(1);
}

console.log("[db-sync] aplicando o schema ao banco (prisma db push)…");
const r = spawnSync("npx", ["prisma", "db", "push"], { stdio: "inherit", shell: false });

if (r.status !== 0) {
  console.error(
    [
      "",
      "[db-sync] o `prisma db push` falhou — build interrompido.",
      "",
      "Sem --accept-data-loss, o push só recusa quando a mudança apagaria dado.",
      "Confira o erro acima antes de publicar.",
      "",
    ].join("\n")
  );
  process.exit(r.status ?? 1);
}

console.log("[db-sync] schema em dia.");
