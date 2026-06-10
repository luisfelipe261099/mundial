const words = [
  "Diagnóstico eletrônico",
  "Câmbio automático & CVT",
  "Veículos híbridos",
  "Freios & suspensão",
  "Injeção eletrônica",
  "Troca de óleo & filtros",
  "Revisão completa",
  "Alinhamento & balanceamento",
];

export function Strip() {
  const loop = [...words, ...words];
  return (
    <div className="relative overflow-hidden border-y border-[var(--line)] bg-[var(--bg-2)] py-5">
      <div className="v3-marquee">
        {loop.map((w, i) => (
          <span key={i} className="flex items-center whitespace-nowrap">
            <span className="v3-over px-8 text-[11px] text-[var(--fg-2)]">{w}</span>
            <span className="h-1 w-1 rounded-full bg-[var(--metal)]" />
          </span>
        ))}
      </div>
    </div>
  );
}
