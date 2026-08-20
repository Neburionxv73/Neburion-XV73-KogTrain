import type { TrainingWorld } from "@/lib/training";

export function WorldCard({ world, index }: { world: TrainingWorld; index: number }) {
  return (
    <article className="worldCard" aria-labelledby={`${world.id}-title`}>
      <div className="cardTopline"><span>0{index + 1}</span><span>{world.status === "ready" ? "Bereit" : "Geplant"}</span></div>
      <div className="worldGlyph" aria-hidden="true">{world.accent}</div>
      <p className="eyebrow">{world.shortTitle}</p>
      <h3 id={`${world.id}-title`}>{world.title}</h3>
      <p>{world.description}</p>
      <button type="button" aria-label={`${world.title} öffnen`}>Training öffnen <span aria-hidden="true">↗</span></button>
    </article>
  );
}
