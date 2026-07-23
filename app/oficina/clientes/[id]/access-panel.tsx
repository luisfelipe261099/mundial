"use client";

import { useState, useTransition } from "react";
import { KeyRound, Copy, Check, AlertTriangle } from "lucide-react";
import { gerarAcessoCliente } from "../../actions";

export function AccessPanel({
  clientId,
  temAcesso,
  temVeiculo,
}: {
  clientId: string;
  temAcesso: boolean;
  temVeiculo: boolean;
}) {
  const [senha, setSenha] = useState<string | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [copiado, setCopiado] = useState(false);
  const [pending, startTransition] = useTransition();

  function gerar() {
    setErro(null);
    setSenha(null);
    startTransition(async () => {
      const r = await gerarAcessoCliente(clientId);
      if (r.error) setErro(r.error);
      else if (r.senha) setSenha(r.senha);
    });
  }

  function copiar() {
    if (!senha) return;
    navigator.clipboard?.writeText(senha).then(() => {
      setCopiado(true);
      setTimeout(() => setCopiado(false), 1500);
    });
  }

  return (
    <div className="adm-card p-5">
      <h3 className="adm-display mb-1 flex items-center gap-2 font-bold adm-ink">
        <KeyRound className="size-4 adm-brand" />
        Acesso ao app
      </h3>
      <p className="mb-4 text-sm adm-muted">
        {temAcesso
          ? "Este cliente já tem acesso. Você pode redefinir a senha se ele esqueceu."
          : "Este cliente ainda não ativou o acesso. Gere uma senha temporária para entregar a ele."}
      </p>

      {!temVeiculo && (
        <div className="mb-4 flex items-start gap-2 rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-sm adm-ink">
          <AlertTriangle className="mt-0.5 size-4 shrink-0 text-amber-400" />
          <span>Cliente sem veículo — ele entra pela placa, então cadastre um veículo antes, ou ele não conseguirá logar.</span>
        </div>
      )}

      {senha ? (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <code className="flex-1 rounded-lg border border-[var(--ad-line)] bg-[var(--ad-surface-2)] px-3 py-2 font-mono text-base font-semibold adm-ink">
              {senha}
            </code>
            <button
              type="button"
              onClick={copiar}
              aria-label="Copiar senha"
              className="grid size-9 place-items-center rounded-lg border border-[var(--ad-line)] adm-ink hover:bg-[var(--ad-surface-2)]"
            >
              {copiado ? <Check className="size-4 text-emerald-400" /> : <Copy className="size-4" />}
            </button>
          </div>
          <p className="text-xs adm-muted">
            Anote agora — esta senha só aparece uma vez. O cliente entra com a <strong className="adm-ink">placa</strong> + esta senha e pode trocá-la depois.
          </p>
        </div>
      ) : (
        <button
          type="button"
          onClick={gerar}
          disabled={pending}
          className="flex items-center gap-2 rounded-lg bg-[var(--ad-brand)] px-4 py-2.5 text-sm font-semibold text-white transition-colors enabled:hover:bg-[#1b5fe0] disabled:opacity-50"
        >
          <KeyRound className="size-4" />
          {pending ? "Gerando…" : temAcesso ? "Redefinir acesso" : "Gerar primeiro acesso"}
        </button>
      )}

      {erro && <p className="mt-3 rounded-lg bg-rose-500/10 px-3 py-2 text-sm text-rose-300">{erro}</p>}
    </div>
  );
}
