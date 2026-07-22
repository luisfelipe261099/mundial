"use client";

import { Search, X } from "lucide-react";

const fieldCls =
  "rounded-lg border border-[var(--ad-line)] bg-[var(--ad-surface-2)] px-3 py-2 text-sm adm-ink outline-none focus:border-[var(--ad-brand)]";

export function SearchInput({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
}) {
  return (
    <div className="relative min-w-0 flex-1 sm:max-w-xs">
      <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 adm-muted" />
      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        aria-label={placeholder}
        className={`${fieldCls} w-full pl-9 ${value ? "pr-8" : ""} [&::-webkit-search-cancel-button]:hidden [&::-webkit-search-decoration]:hidden`}
      />
      {value && (
        <button
          type="button"
          onClick={() => onChange("")}
          aria-label="Limpar busca"
          className="absolute right-2 top-1/2 -translate-y-1/2 adm-muted hover:adm-ink"
        >
          <X className="size-4" />
        </button>
      )}
    </div>
  );
}

export function FilterChip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`shrink-0 rounded-full border px-3.5 py-1.5 text-sm font-semibold transition-colors ${
        active
          ? "border-[var(--ad-brand)] bg-[var(--ad-brand)] text-white"
          : "border-[var(--ad-line)] adm-muted"
      }`}
    >
      {children}
    </button>
  );
}

export function FilterSelect({
  value,
  onChange,
  options,
  ariaLabel,
}: {
  value: string;
  onChange: (v: string) => void;
  options: string[];
  ariaLabel: string;
}) {
  return (
    <select aria-label={ariaLabel} value={value} onChange={(e) => onChange(e.target.value)} className={fieldCls}>
      {options.map((o) => (
        <option key={o} value={o}>
          {o}
        </option>
      ))}
    </select>
  );
}

export function ResultBar({
  shown,
  total,
  active,
  onClear,
}: {
  shown: number;
  total: number;
  active: boolean;
  onClear: () => void;
}) {
  if (!active) return null;
  return (
    <div className="flex items-center gap-3 text-sm adm-muted">
      <span>
        <span className="font-semibold adm-ink">{shown}</span> de {total}
      </span>
      <button type="button" onClick={onClear} className="font-semibold adm-brand hover:underline">
        Limpar filtros
      </button>
    </div>
  );
}

export function EmptyRow({ colSpan, busca }: { colSpan: number; busca: string }) {
  return (
    <tr>
      <td colSpan={colSpan} className="px-5 py-10 text-center adm-muted">
        Nenhum resultado{busca ? (
          <>
            {" "}para "<span className="adm-ink">{busca}</span>"
          </>
        ) : null}
        .
      </td>
    </tr>
  );
}
