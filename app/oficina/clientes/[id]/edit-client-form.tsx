"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Check, Pencil } from "lucide-react";
import { editarCliente } from "../../actions";

const inputCls =
  "w-full rounded-lg border border-[var(--ad-line)] bg-[var(--ad-surface-2)] px-3 py-2.5 text-sm adm-ink outline-none transition-colors focus:border-[var(--ad-brand)]";
const labelCls = "mb-1 block text-xs font-medium adm-muted";

export interface FichaCliente {
  nome: string;
  cpf: string;
  telefone: string;
  whatsapp: string;
  email: string;
  cidade: string;
  endereco: string;
}

/* Card de contato do cliente com edição inline: o lápis abre o formulário
   no lugar da listagem, salvar grava e volta pra exibição. */
export function EditClienteCard({
  clienteId,
  ficha,
  abrirEdicao = false,
  children,
}: {
  clienteId: string;
  ficha: FichaCliente;
  abrirEdicao?: boolean; // vindo do atalho ?editar=1 da lista
  children: React.ReactNode; // a exibição atual do contato
}) {
  const router = useRouter();
  const [editando, setEditando] = useState(abrirEdicao);
  const [form, setForm] = useState(ficha);
  const [erro, setErro] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function salvar() {
    setErro(null);
    startTransition(async () => {
      const r = await editarCliente(clienteId, { ...form });
      if (r.error) setErro(r.error);
      else {
        setEditando(false);
        router.refresh();
      }
    });
  }

  const campos: { key: keyof FichaCliente; label: string; type?: string }[] = [
    { key: "nome", label: "Nome" },
    { key: "cpf", label: "CPF" },
    { key: "telefone", label: "Telefone", type: "tel" },
    { key: "whatsapp", label: "WhatsApp", type: "tel" },
    { key: "email", label: "E-mail", type: "email" },
    { key: "cidade", label: "Cidade" },
    { key: "endereco", label: "Endereço" },
  ];

  return (
    <div className="adm-card p-5">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="adm-display font-bold adm-ink">Contato</h3>
        {!editando && (
          <button
            type="button"
            onClick={() => {
              setForm(ficha);
              setErro(null);
              setEditando(true);
            }}
            className="flex items-center gap-1.5 rounded-lg border border-[var(--ad-line)] px-3 py-1.5 text-xs font-semibold adm-ink hover:bg-[var(--ad-surface-2)]"
          >
            <Pencil className="size-3.5" />
            Editar
          </button>
        )}
      </div>

      {!editando ? (
        children
      ) : (
        <div>
          <div className="grid gap-4 sm:grid-cols-2">
            {campos.map((c) => (
              <div key={c.key} className={c.key === "endereco" ? "sm:col-span-2" : ""}>
                <label className={labelCls} htmlFor={`cli-${c.key}`}>
                  {c.label}
                </label>
                <input
                  id={`cli-${c.key}`}
                  type={c.type ?? "text"}
                  value={form[c.key]}
                  onChange={(e) => setForm((f) => ({ ...f, [c.key]: e.target.value }))}
                  className={inputCls}
                />
              </div>
            ))}
          </div>

          {erro && (
            <p className="mt-3 rounded-lg bg-rose-500/10 px-3 py-2 text-sm text-rose-300">{erro}</p>
          )}

          <div className="mt-4 flex gap-3">
            <button
              type="button"
              onClick={salvar}
              disabled={pending || !form.nome.trim()}
              className="flex items-center gap-2 rounded-lg bg-[var(--ad-brand)] px-5 py-2.5 text-sm font-semibold text-white enabled:hover:bg-[#1b5fe0] disabled:opacity-40"
            >
              <Check className="size-4" />
              {pending ? "Salvando…" : "Salvar alterações"}
            </button>
            <button
              type="button"
              onClick={() => setEditando(false)}
              className="rounded-lg border border-[var(--ad-line)] px-4 py-2.5 text-sm font-semibold adm-muted"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
