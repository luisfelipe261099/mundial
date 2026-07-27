import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/lib/generated/prisma/client";

// Prisma 7: conexão via driver adapter (pg). A URL vem do .env (carregado
// pelo Next em runtime). Singleton para não estourar conexões no dev (HMR).
const connectionString = process.env.DATABASE_URL;

if (!connectionString && process.env.NODE_ENV === "production") {
  // Falha explícita e cedo. Sem isto, o `pg` cai nos defaults do sistema
  // (PGHOST/PGUSER) e cada página quebra com um erro de conexão irreconhecível.
  throw new Error("DATABASE_URL não definida — obrigatória em produção (configure na Vercel).");
}

const adapter = new PrismaPg({
  connectionString,
  // Cada instância serverless mantém seu próprio pool. Com o default (10) e
  // várias instâncias simultâneas, o pooler do Postgres estoura; em Fluid
  // Compute uma instância atende várias requisições, então poucas conexões
  // por instância bastam.
  max: 5,
  idleTimeoutMillis: 10_000,
  connectionTimeoutMillis: 10_000,
});

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma = globalForPrisma.prisma ?? new PrismaClient({ adapter });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
