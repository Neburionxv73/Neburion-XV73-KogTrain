"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import type { TrainingResult } from "@/features/cognitive-engine/types";
import { loadResults } from "@/features/progress-engine/storage";
import { averageScore, recentWindow } from "@/features/progress-engine/analytics";
import { coachRecommendation } from "@/features/coach-engine/recommendation";
import { buildDailyMissions, updateProfileFromResults, xpProgress } from "@/features/platform-engine/platform";
import type { PlatformProfile } from "@/features/platform-engine/types";

const labs = [
  { href: "/memory-lab", icon: "🧠", name: "Memory Lab", meta: "25 Übungen", text: "Wörter, Zahlen, Symbole, Reihenfolgen und Geschichten.", state: "Aktiv" },
  { href: "/attention-lab", icon: "🎯", name: "Attention Lab", meta: "5 Trainingsfamilien", text: "Visuelle Suche, Reaktion, Farbkonflikt und Doppelaufgaben.", state: "Aktiv" },
  { href: "/logic-lab", icon: "◇", name: "Logic Lab", meta: "4 Trainingswelten", text: "Muster, Regeln, Reihen und Schlussfolgerungen.", state: "Aktiv" },
  { href: "/language-lab", icon: "Aa", name: "Language Lab", meta: "4 Sprachwelten", text: "Synonyme, Kategorien, Satzbau und Wortfindung.", state: "Aktiv" },
  { href: "/visual-lab", icon: "◉", name: "Visual Lab", meta: "5 visuelle Welten", text: "Formen, Rotation, Spiegelung, Reihen und Perspektive.", state: "Aktiv" }
];

export function PlatformDashboard() {
  const [results, setResults] = useState<TrainingResult[]>([]);
  const [profile, setProfile] = useState<PlatformProfile>({ xp: 0, level: 1, streak: 0, completedMissionIds: [] });

  useEffect(() => {
    const stored = loadResults();
    setResults(stored);
    setProfile(updateProfileFromResults(stored));
  }, []);

  const missions = useMemo(() => buildDailyMissions(results), [results]);
  const coach = coachRecommendation(results);
  const week = recentWindow(results, 7);
  const completed = missions.filter((mission) => mission.completed).length;
  const target = coach.href;

  return <>
    <section className="platform-welcome panel">
      <div>
        <span className="eyebrow">Beta 3.3 · Motivation & Meilensteine</span>
        <p className="platform-greeting">Willkommen zurück, Edi.</p>
        <h1>Heute zählt ein klarer nächster Schritt.</h1>
        <p className="lead">Dein Dashboard verbindet Training, Tagesziele, Fortschritt und Coach-Empfehlung zu einem ruhigen Arbeitsfluss.</p>
        <div className="actions"><Link className="btn btn-primary" href="/session">Training zusammenstellen</Link><Link className="btn btn-secondary" href={target}>Coach-Fokus starten</Link><Link className="text-link" href="/achievements">Wochenziele ansehen →</Link></div>
      </div>
      <div className="level-orbit" aria-label={`Level ${profile.level}`}>
        <div className="level-core"><span>LEVEL</span><strong>{profile.level}</strong><small>{profile.xp} XP</small></div>
        <div className="level-progress"><span style={{ width: `${xpProgress(profile.xp)}%` }} /></div>
        <p>{300 - (profile.xp % 300 || 300)} XP bis zum nächsten Level</p>
      </div>
    </section>

    <section className="platform-kpis" aria-label="Trainingsübersicht">
      <article><span>Serie</span><strong>{profile.streak} Tage</strong><small>Regelmäßigkeit vor Intensität</small></article>
      <article><span>Diese Woche</span><strong>{week.length} Aufgaben</strong><small>{averageScore(week)} % Durchschnitt</small></article>
      <article><span>Heute</span><strong>{completed} / {missions.length}</strong><small>Tagesmissionen erledigt</small></article>
      <article><span>Gesamt</span><strong>{results.length}</strong><small>lokal gespeicherte Ergebnisse</small></article>
    </section>

    <section className="dashboard-section">
      <div className="section-title-row"><div><span className="eyebrow">Tagesstruktur</span><h2>Deine Missionen</h2></div><div className="mission-total">+{missions.reduce((sum, item) => sum + item.xp, 0)} XP möglich</div></div>
      <div className="mission-list">
        {missions.map((mission, index) => <Link key={mission.id} href={mission.href} className={`mission-row ${mission.completed ? "is-complete" : ""}`}>
          <span className="mission-index">{mission.completed ? "✓" : String(index + 1).padStart(2, "0")}</span>
          <span className="mission-copy"><strong>{mission.title}</strong><small>{mission.description}</small></span>
          <span className="mission-xp">+{mission.xp} XP</span>
        </Link>)}
      </div>
    </section>

    <section className="dashboard-section">
      <div className="section-title-row"><div><span className="eyebrow">Trainingswelten</span><h2>Exercise Library</h2></div><Link href="/training" className="text-link">Gemischtes Training →</Link></div>
      <div className="platform-lab-grid">
        {labs.map((lab) => <Link href={lab.href} key={lab.name} className="platform-lab-card">
          <div className="lab-card-top"><span className="platform-lab-icon">{lab.icon}</span><span className={`lab-state ${lab.state === "Aktiv" ? "is-active" : ""}`}>{lab.state}</span></div>
          <p className="lab-meta">{lab.meta}</p><h3>{lab.name}</h3><p>{lab.text}</p><span className="lab-enter">Modul öffnen <b>↗</b></span>
        </Link>)}
      </div>
    </section>

    <section className="coach-command panel">
      <div><span className="eyebrow">Coach Engine 3.0 · Aktiv</span><h2>{coach.title}</h2><p>{coach.text}</p></div>
      <div className="coach-command-side"><div className="strategy-card"><strong>Warum diese Empfehlung?</strong><br />{coach.strategy}</div><Link className="btn btn-primary" href={target}>Jetzt umsetzen</Link></div>
    </section>
  </>;
}
