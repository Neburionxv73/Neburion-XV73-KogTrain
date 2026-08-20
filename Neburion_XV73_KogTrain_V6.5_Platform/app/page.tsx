import { ProgressPanel } from "@/components/ProgressPanel";
import { TopNav } from "@/components/TopNav";
import { WorldCard } from "@/components/WorldCard";
import { trainingWorlds } from "@/lib/training";

export default function Home() {
  return (
    <main id="top">
      <TopNav />
      <section className="hero" aria-labelledby="hero-title">
        <div className="heroCopy">
          <p className="eyebrow">V6.5 · Neustart der Plattform</p>
          <h1 id="hero-title">Trainiere gezielt.<br />Verstehe deinen Fortschritt.</h1>
          <p>Fünf Trainingswelten, ein gemeinsames Session-System und nachvollziehbare Empfehlungen – modular, barrierearm und ohne Black-Box-Bewertung.</p>
          <div className="heroActions"><a className="primary" href="#training">Training starten</a><a className="secondary" href="#fortschritt">Fortschritt ansehen</a></div>
        </div>
        <aside className="heroPanel" aria-label="Heutige Trainingsempfehlung">
          <p className="eyebrow">Heute empfohlen</p>
          <strong>Memory Lab</strong>
          <p>12 Minuten · Fokus: Arbeitsgedächtnis</p>
          <div className="signal"><span /><span /><span /><span /></div>
          <small>Empfehlung basiert auf Trainingsrhythmus und zuletzt gewählten Übungen.</small>
        </aside>
      </section>

      <section className="worlds" id="training" aria-labelledby="worlds-title">
        <div className="sectionHead"><div><p className="eyebrow">Trainingswelten</p><h2 id="worlds-title">Fünf Bereiche. Eine Plattformlogik.</h2></div><p>Jede Trainingswelt hat eine eigene Identität, nutzt aber denselben Session-, Fortschritts- und Qualitätskern.</p></div>
        <div className="worldGrid">{trainingWorlds.map((world, index) => <WorldCard key={world.id} world={world} index={index} />)}</div>
      </section>

      <ProgressPanel />

      <section className="coach" id="coach" aria-labelledby="coach-title">
        <div><p className="eyebrow">Coach Layer</p><h2 id="coach-title">Hinweise statt Urteile.</h2></div>
        <p>Der Coach erklärt, warum eine Übung vorgeschlagen wird, und bleibt bewusst stärkenorientiert. Keine Diagnose, keine medizinische Interpretation.</p>
      </section>

      <footer><span>Neburion XV73 · V6.5 Core</span><span>Raptor Delta V9.7 · DRAFT</span></footer>
    </main>
  );
}
