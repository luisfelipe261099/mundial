"use client";

import { useState, useTransition } from "react";
import { Camera, Check } from "lucide-react";
import { salvarFotos } from "../os-actions";
import { FotoUpload } from "./foto-upload";

// Fotos do serviço (durante e depois do reparo). O mecânico já enviava pelo
// app dele; aqui o balcão também envia e apaga.
export function FotosServicoCard({ osId, fotos: iniciais }: { osId: string; fotos: string[] }) {
  const [fotos, setFotos] = useState<string[]>(iniciais);
  const [salvo, setSalvo] = useState(false);
  const [pending, startTransition] = useTransition();

  function trocar(novas: string[]) {
    setFotos(novas);
    setSalvo(false);
    startTransition(async () => {
      await salvarFotos(osId, novas);
      setSalvo(true);
    });
  }

  return (
    <div className="adm-card p-5">
      <div className="mb-1 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Camera className="size-4 adm-brand" />
          <h3 className="text-sm font-semibold adm-ink">Fotos do serviço</h3>
        </div>
        {salvo && !pending && (
          <span className="flex items-center gap-1.5 text-xs font-semibold text-emerald-400">
            <Check className="size-3.5" />
            Salvo
          </span>
        )}
      </div>
      <p className="mb-3 text-xs adm-muted">
        A peça velha, o defeito encontrado, o serviço pronto. O mecânico também envia pelo
        app dele.
      </p>
      <FotoUpload
        fotos={fotos}
        onChange={trocar}
        prefixo={`os/${osId}/servico`}
        max={20}
        vazio="Nenhuma foto do serviço ainda."
      />
    </div>
  );
}
