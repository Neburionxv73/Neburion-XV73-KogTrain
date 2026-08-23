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
          <p className="eyebrow">Neburion XV73 · V6.5</p>
          <h1 id="hero-title">Lernen, das sich nach dir richtet.</h1>
          <p>Starte mit einer kurzen Einheit oder wähle gezielt, woran du heute arbeiten möchtest. Mathematik, Sprache, Aufmerksamkeit, Gedächtnis, Logik und Gehirnfit bleiben dabei an einem Ort.</p>
          <div className="heroActions"><Link className="primary" href="/training/journey">Heute trainieren →</Link><a className="secondary" href="#lernbereiche">Bereiche ansehen</a></div>
        </div>
        <CoachHeroCard />
      </section>

      <section className="journeyTeaser" aria-labelledby="journey-teaser-title">
        <div><p className="eyebrow">Dein Trainingsstart</p><h2 id="journey-teaser-title">Ein Einstieg. Danach geht es direkt los.</h2><p>Wähle 5, 10 oder 15 Minuten und entscheide zwischen persönlichem Lernmix, Spezial-Labs oder Gehirnfit & Alltag.</p></div>
        <div className="journeyTeaserMeta"><span><strong>5 / 10 / 15</strong><small>Minuten</small></span><span><strong>3</strong><small>Trainingswege</small></span><Link className="primary" href="/training/journey">Training zusammenstellen →</Link></div>
      </section>

      <section className="learningLibrary" id="lernbereiche" aria-labelledby="learning-title">
        <div className="sectionHead"><div><p className="eyebrow">Individuell lernen</p><h2 id="learning-title">Was möchtest du verbessern?</h2></div><p>Wähle die Fähigkeiten, die heute wichtig sind. KogTrain stellt daraus eine passende Einheit zusammen.</p></div>
        <div className="learningGrid">{FOCUS_AREAS.map((area)=><article className={`learningCard learning-${area.id}`} key={area.id}><span className="learningIcon" aria-hidden="true">{area.icon}</span><p className="eyebrow">{area.subtitle}</p><h3>{area.title}</h3><p>{area.description}</p></article>)}</div>
        <div className="learningCta"><div><strong>Dein persönlicher Trainingsmix</strong><p>Ein Bereich oder mehrere. Inhalt und Schwierigkeit passen sich der gewählten Session an.</p></div><Link className="primary" href="/training/focus">Fokus auswählen →</Link></div>
      </section>

      <section className="worlds" id="training" aria-labelledby="worlds-title">
        <div className="sectionHead"><div><p className="eyebrow">Spezial-Labs</p><h2 id="worlds-title">Fünf Bereiche für tieferes Training.</h2></div><p>Memory, Attention, Logic, Language und Visual sind für Einheiten gedacht, bei denen du einen Schwerpunkt bewusst vertiefen möchtest.</p></div>
        <div className="worldGrid">{trainingWorlds.map((world, index) => <WorldCard key={world.id} world={world} index={index} />)}</div>
      </section>

      <section className="learningLibrary" id="gehirnfit" aria-labelledby="brainfit-title">
        <div className="sectionHead"><div><p className="eyebrow">Gehirnfit & Alltag</p><h2 id="brainfit-title">Ruhig trainieren. Alltag stärken.</h2></div><p>Zwölf Übungswelten, ein Tagesmix und viele wechselnde Aufgaben. Ohne unnötigen Zeitdruck und mit klarer Rückmeldung.</p></div>
        <div className="learningCta"><div><strong>12 Bereiche · Tagesmix · anpassbar</strong><p>Tier-Sudoku, Wortsuche, Memory, Kategorien, Alltagsrechnen, Sprichwörter und weitere Übungen für Alltag und Konzentration.</p></div><Link className="primary" href="/training/brain-fit">Gehirnfit öffnen →</Link></div>
      </section>

      <ProgressCoachDashboard />

      <footer><span>Neburion XV73 · V6.5</span><span>Raptor Delta V9.7 · Clean Palette</span></footer>
    </main>
  );
}
