import type { PrismaClient } from "@/lib/generated/prisma/client";

// Mudanças de schema aditivas, aplicadas pelo próprio app.
//
// O projeto não tem migrations: o banco é único (dev/prod) e o histórico era
// `prisma db push` rodado à mão. Só que o deploy é automático e ninguém abre
// terminal no banco — então uma coluna nova só existia depois que alguém
// lembrasse de rodar o comando, e enquanto isso o app quebrava.
//
// Aqui a coisa se resolve sozinha: na primeira query de cada processo, estas
// instruções rodam uma vez. Regras para mexer nesta lista:
//
//   1. Só instrução IDEMPOTENTE (IF NOT EXISTS, DROP NOT NULL…) — ela roda de
//      novo a cada cold start.
//   2. Só mudança ADITIVA e retrocompatível. Nada que apague coluna ou dado:
//      durante o deploy a versão antiga do app ainda está servindo.
//   3. Toda mudança aqui também tem que estar no schema.prisma, que continua
//      sendo a fonte da verdade (`npm run db:push` faz o mesmo).
const STATEMENTS = [
  // motor do veículo — ex.: "1.0 Flex"
  `ALTER TABLE "vehicles" ADD COLUMN IF NOT EXISTS "engine" TEXT`,
  // mecânico pode ser cadastrado só com o nome, sem login
  `ALTER TABLE "users" ALTER COLUMN "email" DROP NOT NULL`,
];

let executando: Promise<void> | null = null;

async function aplicar(client: PrismaClient): Promise<void> {
  for (const sql of STATEMENTS) {
    try {
      await client.$executeRawUnsafe(sql);
    } catch (e) {
      // Não derruba a aplicação: se a instrução falhou porque a mudança já
      // está aplicada, seguir é o certo; se falhou de verdade, a query que
      // precisa da coluna dá um erro específico logo em seguida.
      console.error("[schema-guard] falhou:", sql, e);
    }
  }
}

// Roda uma vez por processo, na primeira vez que alguém pede.
export function ensureSchema(client: PrismaClient): Promise<void> {
  executando ??= aplicar(client);
  return executando;
}
