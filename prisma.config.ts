import "dotenv/config";
import { defineConfig, env } from "@prisma/config";

// Prisma 7: a URL de migração/introspecção fica aqui (não mais no schema).
// O runtime (PrismaClient) usa um driver adapter — ver lib/prisma.ts.
export default defineConfig({
  schema: "prisma/schema.prisma",
  datasource: {
    url: env("DATABASE_URL"),
  },
});
