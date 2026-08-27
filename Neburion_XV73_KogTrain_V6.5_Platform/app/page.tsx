import Link from "next/link";
import { CoachHeroCard } from "@/components/CoachHeroCard";
import { DeferredProgressCoachDashboard } from "@/components/DeferredProgressCoachDashboard";
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
          <p className="eyebrow">Neburion XV73 · KogTrain V6.6 · Raptor Delta V10.3 Hard Mode</p>
          <h1 id="hero-title">Lernen mit Struktur. Trainieren mit Fokus.</h1>
          <p>KogTrain bündelt Mathematik, Sprache, Aufmerksamkeit, Gedächtnis, Logik, visuelles Denken und Gehirnfit in einer klar geführten Plattform. Weniger Oberfläche, mehr Orientierung, bessere Trainingslogik.</p>
          <div className="heroActions">
            <Link className="primary" href="/training/journey">Training starten →</Link>
            <a className="secondary" href="#lernbereiche">Bereiche ansehen</a>
          </div>
        </div>
        <CoachHeroCard />
      </section>

      <section className="v103-statusBand" aria-label="Plattformüberblick">
        <div className="v103-statusInner">
          <div><small>V10.3 Hard Mode</small><strong>Ein Designsystem. Klare Hierarchie.</strong></div>
          <div><small>Trainingswege</small><b>03</b></div>
          <div><small>Spezial-Labs</small><b>05</b></div>
          <div><small>Gehirnfit-Welten</small><b>12</b></div>
        </div>
      </section>

      <section className="journeyTeaser" aria-labelledby="journey-teaser-title">
        <div>
          <p className="eyebrow">01 · Trainingsstart</p>
          <h2 id="journey-teaser-title">Eine klare Entscheidung vor jeder Einheit.</h2>
          <p>Wähle 5, 10 oder 15 Minuten und entscheide, ob du einen persönlichen Lernmix, ein Spezial-Lab oder Gehirnfit & Alltag trainieren möchtest. Danach führt dich die Plattform ohne Umwege durch die Session.</p>
        </div>
        <div className="journeyTeaserMeta">
          <span><strong>5 / 10 / 15</strong><small>Minuten</small></span>
          <span><strong>3</strong><small>Trainingswege</small></span>
          <Link className="primary" href="/training/journey">Einheit zusammenstellen →</Link>
        </div>
      </section>

      <section className="learningLibrary" id="lernbereiche" aria-labelledby="learning-title">
        <div className="sectionHead">
          <div>
            <p className="eyebrow">02 · Persönlicher Lernmix</p>
            <h2 id="learning-title">Wähle Fähigkeiten statt Menüs.</h2>
          </div>
          <p>Sechs Lernfelder bilden die Grundlage für individuelle Sessions. Der Fokus bleibt verständlich: Du wählst, was du verbessern möchtest; KogTrain stellt daraus die Einheit zusammen.</p>
        </div>
        <div className="learningGrid">
          {FOCUS_AREAS.map((area)=><article className={`learningCard learning-${area.id}`} key={area.id}><span className="learningIcon" aria-hidden="true">{area.icon}</span><p className="eyebrow">{area.subtitle}</p><h3>{area.title}</h3><p>{area.description}</p></article>)}
        </div>
        <div className="learningCta"><div><strong>Persönlichen Trainingsmix aufbauen</strong><p>Ein Bereich oder mehrere. Inhalt und Schwierigkeit passen sich an deine gewählte Session an.</p></div><Link className="primary" href="/training/focus">Fokus auswählen →</Link></div>
      </section>

      <section className="worlds" id="training" aria-labelledby="worlds-title">
        <div className="sectionHead">
          <div><p className="eyebrow">03 · Spezial-Labs</p><h2 id="worlds-title">Fünf Bereiche für gezieltes Training.</h2></div>
          <p>Memory, Attention, Logic, Language und Visual besitzen jeweils einen klaren Trainingszweck, eigene Aufgabenlogik und eigene Rückmeldung. Die Bereiche bleiben visuell verwandt, aber funktional eindeutig getrennt.</p>
        </div>
        <div className="worldGrid">{trainingWorlds.map((world, index) => <WorldCard key={world.id} world={world} index={index} />)}</div>
      </section>

      <section className="learningLibrary" id="gehirnfit" aria-labelledby="brainfit-title">
        <div className="sectionHead">
          <div><p className="eyebrow">04 · Gehirnfit & Alltag</p><h2 id="brainfit-title">Ruhiger trainieren. Alltag mitdenken.</h2></div>
          <p>Zwölf Übungswelten, Tagesmix und wechselnde Aufgaben verbinden Sprache, Gedächtnis, Orientierung und Alltagslogik. Ohne unnötigen Zeitdruck und ohne medizinische Bewertung.</p>
        </div>
        <div className="learningCta"><div><strong>12 Bereiche · Tagesmix · flexibel</strong><p>Tier-Sudoku, Wortsuche, Memory, Kategorien, Alltagsrechnen, Sprichwörter und weitere Übungen für Alltag und Konzentration.</p></div><Link className="primary" href="/training/brain-fit">Gehirnfit öffnen →</Link></div>
      </section>

      <DeferredProgressCoachDashboard />

      <footer><span>Neburion XV73 · KogTrain V6.6</span><span>Raptor Delta V10.3 · Specialist Foundation</span></footer>
    </main>
  );
}
