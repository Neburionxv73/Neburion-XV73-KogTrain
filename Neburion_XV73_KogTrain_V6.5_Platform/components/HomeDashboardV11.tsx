"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { getProgressSnapshot, type ProgressSnapshot } from "@/lib/progress";
import { usePlatformLanguage } from "./PlatformLanguageProvider";
import { GranularWeaknessV1 } from "./GranularWeaknessV1";
import { TargetedRepeatV1 } from "./TargetedRepeatV1";
import styles from "./HomeDashboardV11.module.css";

const NAV_AREAS = [
  { id: "memory", label: "Memory", subKey: "area.memory", href: "/training/memory", icon: "◉" },
  { id: "attention", label: "Attention", subKey: "area.attention", href: "/training/attention", icon: "◎" },
  { id: "logic", label: "Logic", subKey: "area.logic", href: "/training/logic", icon: "◇" },
  { id: "language", label: "Language", subKey: "area.language", href: "/training/language", icon: "▣" },
  { id: "visual", label: "Visual", subKey: "area.visual", href: "/training/visual", icon: "◉" },
  { id: "brain-fit", label: "BrainFit", subKey: "area.brainfitSub", href: "/training/brain-fit", icon: "✦" },
];

const ICONS = ["◉", "◎", "◇", "▣", "◉", "✦"];
const COLORS = ["teal", "blue", "violet", "orange", "pink", "green"] as const;

function formatLast(value: string | null, language: "de" | "en") {
  if (!value) return "–";
  const date = new Date(value);
  return new Intl.DateTimeFormat(language === "en" ? "en-US" : "de-AT", { day: "2-digit", month: "2-digit" }).format(date);
}

export function HomeDashboardV11() {
  const { language, t } = usePlatformLanguage();
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

  const displayLabs = labs.length
    ? labs
    : NAV_AREAS.map((item, index) => ({ id: item.id, label: item.label, accent: t(item.subKey), href: item.href, sessions: 0, bestPercent: 0, icon: ICONS[index] }));

  const localizedLab = (lab: typeof displayLabs[number]) => {
    const nav = NAV_AREAS.find(item => item.id === lab.id || item.href === lab.href);
    if (!nav) return { label: lab.label, accent: lab.accent };
    return { label: nav.label, accent: t(nav.subKey) };
  };

  return (
    <main className={styles.appShell}>
      <aside className={styles.sidebar} aria-label={t("nav.main")}>
        <div className={styles.brand}>
          <span className={styles.brandMark}>✺</span>
          <div><strong>KogTrain V12</strong><small>{t("nav.learningPlatform")}</small></div>
        </div>

        <nav className={styles.nav}>
          <Link className={`${styles.navItem} ${styles.active}`} href="/"><span>⌂</span><div><strong>Dashboard</strong></div><b>›</b></Link>
          <p>{t("nav.trainingAreas")}</p>
          {NAV_AREAS.map(item => (
            <Link className={styles.navItem} key={item.id} href={item.href}>
              <span>{item.icon}</span><div><strong>{item.label}</strong><small>{t(item.subKey)}</small></div><b>›</b>
            </Link>
          ))}
          <p>{t("nav.progress")}</p>
          <a className={styles.navItem} href="#fortschritt"><span>▥</span><div><strong>{t("nav.statistics")}</strong></div></a>
          <a className={styles.navItem} href="#analyse"><span>♜</span><div><strong>{t("nav.achievements")}</strong></div></a>
          <a className={styles.navItem} href="#rhythmus"><span>▣</span><div><strong>{t("nav.calendar")}</strong></div></a>
          <a className={styles.navItem} href="#wiederholung"><span>⌁</span><div><strong>{t("nav.learningPath")}</strong></div></a>
          <p>{t("nav.settings")}</p>
          <Link className={styles.navItem} href="/profile"><span>♙</span><div><strong>{t("nav.profile")}</strong></div></Link>
        </nav>

        <a className={styles.logout} href="#top"><span>↪</span> {t("nav.logout")}</a>
      </aside>

      <section className={styles.content} id="top">
        <div className={styles.heroBackdrop} aria-hidden="true" />
        <div className={styles.quoteTop}>„{t("dashboard.quote")}" <span>→</span></div>

        <div className={styles.topRow}>
          <div className={styles.welcome}>
            <span>{t("dashboard.welcome")}</span>
            <h1>{t("dashboard.headline")}</h1>
            <p>{t("dashboard.tagline")}</p>
          </div>

          <div className={styles.metrics}>
            <article><span className={styles.metricIcon}>▣</span><strong>{snapshot?.totalSessions ?? 0}</strong><b>{t("dashboard.sessions")}</b><small>{snapshot?.activeDays7 ?? 0} {t("dashboard.activeDays")}</small></article>
            <article><span className={styles.metricIcon}>◷</span><strong>{snapshot?.streak ?? 0}</strong><b>{t("dashboard.streak")}</b><small>{t("dashboard.currentStreak")}</small></article>
            <article><span className={styles.metricIcon}>↗</span><strong>{snapshot?.activityCount ?? 0}</strong><b>{t("dashboard.minutes")}</b><small>{t("dashboard.totalTime")}</small></article>
            <article><span className={`${styles.metricIcon} ${styles.orange}`}>★</span><strong>{formatLast(snapshot?.lastSessionAt ?? null, language)}</strong><b>{t("dashboard.lastValue")}</b><small>{snapshot?.hasTrainingData ? t("dashboard.lastActivity") : t("dashboard.noData")}</small></article>
          </div>
        </div>

        <div className={styles.mainGrid} id="fortschritt">
          <section className={styles.panel}>
            <div className={styles.panelHead}>
              <div><span>{t("dashboard.totalProfile")}</span><h2>{t("dashboard.areasDevelopment")}</h2></div>
              <a className={styles.ghostAction} href="#analyse">{t("dashboard.showAll")} <span>→</span></a>
            </div>
            <div className={styles.areaList}>
              {displayLabs.map((lab, index) => {
                const color = COLORS[index % COLORS.length];
                const copy = localizedLab(lab);
                return (
                  <div className={styles.areaRow} key={lab.id}>
                    <span className={`${styles.areaIcon} ${styles[color]}`}>{ICONS[index % ICONS.length]}</span>
                    <div className={styles.areaCopy}>
                      <strong>{copy.label}</strong><small>{copy.accent}</small>
                      <div><i>{t("dashboard.evidence")} {lab.sessions >= 6 ? t("dashboard.high") : lab.sessions >= 3 ? t("dashboard.medium") : t("dashboard.low")}</i><i>{lab.sessions ? (lab.bestPercent >= 85 ? t("dashboard.strong") : lab.bestPercent >= 65 ? t("dashboard.stable") : t("dashboard.building")) : t("dashboard.open")}</i></div>
                    </div>
                    <div className={styles.areaValue}><span>{lab.sessions} {t("dashboard.sessions")}</span><div><i style={{width:`${lab.sessions ? lab.bestPercent : 0}%`}} /></div></div>
                    <Link href={lab.href} className={styles.startButton}>{t("dashboard.start")} <span>→</span></Link>
                  </div>
                );
              })}
            </div>
            <Link className={styles.moreButton} href="/training/journey"><span>＋</span><div><strong>{t("dashboard.moreAreas")}</strong><small>{t("dashboard.moreAreasSub")}</small></div><b>›</b></Link>
          </section>

          <div className={styles.sideStack}>
            <section className={styles.panel}>
              <div className={styles.panelHead}><div><span>{t("dashboard.trainingGoals")}</span><h2>{t("dashboard.todayWeek")}</h2></div><em>{t("dashboard.clear")}</em></div>
              <div className={styles.goal}><div><strong>{t("dashboard.dailyGoal")}</strong><b>{today}/{dailyGoal}</b></div><div className={styles.track}><i style={{width:`${todayPercent}%`}} /></div><small>{todayPercent >= 100 ? t("dashboard.dailyReached") : t("dashboard.dailyHint")}</small></div>
              <div className={styles.goal}><div><strong>{t("dashboard.weeklyGoal")}</strong><b>{week}/{weeklyGoal}</b></div><div className={styles.track}><i style={{width:`${weekPercent}%`}} /></div><small>{weekPercent}% {t("dashboard.weekDone")}</small></div>
              <Link className={styles.primaryButton} href="/training/journey"><span className={styles.playIcon}>▶</span> {t("dashboard.startTraining")} <span>→</span></Link>
            </section>

            <aside className={styles.quoteCard}><span>❝</span><div><strong>{t("dashboard.consistency")}</strong><small>{t("dashboard.team")}</small></div></aside>
            <aside className={styles.tipCard}><span>💡</span><div><strong>{t("dashboard.didYouKnow")}</strong><p>{t("dashboard.tip")}</p></div><b>›</b></aside>
          </div>
        </div>

        <div className={styles.deepSection} id="analyse"><GranularWeaknessV1 /></div>
        <div className={styles.deepSection} id="wiederholung"><TargetedRepeatV1 /></div>

        <section className={styles.rhythm} id="rhythmus">
          <div><span>{t("dashboard.last7")}</span><h2>{t("dashboard.rhythm")}</h2></div>
          <div className={styles.emptyState}><span>🗓️</span><div><strong>{snapshot?.activityCount ? t("dashboard.activityExists") : t("dashboard.noDatedActivity")}</strong><p>{snapshot?.activityCount ? t("dashboard.activityText") : t("dashboard.noActivityText")}</p></div></div>
        </section>

        <footer className={styles.notice}><span>ⓘ</span><p>{t("dashboard.storageNotice")}</p></footer>
      </section>
    </main>
  );
}
