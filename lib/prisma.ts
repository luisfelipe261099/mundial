import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/lib/generated/prisma/client";
import { ensureSchema } from "./schema-guard";

// Prisma 7: conexão via driver adapter (pg). A URL vem do .env (carregado
// pelo Next em runtime). Singleton para não estourar conexões no dev (HMR).
const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });

function criar() {
  const base = new PrismaClient({ adapter });
  // Garante o schema antes da primeira query do processo (ver schema-guard).
  // Depois que a promessa resolve, o await sai de graça.
  return base.$extends({
    query: {
      async $allOperations({ args, query }) {
        await ensureSchema(base);
        return query(args);
      },
    },
  }) as unknown as PrismaClient;
}

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma = globalForPrisma.prisma ?? criar();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
