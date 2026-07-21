"use client";

import { useEffect, useState } from "react";

type Status = {
  online: boolean;
  standalone: boolean;
  serviceWorker: "aktiv" | "wird vorbereitet" | "nicht verfügbar";
  cached: number;
};

export function PwaStatusStudio() {
  const [status, setStatus] = useState<Status>({ online: true, standalone: false, serviceWorker: "wird vorbereitet", cached: 0 });
  const [message, setMessage] = useState("Status wird geprüft …");

  async function inspect() {
    const swSupported = "serviceWorker" in navigator;
    const registration = swSupported ? await navigator.serviceWorker.getRegistration() : undefined;
    const cacheNames = "caches" in window ? await caches.keys() : [];
    setStatus({
      online: navigator.onLine,
      standalone: window.matchMedia("(display-mode: standalone)").matches,
      serviceWorker: !swSupported ? "nicht verfügbar" : registration?.active ? "aktiv" : "wird vorbereitet",
      cached: cacheNames.filter(name => name.startsWith("neburion-xv73")).length
    });
    setMessage(registration?.active ? "Offline-Basis und Update-Prüfung sind aktiv." : "Der Service Worker wird nach dem Produktionsstart aktiviert.");
  }

  useEffect(() => { inspect().catch(() => setMessage("Status konnte nicht vollständig gelesen werden.")); }, []);

  async function refreshOfflineBase() {
    const registration = await navigator.serviceWorker.getRegistration();
    await registration?.update();
    await inspect();
    setMessage("Update- und Offline-Prüfung wurde neu angestoßen.");
  }

  async function clearCaches() {
    const names = await caches.keys();
    await Promise.all(names.filter(name => name.startsWith("neburion-xv73")).map(name => caches.delete(name)));
    await inspect();
    setMessage("Zwischengespeicherte App-Dateien wurden entfernt. Lokale Trainingsdaten bleiben erhalten.");
  }

  return <div className="pwa-studio">
    <section className="panel pwa-hero"><div><span className="eyebrow">PWA & OFFLINE EXCELLENCE</span><h1>Neburion wie eine App nutzen.</h1><p className="lead">Installierbar, offline vorbereitet und mit kontrollierten Updates – ohne deine lokalen Trainingsdaten aus der Hand zu geben.</p></div><div className="pwa-device" aria-hidden="true"><span>N</span><i/></div></section>
    <section className="pwa-status-grid" aria-label="App-Status">
      <article className="metric-card"><span>Verbindung</span><strong>{status.online ? "Online" : "Offline"}</strong><small>{status.online ? "Neue Inhalte erreichbar" : "Lokale Basis aktiv"}</small></article>
      <article className="metric-card"><span>App-Modus</span><strong>{status.standalone ? "Installiert" : "Browser"}</strong><small>{status.standalone ? "Eigenständiges Fenster" : "Installation je nach Browser möglich"}</small></article>
      <article className="metric-card"><span>Offline Engine</span><strong>{status.serviceWorker}</strong><small>{status.cached} Neburion-Cache{status.cached === 1 ? "" : "s"}</small></article>
    </section>
    <section className="profile-layout">
      <article className="panel"><span className="eyebrow">OFFLINE-BASIS</span><h2>Was ohne Verbindung verfügbar bleibt</h2><ul className="pwa-checklist"><li>bereits aufgerufene Plattformseiten</li><li>lokale Profileinstellungen und Trainingsergebnisse</li><li>fortsetzbare Sessions auf demselben Gerät</li><li>eine klare Offline-Hinweisseite statt eines Browserfehlers</li></ul><p className="data-message">{message}</p><div className="backup-actions"><button className="btn btn-primary" type="button" onClick={refreshOfflineBase}>Status neu prüfen</button><button className="btn btn-secondary" type="button" onClick={clearCaches}>App-Cache leeren</button></div></article>
      <article className="panel"><span className="eyebrow">INSTALLATION</span><h2>Direkter Zugriff auf jedem Gerät</h2><div className="install-steps"><div><b>1</b><span><strong>Plattform öffnen</strong><small>In Chrome, Edge oder Safari aufrufen.</small></span></div><div><b>2</b><span><strong>Installieren wählen</strong><small>Browser-Menü oder Neburion-Installationshinweis verwenden.</small></span></div><div><b>3</b><span><strong>Wie eine App starten</strong><small>Über Startmenü oder Homescreen öffnen.</small></span></div></div><p className="privacy-note">Die Installation legt keine fremde Cloud-Kopie deiner Trainingsdaten an. Deine lokalen Daten bleiben an das jeweilige Browserprofil gebunden.</p></article>
    </section>
  </div>;
}
