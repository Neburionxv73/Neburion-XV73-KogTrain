"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { getProgressSnapshot, type ProgressSnapshot } from "@/lib/progress";
import styles from "./HomeDashboardV11.module.css";

const NAV_AREAS = [
  { label: "Memory", sub: "Gedächtnis", href: "/training/memory", icon: "◉" },
  { label: "Attention", sub: "Aufmerksamkeit", href: "/training/attention", icon: "◎" },
  { label: "Logic", sub: "Logik", href: "/training/logic", icon: "◇" },
  { label: "Language", sub: "Sprache", href: "/training/language", icon: "◌" },
  { label: "Visual", sub: "Visuell", href: "/training/visual", icon: "◉" },
  { label: "Gehirnfit", sub: "Rätsel & Alltag", href: "/training/brain-fit", icon: "✦" },
];

const ICONS = ["◉", "◎", "◇", "◌", "◉", "✦"];
const COLORS = ["teal", "blue", "violet", "orange", "pink", "green"] as const;

function formatLast(value: string | null) {
  if (!value) return "–";
  const date = new Date(value);
  return new Intl.DateTimeFormat("de-AT", { day: "2-digit", month: "2-digit" }).format(date);
}

export function HomeDashboardV11() {
  const [snapshot, setSnapshot] = useState<ProgressSnapshot | null>(null);

  useEffect(() => {
    const refresh = () => {
      try { setSnapshot(getProgressSnapshot()); } catch { setSnapshot(null); }
    };
    refresh();
    window.addEventListener("focus", refresh);
    window.addEventListener("storage", refresh);
    document.addEventListener("visibilitychange", refresh);
    return () => {
      window.removeEventListener("focus", refresh);
      window.removeEventListener("storage", refresh);
      document.removeEventListener("visibilitychange", refresh);
    };
  }, []);

  const labs = useMemo(() => snapshot?.labs ?? [], [snapshot]);
  const today = snapshot?.todaySessions ?? 0;
  const dailyGoal = snapshot?.dailyGoal ?? 2;
  const week = snapshot?.weekSessions ?? 0;
  const weeklyGoal = snapshot?.weeklyGoal ?? 5;
  const todayPercent = Math.min(100, Math.round((today / Math.max(1, dailyGoal)) * 100));
  const weekPercent = Math.min(100, Math.round((week / Math.max(1, weeklyGoal)) * 100));

  return (
    <main className={styles.appShell}>
      <aside className={styles.sidebar} aria-label="Hauptnavigation">
        <div className={styles.brand}>
          <span className={styles.brandMark}>✺</span>
          <div><strong>KogTrain V6.7</strong><small>Lern Plattform</small></div>
        </div>

        <nav className={styles.nav}>
          <Link className={`${styles.navItem} ${styles.active}`} href="/"><span>⌂</span><strong>Übersicht</strong></Link>
          <p>Trainingsbereiche</p>
          {NAV_AREAS.map(item => <Link className={styles.navItem} key={item.label} href={item.href}><span>{item.icon}</span><div><strong>{item.label}</strong><small>{item.sub}</small></div></Link>)}
          <p>Fortschritt</p>
          <a className={styles.navItem} href="#fortschritt"><span>▥</span><div><strong>Statistiken</strong></div></a>
          <a className={styles.navItem} href="#rhythmus"><span>↶</span><div><strong>Verlauf</strong></div></a>
          <p>Einstellungen</p>
          <Link className={styles.navItem} href="/account"><span>♙</span><div><strong>Profil</strong></div></Link>
          <Link className={styles.navItem} href="/account"><span>⚙</span><div><strong>Einstellungen</strong></div></Link>
        </nav>

        <a className={styles.logout} href="#top"><span>↪</span> Abmelden</a>
      </aside>

      <section className={styles.content} id="top">
        <div className={styles.topRow}>
          <div className={styles.welcome}>
            <span>Willkommen zurück!</span>
            <h1>Weiter so, du machst das großartig.</h1>
            <p>Persönlich. Klar. Wiederholbar.</p>
          </div>

          <div className={styles.metrics}>
            <article><span className={styles.metricIcon}>▣</span><strong>{snapshot?.totalSessions ?? 0}</strong><b>Sessions</b><small>{snapshot?.activeDays7 ?? 0} aktive Tage</small></article>
            <article><span className={styles.metricIcon}>◷</span><strong>{snapshot?.streak ?? 0}</strong><b>Tage in Folge</b><small>Aktuelle Serie</small></article>
            <article><span className={styles.metricIcon}>↗</span><strong>{snapshot?.activityCount ?? 0}</strong><b>Trainingsminuten</b><small>Gesamtzeit</small></article>
            <article><span className={`${styles.metricIcon} ${styles.orange}`}>☆</span><strong>{formatLast(snapshot?.lastSessionAt ?? null)}</strong><b>Letzter Wert</b><small>{snapshot?.hasTrainingData ? "Letzte Aktivität" : "Noch keine Daten"}</small></article>
          </div>
        </div>

        <div className={styles.mainGrid} id="fortschritt">
          <section className={styles.panel}>
            <div className={styles.panelHead}><div><span>Gesamtprofil</span><h2>Bereiche und Entwicklung</h2></div><em>{snapshot?.hasTrainingData ? `${snapshot.averageBest}% Ø` : "noch offen"}</em></div>
            <div className={styles.areaList}>
              {(labs.length ? labs : NAV_AREAS.map((item,index) => ({ id:item.label.toLowerCase(), label:item.label, accent:item.sub, href:item.href, sessions:0, bestPercent:0, icon:ICONS[index] }))).map((lab,index) => {
                const color = COLORS[index % COLORS.length];
                return <Link href={lab.href} className={styles.areaRow} key={lab.id}>
                  <span className={`${styles.areaIcon} ${styles[color]}`}>{ICONS[index % ICONS.length]}</span>
                  <div className={styles.areaCopy}><strong>{lab.label}</strong><small>{lab.accent}</small><div><i>Evidenz {lab.sessions >= 6 ? "hoch" : lab.sessions >= 3 ? "mittel" : "niedrig"}</i><i>{lab.sessions ? (lab.bestPercent >= 85 ? "Stark" : lab.bestPercent >= 65 ? "Stabil" : "Im Aufbau") : "Noch offen"}</i></div></div>
                  <div className={styles.areaValue}><span>{lab.sessions} Sessions</span><b>{lab.sessions ? `${lab.bestPercent}%` : "–"}</b><div><i style={{width:`${lab.sessions ? lab.bestPercent : 0}%`}} /></div></div>
                </Link>;
              })}
            </div>
          </section>

          <section className={styles.panel}>
            <div className={styles.panelHead}><div><span>Trainingsziele</span><h2>Heute und diese Woche</h2></div><em>Übersichtlich</em></div>
            <div className={styles.goal}><div><strong>Tagesziel</strong><b>{today}/{dailyGoal}</b></div><div className={styles.track}><i style={{width:`${todayPercent}%`}} /></div><small>{todayPercent >= 100 ? "Tagesziel erreicht." : "Noch eine kurze Session bringt dich dem Tagesziel näher."}</small></div>
            <div className={styles.goal}><div><strong>Wochenziel</strong><b>{week}/{weeklyGoal}</b></div><div className={styles.track}><i style={{width:`${weekPercent}%`}} /></div><small>{weekPercent}% des Wochenziels sind geschafft.</small></div>
            <Link className={styles.primaryButton} href="/training/journey">Training starten <span>→</span></Link>
          </section>
        </div>

        <section className={styles.rhythm} id="rhythmus">
          <div><span>Letzte 7 Tage</span><h2>Trainings-<br/>rhythmus</h2></div>
          <div className={styles.emptyState}><span>🗓️</span><div><strong>{snapshot?.activityCount ? "Aktivität vorhanden" : "Noch keine datierte Aktivität"}</strong><p>{snapshot?.activityCount ? "Dein 7-Tage-Verlauf basiert auf tatsächlich gespeicherten Sessions." : "Der 7-Tage-Verlauf beginnt mit der ersten Session, die auf diesem Speicherbereich abgeschlossen wird."}</p></div></div>
        </section>

        <footer className={styles.notice}><span>ⓘ</span><p>Aktivitätsserie und Tages-/Wochenverlauf werden lokal pro Browser-Domain gespeichert. Vercel-Preview-URLs besitzen technisch getrennte Speicherbereiche; deshalb für dauerhafte Fortschrittswerte dieselbe stabile KogTrain-Adresse verwenden.</p></footer>
      </section>
    </main>
  );
}
