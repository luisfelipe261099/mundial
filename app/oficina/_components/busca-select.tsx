"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Check, ChevronDown, X } from "lucide-react";

// Seletor com busca por digitação. Nasceu da lista de veículos: cliente com
// 60 carros vira uma rolagem interminável no <select> comum, e o balcão sabe
// a placa de cabeça. Aqui dá pra digitar "sandero", "bbj47" ou os dois.

export interface OpcaoBusca {
  valor: string;
  rotulo: string;
  /** Texto extra mostrado ao lado e também procurado (placa, por exemplo). */
  detalhe?: string;
}

// Tira acento e pontuação: "RENAULT SANDERO · BBJ-4760" vira
// "renault sandero bbj4760".
function normaliza(texto: string) {
  return texto
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

const rotuloCompleto = (o: OpcaoBusca) => (o.detalhe ? `${o.rotulo} · ${o.detalhe}` : o.rotulo);

export function BuscaSelect({
  id,
  opcoes,
  valor,
  onChange,
  placeholder = "Digite para procurar…",
  nenhum,
  vazio = "Nada encontrado.",
  disabled = false,
}: {
  id: string;
  opcoes: OpcaoBusca[];
  valor: string;
  onChange: (valor: string) => void;
  placeholder?: string;
  /** Rótulo da opção vazia (ex.: "Sem veículo vinculado"). Sem isso, não há opção vazia. */
  nenhum?: string;
  vazio?: string;
  disabled?: boolean;
}) {
  const [aberto, setAberto] = useState(false);
  const [busca, setBusca] = useState("");
  const [ativo, setAtivo] = useState(0);
  const caixa = useRef<HTMLDivElement>(null);
  const campo = useRef<HTMLInputElement>(null);
  const lista = useRef<HTMLUListElement>(null);

  const selecionada = opcoes.find((o) => o.valor === valor) ?? null;

  const filtradas = useMemo(() => {
    const termos = normaliza(busca).split(" ").filter(Boolean);
    if (termos.length === 0) return opcoes;
    return opcoes.filter((o) => {
      const alvo = normaliza(rotuloCompleto(o));
      const junto = alvo.replace(/ /g, "");
      // Cada palavra digitada tem que aparecer — "renault bbj" acha o carro.
      return termos.every((t) => alvo.includes(t) || junto.includes(t));
    });
  }, [opcoes, busca]);

  // Índice sempre dentro da lista filtrada — ela encolhe a cada tecla.
  const ativoSeguro = Math.min(ativo, Math.max(filtradas.length - 1, 0));

  // Fecha ao clicar fora.
  useEffect(() => {
    if (!aberto) return;
    const fora = (e: MouseEvent) => {
      if (caixa.current && !caixa.current.contains(e.target as Node)) {
        setAberto(false);
        setBusca("");
      }
    };
    document.addEventListener("mousedown", fora);
    return () => document.removeEventListener("mousedown", fora);
  }, [aberto]);

  // Mantém a opção destacada à vista quando navega pelo teclado.
  useEffect(() => {
    if (!aberto) return;
    // A opção "nenhum", quando aparece, é o primeiro <li> da lista.
    const deslocamento = nenhum && !busca.trim() ? 1 : 0;
    lista.current?.children[ativoSeguro + deslocamento]?.scrollIntoView({ block: "nearest" });
  }, [ativoSeguro, aberto, nenhum, busca]);

  function abrir() {
    if (disabled) return;
    setBusca("");
    setAtivo(0);
    setAberto(true);
  }

  function escolher(opcaoValor: string) {
    onChange(opcaoValor);
    setAberto(false);
    setBusca("");
  }

  function teclado(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      if (!aberto) abrir();
      else setAtivo(Math.min(ativoSeguro + 1, filtradas.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setAtivo(Math.max(ativoSeguro - 1, 0));
    } else if (e.key === "Enter" && aberto) {
      const alvo = filtradas[ativoSeguro];
      if (alvo) {
        e.preventDefault();
        escolher(alvo.valor);
      }
    } else if (e.key === "Escape" && aberto) {
      e.preventDefault();
      setAberto(false);
      setBusca("");
    } else if (e.key === "Tab") {
      setAberto(false);
      setBusca("");
    }
  }

  return (
    <div ref={caixa} className="relative">
      <input
        ref={campo}
        id={id}
        type="text"
        role="combobox"
        aria-expanded={aberto}
        aria-controls={`${id}-lista`}
        aria-autocomplete="list"
        autoComplete="off"
        disabled={disabled}
        value={aberto ? busca : selecionada ? rotuloCompleto(selecionada) : ""}
        placeholder={selecionada && aberto ? rotuloCompleto(selecionada) : placeholder}
        onFocus={abrir}
        onClick={abrir}
        onChange={(e) => {
          setBusca(e.target.value);
          setAtivo(0);
          setAberto(true);
        }}
        onKeyDown={teclado}
        className="w-full rounded-lg border border-[var(--ad-line)] bg-[var(--ad-surface-2)] px-3 py-2.5 pr-16 text-sm adm-ink outline-none transition-colors focus:border-[var(--ad-brand)] disabled:opacity-50"
      />

      {selecionada && !disabled && (
        <button
          type="button"
          aria-label="Limpar seleção"
          // preventDefault no mousedown: senão o campo perde o foco antes do clique
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => escolher("")}
          className="absolute right-8 top-1/2 grid size-6 -translate-y-1/2 place-items-center rounded-md adm-muted hover:bg-[var(--ad-surface-3)] hover:adm-ink"
        >
          <X className="size-3.5" />
        </button>
      )}
      <ChevronDown className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 adm-muted" />

      {aberto && (
        <ul
          ref={lista}
          id={`${id}-lista`}
          role="listbox"
          className="absolute left-0 right-0 z-30 mt-1 max-h-64 overflow-y-auto rounded-lg border border-[var(--ad-line)] bg-[var(--ad-surface)] py-1 shadow-[var(--ad-shadow-lg)]"
        >
          {nenhum && !busca.trim() && (
            <li>
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => escolher("")}
                className="flex w-full items-center justify-between px-3 py-2 text-left text-sm adm-muted hover:bg-[var(--ad-surface-2)]"
              >
                {nenhum}
                {!selecionada && <Check className="size-4 adm-brand" />}
              </button>
            </li>
          )}

          {filtradas.length === 0 && (
            <li className="px-3 py-3 text-sm adm-muted">{vazio}</li>
          )}

          {filtradas.map((o, i) => (
            <li key={o.valor}>
              <button
                type="button"
                role="option"
                aria-selected={o.valor === valor}
                onMouseEnter={() => setAtivo(i)}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => escolher(o.valor)}
                className={`flex w-full items-center justify-between gap-3 px-3 py-2 text-left text-sm transition-colors ${
                  i === ativoSeguro ? "bg-[var(--ad-surface-3)] adm-ink" : "adm-ink"
                }`}
              >
                <span className="min-w-0 flex-1 truncate">{o.rotulo}</span>
                {o.detalhe && (
                  <span className="shrink-0 font-mono text-xs adm-muted">{o.detalhe}</span>
                )}
                {o.valor === valor && <Check className="size-4 shrink-0 adm-brand" />}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
