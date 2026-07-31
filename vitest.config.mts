import { defineConfig } from "vitest/config";

// Só lógica pura, em ambiente node. Componentes React não são testados aqui —
// a verificação deles é lint + tsc + navegador.
export default defineConfig({
  test: {
    environment: "node",
    include: ["lib/**/*.test.ts"],
  },
});
