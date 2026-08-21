import { CoachHeroCard, ProgressCoachDashboard } from "@/components/ProgressCoachDashboard";
import { TopNav } from "@/components/TopNav";
import { WorldCard } from "@/components/WorldCard";
import { trainingWorlds } from "@/lib/training";

export default function Home() {
  return (
    <main id="top">
      <TopNav />
      <section className="hero" aria-labelledby="hero-title">
        <div className="heroCopy">
          <p className="eyebrow">V6.5 · Fünf Labs auf 2.0-Niveau</p>
          <h1 id="hero-title">Trainiere gezielt.<br />Verstehe deinen Fortschritt.</h1>
          <p>Fünf dynamische Trainingswelten, ein gemeinsames Fortschrittssystem und nachvollziehbare Coach-Empfehlungen – lokal, modular und ohne Black-Box-Bewertung.</p>
          <div className="heroActions"><a className="primary" href="#training">Training starten</a><a className="secondary" href="#fortschritt">Fortschritt ansehen</a></div>
        </div>
        <CoachHeroCard />
      </section>

      <section className="worlds" id="training" aria-labelledby="worlds-title">
        <div className="sectionHead"><div><p className="eyebrow">Trainingswelten</p><h2 id="worlds-title">Fünf Bereiche. Eine Plattformlogik.</h2></div><p>Memory, Attention, Logic, Language und Visual nutzen denselben dynamischen Trainingskern und fließen gemeinsam in Progress & Coach 2.0 ein.</p></div>
        <div className="worldGrid">{trainingWorlds.map((world, index) => <WorldCard key={world.id} world={world} index={index} />)}</div>
      </section>

      <ProgressCoachDashboard />

      <footer><span>Neburion XV73 · V6.5 Progress & Coach 2.0</span><span>Raptor Delta V9.7 · DRAFT</span></footer>
    </main>
  );
}
