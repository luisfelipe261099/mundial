"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import { matches } from "./filter-utils";

export type ComboOption = { id: string; label: string; hint?: string };
/** `id` nulo = texto livre, sem vínculo com registro do banco. */
export type ComboValue = { id: string | null; texto: string };

const MAX_VISIVEIS = 50;

const inputCls =
  "w-full rounded-lg border border-[var(--ad-line)] bg-[var(--ad-surface-2)] px-3 py-2 text-sm adm-ink outline-none focus:border-[var(--ad-brand)]";

export function Combobox({
  value,
  onChange,
  options,
  ariaLabel,
  placeholder,
  criarLabel,
  onCriar,
  className = "",
}: {
  value: ComboValue;
  onChange: (v: ComboValue) => void;
  options: ComboOption[];
  ariaLabel: string;
  placeholder?: string;
  criarLabel?: (texto: string) => string;
  onCriar?: (texto: string) => void;
  className?: string;
}) {
  const [aberto, setAberto] = useState(false);
  const [realce, setRealce] = useState(0);
  const raizRef = useRef<HTMLDivElement>(null);
  const listaId = useId();

  // matches() ignora acento e pontuação: "jose" acha "José Antônio".
  const achadas = useMemo(
    () => options.filter((o) => matches([o.label, o.hint], value.texto)),
    [options, value.texto]
  );
  const visiveis = achadas.slice(0, MAX_VISIVEIS);

  const podeCriar =
    !!criarLabel &&
    !!onCriar &&
    value.texto.trim() !== "" &&
    !achadas.some((o) => o.label.toLowerCase() === value.texto.trim().toLowerCase());

  const total = visiveis.length + (podeCriar ? 1 : 0);

  // Fecha ao clicar fora.
  useEffect(() => {
    if (!aberto) return;
    function fora(e: PointerEvent) {
      if (!raizRef.current?.contains(e.target as Node)) setAberto(false);
    }
    document.addEventListener("pointerdown", fora);
    return () => document.removeEventListener("pointerdown", fora);
  }, [aberto]);

  function escolher(i: number) {
    if (podeCriar && i === visiveis.length) {
      onCriar?.(value.texto.trim());
    } else {
      const o = visiveis[i];
      if (o) onChange({ id: o.id, texto: o.label });
    }
    setAberto(false);
  }

  function aoTeclar(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault();
      if (!aberto) {
        setAberto(true);
        setRealce(0);
        return;
      }
      if (total === 0) return;
      setRealce((r) => (e.key === "ArrowDown" ? (r + 1) % total : (r - 1 + total) % total));
    } else if (e.key === "Enter") {
      if (aberto && total > 0) {
        e.preventDefault();
        escolher(realce);
      }
    } else if (e.key === "Escape") {
      setAberto(false);
    }
  }

  return (
    <div ref={raizRef} className={`relative ${className}`}>
      <input
        type="text"
        role="combobox"
        aria-expanded={aberto}
        aria-controls={listaId}
        aria-autocomplete="list"
        aria-activedescendant={aberto && total > 0 ? `${listaId}-${realce}` : undefined}
        aria-label={ariaLabel}
        placeholder={placeholder}
        autoComplete="off"
        value={value.texto}
        onChange={(e) => {
          // Editar o texto desfaz o vínculo: o que está escrito deixa de ser
          // garantidamente o registro escolhido antes.
          onChange({ id: null, texto: e.target.value });
          setAberto(true);
          setRealce(0);
        }}
        onFocus={() => setAberto(true)}
        onKeyDown={aoTeclar}
        className={inputCls}
      />

      {aberto && total > 0 && (
        <ul
          id={listaId}
          role="listbox"
          aria-label={ariaLabel}
          className="absolute z-20 mt-1 max-h-64 w-full overflow-y-auto rounded-lg border border-[var(--ad-line)] bg-[var(--ad-surface)] py-1 shadow-xl"
        >
          {visiveis.map((o, i) => (
            <li
              key={o.id}
              id={`${listaId}-${i}`}
              role="option"
              aria-selected={i === realce}
              onPointerDown={(e) => {
                e.preventDefault(); // não tira o foco do input antes do clique
                escolher(i);
              }}
              onPointerEnter={() => setRealce(i)}
              className={`cursor-pointer px-3 py-2 text-sm ${
                i === realce ? "bg-[var(--ad-surface-2)] adm-ink" : "adm-muted"
              }`}
            >
              {o.label}
              {o.hint && <span className="ml-2 font-mono text-xs adm-muted">{o.hint}</span>}
            </li>
          ))}

          {podeCriar && (
            <li
              id={`${listaId}-${visiveis.length}`}
              role="option"
              aria-selected={realce === visiveis.length}
              onPointerDown={(e) => {
                e.preventDefault();
                escolher(visiveis.length);
              }}
              onPointerEnter={() => setRealce(visiveis.length)}
              className={`cursor-pointer border-t border-[var(--ad-line)] px-3 py-2 text-sm font-semibold adm-brand ${
                realce === visiveis.length ? "bg-[var(--ad-surface-2)]" : ""
              }`}
            >
              {criarLabel?.(value.texto.trim())}
            </li>
          )}
        </ul>
      )}

      {aberto && achadas.length > MAX_VISIVEIS && (
        <p className="absolute z-20 mt-1 w-full rounded-b-lg bg-[var(--ad-surface-2)] px-3 py-1 text-xs adm-muted">
          Mostrando {MAX_VISIVEIS} de {achadas.length} — refine a busca.
        </p>
      )}
    </div>
  );
}
