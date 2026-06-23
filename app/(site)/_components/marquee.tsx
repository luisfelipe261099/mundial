const words = [
  "Diagnóstico eletrônico",
  "Troca de óleo & filtros",
  "Freios & suspensão",
  "Câmbio automático · CVT",
  "Veículos híbridos",
  "Injeção eletrônica",
  "Revisão completa",
  "Alinhamento & balanceamento",
];

export function Marquee() {
  // Duplicado pra emendar o loop sem corte.
  const loop = [...words, ...words];
  return (
    <div className="relative overflow-hidden border-y border-[var(--line)] bg-[var(--ink-2)] py-4">
      <div className="marquee">
        {loop.map((w, i) => (
          <span key={i} className="flex items-center whitespace-nowrap">
            <span className="v2-mono px-7 text-[12px] text-[var(--paper-2)]">{w}</span>
            <span className="h-1.5 w-1.5 rotate-45 bg-[var(--signal)]" />
          </span>
        ))}
      </div>
    </div>
  );
}
