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
  // NFS-e Nacional: configuração fiscal (certificado + emitente)…
  `CREATE TABLE IF NOT EXISTS "fiscal_config" (
    "id" TEXT NOT NULL DEFAULT 'default',
    "certPfx" TEXT,
    "certPassword" TEXT,
    "certSubject" TEXT,
    "certExpiresAt" TIMESTAMP(3),
    "cnpj" TEXT,
    "inscricaoMunicipal" TEXT,
    "serie" TEXT NOT NULL DEFAULT '1601',
    "proximoNumero" INTEGER NOT NULL DEFAULT 1,
    "cTribNac" TEXT NOT NULL DEFAULT '140101',
    "aliquotaIss" TEXT,
    "opSimpNac" TEXT NOT NULL DEFAULT '3',
    "regApTribSN" TEXT NOT NULL DEFAULT '1',
    "regEspTrib" TEXT NOT NULL DEFAULT '0',
    "ambiente" TEXT NOT NULL DEFAULT 'producao',
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "fiscal_config_pkey" PRIMARY KEY ("id")
  )`,
  // …e as notas emitidas
  `CREATE TABLE IF NOT EXISTS "fiscal_notas" (
    "id" TEXT NOT NULL,
    "serviceOrderId" TEXT NOT NULL,
    "chaveAcesso" TEXT,
    "numero" INTEGER NOT NULL,
    "serie" TEXT NOT NULL,
    "ambiente" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "valor" INTEGER NOT NULL,
    "descricao" TEXT,
    "nfseXml" TEXT,
    "erro" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "fiscal_notas_pkey" PRIMARY KEY ("id")
  )`,
  `ALTER TABLE "fiscal_config" ADD COLUMN IF NOT EXISTS "totTribPerc" TEXT NOT NULL DEFAULT '6.00'`,
  // Produção é o padrão. O UPDATE só alcança config ainda sem certificado —
  // depois que o admin configurou, a escolha de ambiente é dele.
  `ALTER TABLE "fiscal_config" ALTER COLUMN "ambiente" SET DEFAULT 'producao'`,
  `UPDATE "fiscal_config" SET "ambiente" = 'producao' WHERE "id" = 'default' AND "certPfx" IS NULL AND "ambiente" = 'restrita'`,
  `CREATE UNIQUE INDEX IF NOT EXISTS "fiscal_notas_chaveAcesso_key" ON "fiscal_notas"("chaveAcesso")`,
  `CREATE INDEX IF NOT EXISTS "fiscal_notas_serviceOrderId_idx" ON "fiscal_notas"("serviceOrderId")`,
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
