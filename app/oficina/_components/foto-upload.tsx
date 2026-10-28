"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { upload } from "@vercel/blob/client";
import { Camera, ImagePlus, Loader2, Trash2 } from "lucide-react";
import { prepararFoto } from "@/lib/imagem";

// Grade de fotos com envio pelo celular (câmera) ou pelo computador (arquivo).
// Sobe cada foto pro Vercel Blob e devolve as URLs — quem chama decide onde
// salvar (vistoria de entrada ou fotos do serviço).

export function FotoUpload({
  fotos,
  onChange,
  prefixo,
  max = 12,
  vazio = "Nenhuma foto ainda.",
  disabled = false,
}: {
  fotos: string[];
  onChange: (fotos: string[]) => void;
  prefixo: string;
  max?: number;
  vazio?: string;
  disabled?: boolean;
}) {
  const [enviando, setEnviando] = useState(0);
  const [erro, setErro] = useState<string | null>(null);
  const camRef = useRef<HTMLInputElement>(null);
  const arqRef = useRef<HTMLInputElement>(null);

  const cheio = fotos.length >= max;

  async function enviar(files: FileList | null) {
    if (!files || files.length === 0) return;
    setErro(null);
    const livres = max - fotos.length;
    const lista = Array.from(files).slice(0, Math.max(0, livres));
    if (lista.length < files.length) {
      setErro(`O limite é ${max} fotos — as demais foram ignoradas.`);
    }
    setEnviando(lista.length);
    const novas: string[] = [];
    try {
      for (const file of lista) {
        const pronta = await prepararFoto(file);
        const blob = await upload(`${prefixo}/${Date.now()}-${pronta.nome}`, pronta.blob, {
          access: "public",
          handleUploadUrl: "/api/upload",
          contentType: pronta.blob.type || "image/jpeg",
        });
        novas.push(blob.url);
        setEnviando((n) => n - 1);
      }
    } catch {
      setErro(
        "Não foi possível enviar a foto. O armazenamento de fotos ainda não está ligado (Vercel Blob)."
      );
    } finally {
      setEnviando(0);
      if (camRef.current) camRef.current.value = "";
      if (arqRef.current) arqRef.current.value = "";
    }
    if (novas.length) onChange([...fotos, ...novas]);
  }

  const botao =
    "flex items-center gap-1.5 rounded-lg border border-[var(--ad-line)] px-3 py-1.5 text-xs font-semibold adm-ink transition-colors enabled:hover:bg-[var(--ad-surface-2)] disabled:opacity-40";

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => camRef.current?.click()}
          disabled={disabled || cheio || enviando > 0}
          className={botao}
        >
          <Camera className="size-4 adm-brand" />
          Tirar foto
        </button>
        <button
          type="button"
          onClick={() => arqRef.current?.click()}
          disabled={disabled || cheio || enviando > 0}
          className={botao}
        >
          <ImagePlus className="size-4 adm-brand" />
          Da galeria
        </button>
        {enviando > 0 && (
          <span className="flex items-center gap-1.5 text-xs adm-muted">
            <Loader2 className="size-3.5 animate-spin" />
            Enviando {enviando} foto(s)…
          </span>
        )}
        {enviando === 0 && fotos.length > 0 && (
          <span className="text-xs adm-muted">
            {fotos.length} de {max}
          </span>
        )}
      </div>

      {/* capture abre a câmera no celular; o outro input aceita o rolo/arquivos */}
      <input
        ref={camRef}
        type="file"
        accept="image/*"
        capture="environment"
        multiple
        hidden
        onChange={(e) => enviar(e.target.files)}
      />
      <input
        ref={arqRef}
        type="file"
        accept="image/*"
        multiple
        hidden
        onChange={(e) => enviar(e.target.files)}
      />

      {erro && (
        <p className="mt-2 rounded-lg bg-rose-500/10 px-3 py-2 text-xs text-rose-400">{erro}</p>
      )}

      {fotos.length === 0 ? (
        enviando === 0 && <p className="mt-3 text-xs adm-muted">{vazio}</p>
      ) : (
        <div className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-5 lg:grid-cols-6">
          {fotos.map((src) => (
            <div
              key={src}
              className="group relative aspect-square overflow-hidden rounded-lg border border-[var(--ad-line)]"
            >
              <a href={src} target="_blank" rel="noreferrer">
                <Image
                  src={src}
                  alt="Foto do veículo"
                  fill
                  sizes="160px"
                  className="object-cover"
                  unoptimized
                />
              </a>
              {!disabled && (
                <button
                  type="button"
                  onClick={() => onChange(fotos.filter((f) => f !== src))}
                  aria-label="Remover foto"
                  className="absolute right-1 top-1 grid size-6 place-items-center rounded-md bg-black/60 text-white opacity-0 transition-opacity group-hover:opacity-100 focus:opacity-100"
                >
                  <Trash2 className="size-3.5" />
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
