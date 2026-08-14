"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  ShieldCheck,
  Upload,
  Trash2,
  Check,
  X,
  AlertTriangle,
  Building2,
  PlugZap,
  FlaskConical,
} from "lucide-react";
import type { FiscalConfigView } from "@/lib/fiscal";
import { salvarCertificado, removerCertificado, salvarEmitente, testarConexao } from "../actions";

const inputCls =
  "w-full rounded-lg border border-[var(--ad-line)] bg-[var(--ad-surface-2)] px-3 py-2.5 text-sm adm-ink outline-none transition-colors focus:border-[var(--ad-brand)]";
const labelCls = "mb-1 block text-xs font-medium adm-muted";

type Feedback = { type: "ok" | "err"; text: string } | null;

export function FiscalManager({ config }: { config: FiscalConfigView }) {
  const [pending, start] = useTransition();
  const [feedback, setFeedback] = useState<Feedback>(null);
  const router = useRouter();

  // certificado
  const fileRef = useRef<HTMLInputElement>(null);
  const [senha, setSenha] = useState("");
  const [confirmRemover, setConfirmRemover] = useState(false);

  // emitente
  const [f, setF] = useState({
    cnpj: config.cnpj,
    inscricaoMunicipal: config.inscricaoMunicipal,
    serie: config.serie,
    proximoNumero: String(config.proximoNumero),
    cTribNac: config.cTribNac,
    aliquotaIss: config.aliquotaIss,
    totTribPerc: config.totTribPerc,
    opSimpNac: config.opSimpNac,
    regApTribSN: config.regApTribSN,
    ambiente: config.ambiente,
  });
  const set = (k: keyof typeof f, v: string) => setF((x) => ({ ...x, [k]: v }));

  function enviarCertificado(e: React.FormEvent) {
    e.preventDefault();
    const arquivo = fileRef.current?.files?.[0];
    if (!arquivo) {
      setFeedback({ type: "err", text: "Selecione o arquivo .pfx do certificado." });
      return;
    }
    const fd = new FormData();
    fd.set("pfx", arquivo);
    fd.set("senha", senha);
    start(async () => {
      const r = await salvarCertificado(fd);
      if (r.ok) {
        setFeedback({ type: "ok", text: "Certificado salvo com segurança. Use o teste de conexão abaixo." });
        setSenha("");
        if (fileRef.current) fileRef.current.value = "";
        router.refresh();
      } else {
        setFeedback({ type: "err", text: r.error ?? "Não foi possível salvar o certificado." });
      }
    });
  }

  function remover() {
    start(async () => {
      const r = await removerCertificado();
      setConfirmRemover(false);
      if (r.ok) {
        setFeedback({ type: "ok", text: "Certificado removido." });
        router.refresh();
      } else {
        setFeedback({ type: "err", text: r.error ?? "Não foi possível remover." });
      }
    });
  }

  function salvarDados(e: React.FormEvent) {
    e.preventDefault();
    start(async () => {
      const r = await salvarEmitente(f);
      if (r.ok) {
        setFeedback({ type: "ok", text: "Dados do emitente salvos." });
        router.refresh();
      } else {
        setFeedback({ type: "err", text: r.error ?? "Não foi possível salvar." });
      }
    });
  }

  function testar() {
    setFeedback(null);
    start(async () => {
      const r = await testarConexao();
      if (r.ok) setFeedback({ type: "ok", text: r.detalhe ?? "Conexão aceita." });
      else setFeedback({ type: "err", text: r.error ?? "Falha no teste." });
    });
  }

  const simples = f.opSimpNac === "3";

  return (
    <div className="space-y-6">
      {feedback && (
        <div
          role="status"
          className={`flex items-start gap-2.5 rounded-lg border px-4 py-3 text-sm ${
            feedback.type === "ok"
              ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
              : "border-red-500/30 bg-red-500/10 text-red-300"
          }`}
        >
          {feedback.type === "ok" ? (
            <Check className="mt-0.5 size-4 shrink-0" />
          ) : (
            <X className="mt-0.5 size-4 shrink-0" />
          )}
          <span className="flex-1">{feedback.text}</span>
          <button type="button" onClick={() => setFeedback(null)} aria-label="Fechar aviso">
            <X className="size-4 opacity-70 hover:opacity-100" />
          </button>
        </div>
      )}

      {/* ── Certificado A1 ───────────────────────────────────────────── */}
      <section className="adm-card overflow-hidden">
        <div className="border-b border-[var(--ad-line)] px-4 py-3.5 sm:px-5">
          <h2 className="adm-display flex items-center gap-2 adm-ink">
            <ShieldCheck className="size-4 adm-brand" />
            Certificado digital A1
          </h2>
          <p className="text-xs adm-muted">
            O arquivo .pfx do e-CNPJ. Fica guardado cifrado no banco — a senha nunca aparece de novo.
          </p>
        </div>

        <div className="space-y-4 p-4 sm:p-5">
          {config.temCertificado && (
            <div
              className={`flex flex-wrap items-center gap-3 rounded-lg border px-4 py-3 ${
                config.certVencido
                  ? "border-red-500/30 bg-red-500/10"
                  : "border-emerald-500/30 bg-emerald-500/10"
              }`}
            >
              {config.certVencido ? (
                <AlertTriangle className="size-5 shrink-0 text-red-400" />
              ) : (
                <ShieldCheck className="size-5 shrink-0 text-emerald-400" />
              )}
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold adm-ink">{config.certSubject}</p>
                <p className={`text-xs ${config.certVencido ? "text-red-300" : "adm-muted"}`}>
                  {config.certVencido ? "VENCIDO em " : "Válido até "}
                  {config.certExpiresAt}
                </p>
              </div>
              {confirmRemover ? (
                <span className="flex items-center gap-2">
                  <button
                    type="button"
                    disabled={pending}
                    onClick={remover}
                    className="rounded-lg bg-red-500/90 px-3 py-1.5 text-xs font-semibold text-white hover:bg-red-500"
                  >
                    Confirmar remoção
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmRemover(false)}
                    className="rounded-lg border border-[var(--ad-line)] px-3 py-1.5 text-xs font-semibold adm-muted"
                  >
                    Cancelar
                  </button>
                </span>
              ) : (
                <button
                  type="button"
                  onClick={() => setConfirmRemover(true)}
                  aria-label="Remover certificado"
                  className="grid size-9 shrink-0 place-items-center rounded-lg border border-[var(--ad-line)] adm-muted hover:border-red-500/50 hover:text-red-400"
                >
                  <Trash2 className="size-4" />
                </button>
              )}
            </div>
          )}

          <form onSubmit={enviarCertificado} className="grid gap-3 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
            <div>
              <label className={labelCls} htmlFor="fx-pfx">
                {config.temCertificado ? "Trocar certificado (.pfx / .p12)" : "Arquivo do certificado (.pfx / .p12)"}
              </label>
              <input
                id="fx-pfx"
                ref={fileRef}
                type="file"
                accept=".pfx,.p12"
                className={`${inputCls} file:mr-3 file:rounded-md file:border-0 file:bg-[var(--ad-brand)] file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-white`}
              />
            </div>
            <div>
              <label className={labelCls} htmlFor="fx-senha">Senha do certificado</label>
              <input
                id="fx-senha"
                type="password"
                className={inputCls}
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                autoComplete="off"
              />
            </div>
            <button
              type="submit"
              disabled={pending}
              className="flex items-center justify-center gap-2 rounded-lg bg-[var(--ad-brand)] px-4 py-2.5 text-sm font-semibold text-white enabled:hover:bg-[#1b5fe0] disabled:opacity-40"
            >
              <Upload className="size-4" />
              {pending ? "Validando…" : "Salvar certificado"}
            </button>
          </form>
          <p className="text-xs adm-muted">
            A senha é validada abrindo o certificado antes de salvar — se estiver errada, nada é gravado.
          </p>
        </div>
      </section>

      {/* ── Dados do emitente ────────────────────────────────────────── */}
      <section className="adm-card overflow-hidden">
        <div className="border-b border-[var(--ad-line)] px-4 py-3.5 sm:px-5">
          <h2 className="adm-display flex items-center gap-2 adm-ink">
            <Building2 className="size-4 adm-brand" />
            Dados do emitente
          </h2>
          <p className="text-xs adm-muted">
            Os códigos vêm do contador — os padrões abaixo são os usuais para oficina (serviço 14.01, Simples).
          </p>
        </div>

        <form onSubmit={salvarDados} className="space-y-4 p-4 sm:p-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className={labelCls} htmlFor="fx-cnpj">CNPJ</label>
              <input id="fx-cnpj" className={inputCls} value={f.cnpj} onChange={(e) => set("cnpj", e.target.value)} placeholder="Só números" />
            </div>
            <div>
              <label className={labelCls} htmlFor="fx-im">Inscrição municipal (opcional)</label>
              <input id="fx-im" className={inputCls} value={f.inscricaoMunicipal} onChange={(e) => set("inscricaoMunicipal", e.target.value)} />
            </div>
            <div>
              <label className={labelCls} htmlFor="fx-regime">Regime tributário</label>
              <select id="fx-regime" className={inputCls} value={f.opSimpNac} onChange={(e) => set("opSimpNac", e.target.value)}>
                <option value="3">Simples Nacional (ME/EPP)</option>
                <option value="2">MEI</option>
                <option value="1">Não optante do Simples</option>
              </select>
            </div>
            {simples && (
              <div>
                <label className={labelCls} htmlFor="fx-regap">Apuração no Simples</label>
                <select id="fx-regap" className={inputCls} value={f.regApTribSN} onChange={(e) => set("regApTribSN", e.target.value)}>
                  <option value="1">ISS pelo Simples (padrão)</option>
                  <option value="2">ISS fora do Simples (retenção)</option>
                  <option value="3">ISS fora do Simples (regime fixo)</option>
                </select>
              </div>
            )}
            <div>
              <label className={labelCls} htmlFor="fx-ctrib">Código de tributação nacional</label>
              <input id="fx-ctrib" className={inputCls} value={f.cTribNac} onChange={(e) => set("cTribNac", e.target.value)} placeholder="140101" />
              <p className="mt-1 text-xs adm-muted">140101 = manutenção/conserto de veículos (item 14.01).</p>
            </div>
            <div>
              <label className={labelCls} htmlFor="fx-aliq">Alíquota ISS % (opcional)</label>
              <input id="fx-aliq" className={inputCls} value={f.aliquotaIss} onChange={(e) => set("aliquotaIss", e.target.value)} placeholder="Vazio = SEFIN usa a de Curitiba" />
            </div>
            <div>
              <label className={labelCls} htmlFor="fx-tottrib">Tributos aprox. % (Lei 12.741)</label>
              <input id="fx-tottrib" className={inputCls} value={f.totTribPerc} onChange={(e) => set("totTribPerc", e.target.value)} placeholder="6.00" />
              <p className="mt-1 text-xs adm-muted">Informativo na nota — confirme o percentual com o contador.</p>
            </div>
            <div>
              <label className={labelCls} htmlFor="fx-serie">Série da DPS</label>
              <input id="fx-serie" className={inputCls} value={f.serie} onChange={(e) => set("serie", e.target.value)} />
            </div>
            <div>
              <label className={labelCls} htmlFor="fx-num">Próximo número (nDPS)</label>
              <input id="fx-num" type="number" min={1} className={inputCls} value={f.proximoNumero} onChange={(e) => set("proximoNumero", e.target.value)} />
            </div>
          </div>

          <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-3">
            <label className="flex items-start gap-3">
              <FlaskConical className="mt-0.5 size-4 shrink-0 text-amber-400" />
              <span className="flex-1 text-sm adm-ink">
                <span className="mb-1 block font-semibold">Ambiente</span>
                <select className={inputCls} value={f.ambiente} onChange={(e) => set("ambiente", e.target.value)} aria-label="Ambiente de emissão">
                  <option value="producao">Produção — a nota vale de verdade</option>
                  <option value="restrita">Produção restrita — testes, a nota NÃO vale</option>
                </select>
                <span className="mt-1 block text-xs adm-muted">
                  Em Produção cada emissão gera nota registrada de verdade. Se quiser experimentar sem
                  valor fiscal, troque para Produção restrita e depois volte.
                </span>
              </span>
            </label>
          </div>

          <button
            type="submit"
            disabled={pending}
            className="flex items-center gap-2 rounded-lg bg-[var(--ad-brand)] px-5 py-2.5 text-sm font-semibold text-white enabled:hover:bg-[#1b5fe0] disabled:opacity-40"
          >
            <Check className="size-4" />
            {pending ? "Salvando…" : "Salvar dados"}
          </button>
        </form>
      </section>

      {/* ── Teste de conexão ─────────────────────────────────────────── */}
      <section className="adm-card p-4 sm:p-5">
        <h2 className="adm-display mb-1 flex items-center gap-2 adm-ink">
          <PlugZap className="size-4 adm-brand" />
          Testar conexão com a SEFIN
        </h2>
        <p className="mb-4 text-sm adm-muted">
          Faz uma chamada real ao governo usando o certificado salvo. Se passar, a emissão vai funcionar.
        </p>
        <button
          type="button"
          onClick={testar}
          disabled={pending || !config.temCertificado}
          className="flex items-center gap-2 rounded-lg border border-[var(--ad-line)] px-4 py-2.5 text-sm font-semibold adm-ink transition-colors enabled:hover:border-[var(--ad-brand)] disabled:opacity-40"
        >
          <PlugZap className="size-4" />
          {pending ? "Testando…" : "Testar agora"}
        </button>
        {!config.temCertificado && (
          <p className="mt-2 text-xs adm-muted">Envie o certificado primeiro.</p>
        )}
      </section>
    </div>
  );
}
