import Link from "next/link";
import type { TrainingWorld } from "@/lib/training";

export function WorldCard({ world, index }: { world: TrainingWorld; index: number }) {
  const activeRoutes: Record<string, string> = {
    memory: "/training/memory",
    attention: "/training/attention",
    logic: "/training/logic",
    language: "/training/language",
  };
  const route = activeRoutes[world.id];
  return (
    <article className="worldCard" aria-labelledby={`${world.id}-title`}>
      <div className="cardTopline"><span>0{index + 1}</span><span>{route ? "Aktiv" : "Bereit"}</span></div>
      <div className="worldGlyph" aria-hidden="true">{world.accent}</div>
      <p className="eyebrow">{world.shortTitle}</p>
      <h3 id={`${world.id}-title`}>{world.title}</h3>
      <p>{world.description}</p>
      {route ? (
        <Link className="cardAction" href={route} aria-label={`${world.title} öffnen`}>Training öffnen <span aria-hidden="true">↗</span></Link>
      ) : (
        <span className="cardAction mutedAction" aria-label={`${world.title} folgt in einer kommenden Ausbaustufe`}>Training folgt <span aria-hidden="true">·</span></span>
      )}
    </article>
  );
}
