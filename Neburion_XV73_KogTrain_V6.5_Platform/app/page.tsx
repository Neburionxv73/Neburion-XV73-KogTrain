import type { Metadata } from "next";
import Link from "next/link";
import { CoachHeroCard } from "@/components/CoachHeroCard";
import { DeferredProgressCoachDashboard } from "@/components/DeferredProgressCoachDashboard";
import { TopNav } from "@/components/TopNav";
import { WorldCard } from "@/components/WorldCard";
import { trainingWorlds } from "@/lib/training";
import { FOCUS_AREAS } from "@/lib/learningExpansion";
import styles from "./HomeV103.module.css";
import responsive from "./HomeV103ResponsiveFix.module.css";
import sectionResponsive from "./HomeResponsiveV103.module.css";

export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

export default function Home() {
  return (
    <main id="top" className={responsive.responsiveFix}>
      <TopNav />

      <section className={`${styles.heroStage} hero`} aria-labelledby="hero-title">
        <div className={`${styles.heroCopy} heroCopy`}>
          <p className="eyebrow">KogTrain · Persönliches Lern- und Training</p>
          <h1 id="hero-title">Lernen mit Struktur. Trainieren mit Fokus.</h1>
          <p>KogTrain verbindet Lernbereiche, Spezial-Training und Gehirnfit in einer klar geführten Plattform. Du wählst deinen Schwerpunkt, die Session führt dich Schritt für Schritt durch das Training.</p>
          <div className="heroActions">
            <Link prefetch={false} className="primary" href="/training/journey">Training starten →</Link>
            <a className="secondary" href="#lernbereiche">Bereiche ansehen</a>
          </div>
        </div>
        <CoachHeroCard />
      </section>

      <section className={`${styles.statusBand} v103-statusBand`} aria-label="Plattformüberblick">
        <div className={`${styles.statusInner} v103-statusInner`}>
          <div><small>Trainingssystem</small><strong>Persönlich. Klar. Wiederholbar.</strong></div>
          <div><small>Trainingswege</small><b>03</b></div>
          <div><small>Spezial-Labs</small><b>05</b></div>
          <div><small>Gehirnfit-Welten</small><b>12</b></div>
        </div>
      </section>

      <section className={`${styles.journey} journeyTeaser`} aria-labelledby="journey-teaser-title">
        <div>
          <p className="eyebrow">01 · Trainingsstart</p>
          <h2 id="journey-teaser-title">Eine klare Entscheidung vor jeder Einheit.</h2>
          <p>Wähle 5, 10 oder 15 Minuten. Danach entscheidest du zwischen persönlichem Lernmix, Spezial-Lab oder Gehirnfit & Alltag. Von dort führt dich KogTrain ohne Umwege durch die Session.</p>
        </div>
        <div className="journeyTeaserMeta">
          <span><strong>5 / 10 / 15</strong><small>Minuten</small></span>
          <span><strong>3</strong><small>Trainingswege</small></span>
          <Link prefetch={false} className="primary" href="/training/journey">Einheit zusammenstellen →</Link>
        </div>
      </section>

      <section className={`${styles.library} ${sectionResponsive.learningSection} learningLibrary`} id="lernbereiche" aria-labelledby="learning-title">
        <div className={`${styles.sectionHead} sectionHead`}>
          <div>
            <p className="eyebrow">02 · Persönlicher Lernmix</p>
            <h2 id="learning-title">Wähle, was du gezielt verbessern möchtest.</h2>
          </div>
          <p>Sechs Lernfelder bilden deinen persönlichen Mix. Du bestimmst den Fokus; KogTrain stellt daraus eine verständliche und zusammenhängende Einheit zusammen.</p>
        </div>
        <div className={`${styles.learningGrid} ${sectionResponsive.learningGrid} learningGrid`}>
          {FOCUS_AREAS.map((area)=><article className={`learningCard learning-${area.id}`} key={area.id}><span className="learningIcon" aria-hidden="true">{area.icon}</span><p className="eyebrow">{area.subtitle}</p><h3>{area.title}</h3><p>{area.description}</p></article>)}
        </div>
        <div className={`${styles.learningCta} ${sectionResponsive.learningCta} learningCta`}><div><strong>Persönlichen Trainingsmix aufbauen</strong><p>Ein Bereich oder mehrere. Inhalt und Schwierigkeit passen sich an deine gewählte Session an.</p></div><Link prefetch={false} className="primary" href="/training/focus">Fokus auswählen →</Link></div>
      </section>

      <section className={`${styles.worldStage} ${sectionResponsive.worldSection} worlds`} id="training" aria-labelledby="worlds-title">
        <div className={`${styles.sectionHead} sectionHead`}>
          <div><p className="eyebrow">03 · Spezial-Labs</p><h2 id="worlds-title">Fünf eigenständige Trainingswelten.</h2></div>
          <p>Memory, Attention, Logic, Language und Visual besitzen jeweils einen eigenen Trainingszweck, eine eigene Aufgabenlogik und direkte Rückmeldung.</p>
        </div>
        <div className={`${styles.worldGrid} ${sectionResponsive.worldGrid} worldGrid`}>{trainingWorlds.map((world, index) => <WorldCard key={world.id} world={world} index={index} />)}</div>
      </section>

      <section className={`${styles.brainfit} learningLibrary`} id="gehirnfit" aria-labelledby="brainfit-title">
        <div className={`${styles.sectionHead} sectionHead`}>
          <div><p className="eyebrow">04 · Gehirnfit & Alltag</p><h2 id="brainfit-title">Ruhiger trainieren. Alltag mitdenken.</h2></div>
          <p>Zwölf Übungswelten verbinden Sprache, Gedächtnis, Orientierung und Alltagslogik. Ohne unnötigen Zeitdruck und ohne medizinische Bewertung.</p>
        </div>
        <div className={`${styles.learningCta} learningCta`}><div><strong>12 Bereiche · Tagesmix · flexibel</strong><p>Tier-Sudoku, Wortsuche, Memory, Kategorien, Alltagsrechnen, Sprichwörter und weitere Übungen für Alltag und Konzentration.</p></div><Link prefetch={false} className="primary" href="/training/brain-fit">Gehirnfit öffnen →</Link></div>
      </section>

      <DeferredProgressCoachDashboard />

      <footer><span>Neburion XV73 · KogTrain V6.6</span><span>Lern- & Trainingsplattform</span></footer>
    </main>
  );
}
