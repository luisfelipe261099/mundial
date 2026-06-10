import { Reveal } from "./motion";

export function SectionHeading({
  index,
  eyebrow,
  title,
  description,
  center = false,
}: {
  index: string;
  eyebrow: string;
  title: string;
  description?: string;
  center?: boolean;
}) {
  return (
    <Reveal className={center ? "mx-auto max-w-2xl text-center" : "max-w-2xl"}>
      <div
        className={`tech-label flex items-center gap-2 text-accent ${
          center ? "justify-center" : ""
        }`}
      >
        <span>{index}</span>
        <span className="h-px w-6 bg-accent/40" />
        <span className="text-muted">{eyebrow}</span>
      </div>
      <h2 className="mt-3 font-display text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">
        {title}
      </h2>
      {description && (
        <p className="mt-4 text-lg leading-relaxed text-body">{description}</p>
      )}
    </Reveal>
  );
}
