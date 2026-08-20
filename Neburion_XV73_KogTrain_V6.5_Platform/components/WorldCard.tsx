import Link from "next/link";
import type { TrainingWorld } from "@/lib/training";

export function WorldCard({ world, index }: { world: TrainingWorld; index: number }) {
  const isMemory = world.id === "memory";
  return (
    <article className="worldCard" aria-labelledby={`${world.id}-title`}>
      <div className="cardTopline"><span>0{index + 1}</span><span>{isMemory ? "Aktiv" : "Bereit"}</span></div>
      <div className="worldGlyph" aria-hidden="true">{world.accent}</div>
      <p className="eyebrow">{world.shortTitle}</p>
      <h3 id={`${world.id}-title`}>{world.title}</h3>
      <p>{world.description}</p>
      {isMemory ? (
        <Link className="cardAction" href="/training/memory" aria-label={`${world.title} öffnen`}>Training öffnen <span aria-hidden="true">↗</span></Link>
      ) : (
        <span className="cardAction mutedAction" aria-label={`${world.title} folgt in einer kommenden Ausbaustufe`}>Training folgt <span aria-hidden="true">·</span></span>
      )}
    </article>
  );
}
