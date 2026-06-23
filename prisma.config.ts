import "dotenv/config";
import { defineConfig } from "@prisma/config";

// Usamos process.env (e NÃO env()) de propósito: env() lança erro se a variável
// não existir, o que quebrava o `prisma generate` do postinstall no build do
// Vercel (lá não há .env). Com process.env + fallback, o generate roda sempre.
// Migração/db push reais continuam exigindo um DATABASE_URL válido (no .env
// local, ou nas Environment Variables do projeto Vercel).
export default defineConfig({
  schema: "prisma/schema.prisma",
  datasource: {
    url:
      process.env.DATABASE_URL ??
      "postgresql://placeholder:placeholder@localhost:5432/placeholder",
  },
});
