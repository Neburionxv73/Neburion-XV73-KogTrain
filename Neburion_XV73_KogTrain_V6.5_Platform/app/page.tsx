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
          <p className="eyebrow">Neburion XV73 · KogTrain V6.6 · Raptor Delta V10.3</p>
          <h1 id="hero-title">Trainiere klarer. Lerne bewusster.</h1>
          <p>Eine Lern- und Trainingsplattform für Mathematik, Sprache, Aufmerksamkeit, Gedächtnis, Logik, visuelles Denken und Gehirnfit – mit klarer Führung statt überladenem Dashboard.</p>
          <div className="heroActions">
            <Link className="primary" href="/training/journey">Training starten →</Link>
            <a className="secondary" href="#lernbereiche">Bereiche entdecken</a>
          </div>
        </div>
        <CoachHeroCard />
      </section>

      <section className="v103-statusBand" aria-label="Plattformüberblick">
        <div className="v103-statusInner">
          <div><small>V10.3 Redesign</small><strong>Editorial statt Dashboard</strong></div>
          <div><small>Trainingswege</small><b>03</b></div>
          <div><small>Spezial-Labs</small><b>05</b></div>
          <div><small>Gehirnfit-Welten</small><b>12</b></div>
        </div>
      </section>

      <section className="journeyTeaser" aria-labelledby="journey-teaser-title">
        <div>
          <p className="eyebrow">01 · Einstieg</p>
          <h2 id="journey-teaser-title">Eine Entscheidung. Dann beginnt die Einheit.</h2>
          <p>Wähle 5, 10 oder 15 Minuten und entscheide zwischen persönlichem Lernmix, Spezial-Labs oder Gehirnfit & Alltag. Der Ablauf bleibt bewusst einfach und nachvollziehbar.</p>
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
            <p className="eyebrow">02 · Lernbereiche</p>
            <h2 id="learning-title">Woran möchtest du heute arbeiten?</h2>
          </div>
          <p>Sechs Lernfelder bilden die Grundlage für deinen persönlichen Trainingsmix. Du wählst den Fokus, KogTrain baut daraus die Einheit.</p>
        </div>
        <div className="learningGrid">
          {FOCUS_AREAS.map((area)=><article className={`learningCard learning-${area.id}`} key={area.id}><span className="learningIcon" aria-hidden="true">{area.icon}</span><p className="eyebrow">{area.subtitle}</p><h3>{area.title}</h3><p>{area.description}</p></article>)}
        </div>
        <div className="learningCta"><div><strong>Dein persönlicher Trainingsmix</strong><p>Ein Bereich oder mehrere. Inhalt und Schwierigkeit passen sich an deine gewählte Session an.</p></div><Link className="primary" href="/training/focus">Fokus auswählen →</Link></div>
      </section>

      <section className="worlds" id="training" aria-labelledby="worlds-title">
        <div className="sectionHead">
          <div><p className="eyebrow">03 · Spezial-Labs</p><h2 id="worlds-title">Fünf eigenständige Trainingswelten.</h2></div>
          <p>Memory, Attention, Logic, Language und Visual sind keine kleinen Dashboard-Karten mehr, sondern klar getrennte Trainingsbühnen mit eigener Aufgabe und eigenem Rhythmus.</p>
        </div>
        <div className="worldGrid">{trainingWorlds.map((world, index) => <WorldCard key={world.id} world={world} index={index} />)}</div>
      </section>

      <section className="learningLibrary" id="gehirnfit" aria-labelledby="brainfit-title">
        <div className="sectionHead">
          <div><p className="eyebrow">04 · Gehirnfit & Alltag</p><h2 id="brainfit-title">Ruhiger trainieren. Alltäglicher denken.</h2></div>
          <p>Zwölf Übungswelten, Tagesmix und wechselnde Aufgaben. Ohne unnötigen Zeitdruck, mit klarer Rückmeldung und verständlichem Abschluss.</p>
        </div>
        <div className="learningCta"><div><strong>12 Bereiche · Tagesmix · anpassbar</strong><p>Tier-Sudoku, Wortsuche, Memory, Kategorien, Alltagsrechnen, Sprichwörter und weitere Übungen für Alltag und Konzentration.</p></div><Link className="primary" href="/training/brain-fit">Gehirnfit öffnen →</Link></div>
      </section>

      <DeferredProgressCoachDashboard />

      <footer><span>Neburion XV73 · KogTrain V6.6</span><span>Raptor Delta V10.3 · Editorial Redesign</span></footer>
    </main>
  );
}
