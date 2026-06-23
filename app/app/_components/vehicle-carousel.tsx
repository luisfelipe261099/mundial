"use client";

import { useRef, useState } from "react";
import { VehicleCard } from "./vehicle-card";
import type { Veiculo } from "../_data/mock";

// Carrossel com scroll-snap + indicador de dots que segue a posição do scroll.
export function VehicleCarousel({ veiculos }: { veiculos: Veiculo[] }) {
  const [active, setActive] = useState(0);
  const ref = useRef<HTMLDivElement>(null);

  function onScroll() {
    const el = ref.current;
    if (!el) return;
    const i = Math.round(el.scrollLeft / el.clientWidth);
    setActive((prev) => (i !== prev ? i : prev));
  }

  return (
    <div>
      <div
        ref={ref}
        onScroll={onScroll}
        className="no-scrollbar -mx-5 flex snap-x snap-mandatory gap-3 overflow-x-auto scroll-smooth px-5"
      >
        {veiculos.map((v) => (
          <div key={v.id} className="w-full shrink-0 snap-center">
            <VehicleCard veiculo={v} />
          </div>
        ))}
      </div>

      {veiculos.length > 1 && (
        <div className="mt-3 flex justify-center gap-1.5">
          {veiculos.map((v, i) => (
            <span
              key={v.id}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                i === active ? "w-5 bg-[var(--app-brand-2)]" : "w-1.5 bg-[var(--app-line)]"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
