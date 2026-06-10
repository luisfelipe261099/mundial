import { Star } from "lucide-react";

/** Renderiza 5 estrelas com preenchimento fracionário (ex.: 4,7). */
export function Stars({
  value,
  size = 18,
  className = "",
}: {
  value: number;
  size?: number;
  className?: string;
}) {
  return (
    <span
      className={`inline-flex items-center gap-0.5 ${className}`}
      role="img"
      aria-label={`${value.toString().replace(".", ",")} de 5 estrelas`}
    >
      {Array.from({ length: 5 }).map((_, i) => {
        const fill = Math.max(0, Math.min(1, value - i));
        return (
          <span
            key={i}
            className="relative inline-block shrink-0"
            style={{ width: size, height: size }}
          >
            <Star
              size={size}
              strokeWidth={0}
              className="absolute inset-0 text-slate-300"
              fill="currentColor"
            />
            <span
              className="absolute inset-0 overflow-hidden"
              style={{ width: `${fill * 100}%` }}
            >
              <Star
                size={size}
                strokeWidth={0}
                className="text-star"
                fill="currentColor"
              />
            </span>
          </span>
        );
      })}
    </span>
  );
}
