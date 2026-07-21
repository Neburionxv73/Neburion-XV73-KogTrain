"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type InstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
};

export function PwaExperience() {
  const [online, setOnline] = useState(true);
  const [installPrompt, setInstallPrompt] = useState<InstallPromptEvent | null>(null);
  const [updateReady, setUpdateReady] = useState(false);
  const [installed, setInstalled] = useState(false);

  useEffect(() => {
    setOnline(navigator.onLine);
    setInstalled(window.matchMedia("(display-mode: standalone)").matches);

    const onOnline = () => setOnline(true);
    const onOffline = () => setOnline(false);
    const onInstallPrompt = (event: Event) => {
      event.preventDefault();
      setInstallPrompt(event as InstallPromptEvent);
    };
    const onInstalled = () => {
      setInstalled(true);
      setInstallPrompt(null);
    };

    window.addEventListener("online", onOnline);
    window.addEventListener("offline", onOffline);
    window.addEventListener("beforeinstallprompt", onInstallPrompt);
    window.addEventListener("appinstalled", onInstalled);

    if ("serviceWorker" in navigator && process.env.NODE_ENV === "production") {
      navigator.serviceWorker.ready.then(registration => {
        registration.addEventListener("updatefound", () => {
          const worker = registration.installing;
          if (!worker) return;
          worker.addEventListener("statechange", () => {
            if (worker.state === "installed" && navigator.serviceWorker.controller) setUpdateReady(true);
          });
        });
      }).catch(() => undefined);
    }

    return () => {
      window.removeEventListener("online", onOnline);
      window.removeEventListener("offline", onOffline);
      window.removeEventListener("beforeinstallprompt", onInstallPrompt);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  async function installApp() {
    if (!installPrompt) return;
    await installPrompt.prompt();
    const choice = await installPrompt.userChoice;
    if (choice.outcome === "accepted") setInstallPrompt(null);
  }

  function activateUpdate() {
    navigator.serviceWorker.getRegistration().then(registration => {
      registration?.waiting?.postMessage({ type: "SKIP_WAITING" });
      window.location.reload();
    });
  }

  return <div className="pwa-experience" aria-live="polite">
    {!online && <div className="pwa-banner is-offline"><span aria-hidden="true">◌</span><div><strong>Offline-Modus aktiv</strong><small>Bereits geladene Bereiche und lokale Trainingsdaten bleiben verfügbar.</small></div><Link href="/offline">Details</Link></div>}
    {updateReady && <div className="pwa-banner is-update"><span aria-hidden="true">↻</span><div><strong>Neue Version verfügbar</strong><small>Aktualisiere die Plattform, wenn du deine aktuelle Aufgabe abgeschlossen hast.</small></div><button type="button" onClick={activateUpdate}>Aktualisieren</button></div>}
    {installPrompt && !installed && online && <button type="button" className="pwa-install-fab" onClick={installApp}><span aria-hidden="true">＋</span><span><strong>App installieren</strong><small>Schneller Zugriff auf diesem Gerät</small></span></button>}
  </div>;
}
