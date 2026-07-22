// Normalização de busca compartilhada pelas listagens do admin.
// Remove acentos e tudo que não é letra/número — assim "ABC-1D23",
// "abc1d23" e "(41) 99650-6790"/"99650" se encontram.
export function norm(s: string): string {
  return s
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");
}

export function matches(fields: (string | null | undefined)[], busca: string): boolean {
  const b = norm(busca);
  if (!b) return true;
  return fields.some((f) => f != null && norm(f).includes(b));
}
