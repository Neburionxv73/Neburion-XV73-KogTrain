"use client";

import { ChangeEvent, useEffect, useMemo, useState } from "react";
import { loadResults } from "@/features/progress-engine/storage";
import { loadPreferences, savePreferences } from "@/features/session-engine/storage";
import type { UserPreferences } from "@/features/session-engine/types";
import { clearNeburionData, createBackup, restoreBackup, validateBackup } from "@/features/data-control/backup";

const APP_VERSION = "4.0.0";
const fallback: UserPreferences = {
  name: "",
  goal: "ausgewogen",
  duration: 10,
  domains: ["gedaechtnis", "aufmerksamkeit", "logik", "sprache", "visuell"],
  difficulty: "mittel",
  focusMode: false,
  completedAt: new Date(0).toISOString()
};

function fileName() {
  const date = new Date().toISOString().slice(0, 10);
  return `neburion-xv73-backup-${date}.json`;
}

export function ProfileDataStudio() {
  const [preferences, setPreferences] = useState<UserPreferences>(fallback);
  const [message, setMessage] = useState("Bereit für eine sichere lokale Datensicherung.");
  const [resultsCount, setResultsCount] = useState(0);

  useEffect(() => {
    setPreferences(loadPreferences() ?? fallback);
    setResultsCount(loadResults().length);
  }, []);

  const profileState = useMemo(() => {
    if (!preferences.name && resultsCount === 0) return "Neues lokales Profil";
    if (resultsCount < 5) return "Profil im Aufbau";
    return "Aktives Trainingsprofil";
  }, [preferences.name, resultsCount]);

  function update<K extends keyof UserPreferences>(key: K, value: UserPreferences[K]) {
    const next = { ...preferences, [key]: value, completedAt: preferences.completedAt || new Date().toISOString() };
    setPreferences(next);
    savePreferences(next);
    setMessage("Profiländerung wurde lokal gespeichert.");
  }

  function exportData() {
    const backup = createBackup(APP_VERSION);
    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = fileName();
    anchor.click();
    URL.revokeObjectURL(url);
    setMessage(`Backup erstellt · Prüfsumme ${backup.checksum}`);
  }

  async function importData(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    try {
      const parsed = JSON.parse(await file.text());
      const backup = validateBackup(parsed);
      restoreBackup(backup);
      setPreferences(loadPreferences() ?? fallback);
      setResultsCount(loadResults().length);
      setMessage(`Backup vom ${new Date(backup.createdAt).toLocaleString("de-AT")} erfolgreich wiederhergestellt.`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Backup konnte nicht importiert werden.");
    }
  }

  function clearAll() {
    if (!window.confirm("Alle lokalen Neburion-Daten auf diesem Gerät löschen? Diese Aktion kann nur mit einem vorherigen Backup rückgängig gemacht werden.")) return;
    clearNeburionData();
    setPreferences(fallback);
    setResultsCount(0);
    setMessage("Alle lokalen Profildaten wurden gelöscht.");
  }

  return <div className="profile-studio">
    <section className="profile-hero panel">
      <div>
        <span className="eyebrow">Local-first Profile Core</span>
        <h1>Dein Training. Deine Daten. Deine Kontrolle.</h1>
        <p className="lead">Profil und Trainingsergebnisse bleiben standardmäßig in diesem Browser. Ein geprüftes Backup lässt sich jederzeit exportieren und wiederherstellen.</p>
      </div>
      <div className="profile-orbit" aria-hidden="true"><span>XV73</span></div>
    </section>

    <section className="profile-status-grid" aria-label="Profilstatus">
      <article className="metric-card"><span>Profilstatus</span><strong>{profileState}</strong></article>
      <article className="metric-card"><span>Gespeicherte Ergebnisse</span><strong>{resultsCount}</strong></article>
      <article className="metric-card"><span>Speicherort</span><strong>Dieses Gerät</strong></article>
    </section>

    <section className="profile-layout">
      <article className="panel profile-form">
        <span className="eyebrow">Persönliches Profil</span>
        <h2>Training passend einstellen</h2>
        <label><span>Anzeigename</span><input value={preferences.name} onChange={(event) => update("name", event.target.value.slice(0, 40))} placeholder="Zum Beispiel Edi" /></label>
        <label><span>Trainingsziel</span><select value={preferences.goal} onChange={(event) => update("goal", event.target.value as UserPreferences["goal"])}><option value="ausgewogen">Ausgewogen trainieren</option><option value="alltag">Alltag stärken</option><option value="fokus">Fokus verbessern</option><option value="gedaechtnis">Gedächtnis trainieren</option></select></label>
        <label><span>Bevorzugte Dauer</span><select value={preferences.duration} onChange={(event) => update("duration", Number(event.target.value) as UserPreferences["duration"])}><option value={5}>5 Minuten</option><option value={10}>10 Minuten</option><option value={15}>15 Minuten</option></select></label>
        <label><span>Startschwierigkeit</span><select value={preferences.difficulty} onChange={(event) => update("difficulty", event.target.value as UserPreferences["difficulty"])}><option value="einstieg">Einstieg</option><option value="leicht">Leicht</option><option value="mittel">Mittel</option><option value="schwer">Schwer</option><option value="profi">Profi</option></select></label>
      </article>

      <article className="panel backup-vault">
        <span className="eyebrow">Backup Vault</span>
        <h2>Datensicherung mit Integritätsprüfung</h2>
        <p>Das Backup umfasst Profil, Einstellungen, Trainingsfortschritt, aktive Session und Fokusansicht. Eine Prüfsumme erkennt beschädigte oder veränderte Dateien.</p>
        <div className="backup-actions">
          <button className="btn btn-primary" onClick={exportData}>Backup exportieren</button>
          <label className="btn btn-secondary file-button">Backup importieren<input type="file" accept="application/json,.json" onChange={importData} /></label>
        </div>
        <div className="data-message" role="status" aria-live="polite">{message}</div>
        <div className="privacy-note"><strong>Local-first:</strong> Es wird kein Benutzerkonto benötigt und beim Export werden keine Daten automatisch hochgeladen.</div>
      </article>
    </section>

    <section className="panel danger-zone">
      <div><span className="eyebrow">Datenkontrolle</span><h2>Lokale Daten vollständig entfernen</h2><p>Erstelle vorher ein Backup, falls du deinen Fortschritt später wiederherstellen möchtest.</p></div>
      <button className="btn btn-danger" onClick={clearAll}>Alle lokalen Daten löschen</button>
    </section>
  </div>;
}
