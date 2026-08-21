import Link from "next/link";
import { CoachHeroCard, ProgressCoachDashboard } from "@/components/ProgressCoachDashboard";
import { TopNav } from "@/components/TopNav";
import { WorldCard } from "@/components/WorldCard";
import { trainingWorlds } from "@/lib/training";
import { FOCUS_AREAS } from "@/lib/learningExpansion";

export default function Home() {
  return (
    <main id="top">
      <TopNav />
      <section className="hero" aria-labelledby="hero-title">
        <div className="heroCopy">
          <p className="eyebrow">V6.5 · Learning & Training Expansion 3.0</p>
          <h1 id="hero-title">Lernen, das sich nach dir richtet.</h1>
          <p>Trainiere gezielt oder gemischt: Mathematik, Sprache, Englisch, Aufmerksamkeit, Reaktion, Gedächtnis, Logik und visuelle Fähigkeiten – abwechslungsreich, verständlich und motivierend.</p>
          <div className="heroActions"><Link className="primary" href="/training/focus">Mein Training zusammenstellen</Link><a className="secondary" href="#lernbereiche">Bereiche entdecken</a></div>
        </div>
        <CoachHeroCard />
      </section>

      <section className="learningLibrary" id="lernbereiche" aria-labelledby="learning-title">
        <div className="sectionHead"><div><p className="eyebrow">Individuell lernen</p><h2 id="learning-title">Was möchtest du verbessern?</h2></div><p>Wähle genau die Fähigkeiten, an denen du arbeiten möchtest. KogTrain stellt daraus jedes Mal eine neue Session zusammen.</p></div>
        <div className="learningGrid">{FOCUS_AREAS.map((area)=><article className={`learningCard learning-${area.id}`} key={area.id}><span className="learningIcon" aria-hidden="true">{area.icon}</span><p className="eyebrow">{area.subtitle}</p><h3>{area.title}</h3><p>{area.description}</p></article>)}</div>
        <div className="learningCta"><div><strong>Dein persönlicher Trainingsmix</strong><p>Ein Bereich oder mehrere – 10 Aufgaben, neue Inhalte bei jedem Start und drei Schwierigkeitsstufen.</p></div><Link className="primary" href="/training/focus">Fokus auswählen →</Link></div>
      </section>

      <section className="worlds" id="training" aria-labelledby="worlds-title">
        <div className="sectionHead"><div><p className="eyebrow">Spezial-Labs</p><h2 id="worlds-title">Fünf Bereiche für tieferes Training.</h2></div><p>Memory, Attention, Logic, Language und Visual bleiben als vertiefte Trainingswelten erhalten und fließen gemeinsam in Progress & Coach 2.1 ein.</p></div>
        <div className="worldGrid">{trainingWorlds.map((world, index) => <WorldCard key={world.id} world={world} index={index} />)}</div>
      </section>

      <ProgressCoachDashboard />

      <footer><span>Neburion XV73 · V6.5 Learning Expansion 3.0</span><span>Raptor Delta V9.7 · DRAFT</span></footer>
    </main>
  );
}
