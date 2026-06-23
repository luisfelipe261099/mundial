"use client";

import { useState } from "react";
import { Copy, Check } from "lucide-react";

// Placa + botão copiar. Como o card é um <Link>, prevenimos a navegação ao copiar.
export function CopyPlate({ placa }: { placa: string }) {
  const [copied, setCopied] = useState(false);

  return (
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        navigator.clipboard
          ?.writeText(placa)
          .then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 1500);
          })
          .catch(() => {});
      }}
      aria-label={`Copiar placa ${placa}`}
      className="inline-flex items-center gap-2 text-white"
    >
      <span className="font-mono text-base font-bold tracking-wider">{placa}</span>
      {copied ? (
        <Check className="size-4 text-emerald-300" />
      ) : (
        <Copy className="size-4 text-white/70" />
      )}
    </button>
  );
}
