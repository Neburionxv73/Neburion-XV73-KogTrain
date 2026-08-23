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
          <p className="eyebrow">V6.5 · Learning Expansion 3.8</p>
          <h1 id="hero-title">Lernen, das sich nach dir richtet.</h1>
          <p>Starte heute zentral mit einer 5-, 10- oder 15-Minuten-Einheit oder trainiere gezielt Mathematik, Sprache, Englisch, Aufmerksamkeit, Reaktion, Gedächtnis, Logik, visuelle Fähigkeiten und Gehirnfit & Alltag.</p>
          <div className="heroActions"><Link className="primary" href="/training/journey">Heute trainieren →</Link><a className="secondary" href="#lernbereiche">Bereiche entdecken</a></div>
        </div>
        <CoachHeroCard />
      </section>

      <section className="journeyTeaser" aria-labelledby="journey-teaser-title">
        <div><p className="eyebrow">Neu · Unified Training Journey 3.8</p><h2 id="journey-teaser-title">Ein Startpunkt für dein gesamtes Training.</h2><p>Wähle 5, 10 oder 15 Minuten und entscheide zwischen persönlichem Lernmix, Spezial-Labs, Gehirnfit oder der aktuellen Coach-Empfehlung.</p></div>
        <div className="journeyTeaserMeta"><span><strong>5 / 10 / 15</strong><small>Minuten</small></span><span><strong>4</strong><small>Trainingswege</small></span><Link className="primary" href="/training/journey">Session zusammenstellen →</Link></div>
      </section>

      <section className="learningLibrary" id="lernbereiche" aria-labelledby="learning-title">
        <div className="sectionHead"><div><p className="eyebrow">Individuell lernen</p><h2 id="learning-title">Was möchtest du verbessern?</h2></div><p>Wähle genau die Fähigkeiten, an denen du arbeiten möchtest. KogTrain stellt daraus jedes Mal eine neue Session zusammen.</p></div>
        <div className="learningGrid">{FOCUS_AREAS.map((area)=><article className={`learningCard learning-${area.id}`} key={area.id}><span className="learningIcon" aria-hidden="true">{area.icon}</span><p className="eyebrow">{area.subtitle}</p><h3>{area.title}</h3><p>{area.description}</p></article>)}</div>
        <div className="learningCta"><div><strong>Dein persönlicher Trainingsmix</strong><p>Ein Bereich oder mehrere – neue Inhalte bei jedem Start und drei Schwierigkeitsstufen.</p></div><Link className="primary" href="/training/focus">Fokus auswählen →</Link></div>
      </section>

      <section className="worlds" id="training" aria-labelledby="worlds-title">
        <div className="sectionHead"><div><p className="eyebrow">Spezial-Labs</p><h2 id="worlds-title">Fünf Bereiche für tieferes Training.</h2></div><p>Memory, Attention, Logic, Language und Visual bleiben als vertiefte Trainingswelten erhalten und fließen gemeinsam mit Gehirnfit & Alltag in Progress & Coach ein.</p></div>
        <div className="worldGrid">{trainingWorlds.map((world, index) => <WorldCard key={world.id} world={world} index={index} />)}</div>
      </section>

      <section className="learningLibrary" id="gehirnfit" aria-labelledby="brainfit-title">
        <div className="sectionHead"><div><p className="eyebrow">Gehirnfit & Alltag</p><h2 id="brainfit-title">Ruhig trainieren. Alltag stärken.</h2></div><p>Zwölf Übungswelten, Tagesmix, variierende Inhalte, lokaler Fortschritt, Meilensteine und erklärbare adaptive Schwierigkeit.</p></div>
        <div className="learningCta"><div><strong>12 Bereiche · Tagesmix · adaptiv · Coach integriert</strong><p>Tier-Sudoku, Wortsuche, Begriffe, Memory, Kategorien, Reihen, Alltagsrechnen, Zeit & Reihenfolge sowie fehlende Wörter, Sprichwörter, Bild & Begriff und Alltagswissen.</p></div><Link className="primary" href="/training/brain-fit">Gehirnfit öffnen →</Link></div>
      </section>

      <ProgressCoachDashboard />

      <footer><span>Neburion XV73 · V6.5 Learning Expansion 3.8</span><span>Raptor Delta V9.7 · DRAFT</span></footer>
    </main>
  );
}
