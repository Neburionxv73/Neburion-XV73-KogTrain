"use client";

import Link from "next/link";
import { PlayerProfileManager } from "./PlayerProfileManager";
import { usePlatformLanguage } from "./PlatformLanguageProvider";

export function ProfilePageContent() {
  const { pick } = usePlatformLanguage();
  return (
    <main className="profileV12">
      <div className="profileV12__topbar">
        <Link href="/">← {pick("Zur Plattform", "Back to platform")}</Link>
        <span>KogTrain V12 · {pick("Spielerprofile", "Player profiles")}</span>
      </div>

      <section className="profileV12__shell">
        <header className="profileV12__hero">
          <div>
            <p className="profileV12__eyebrow">{pick("Persönlicher Lernbereich", "Personal learning area")}</p>
            <h1>{pick("Dein Lernen. Dein Spielstand.", "Your learning. Your progress.")}</h1>
            <p className="profileV12__lead">{pick("Verwalte getrennte Spielerprofile, ohne Trainingsstände zu vermischen. XP, Level, Skill-Werte und adaptive Trainingsdaten bleiben eindeutig dem aktiven Profil zugeordnet.", "Manage separate player profiles without mixing training progress. XP, levels, skill scores and adaptive training data remain clearly assigned to the active profile.")}</p>
          </div>

          <aside className="profileV12__cloud">
            <span>{pick("Optional · geräteübergreifend", "Optional · cross-device")}</span>
            <strong>Cloud Sync</strong>
            <p>{pick("Lokale Profile funktionieren ohne Konto. Für mehrere Geräte kannst du zusätzlich einen privaten Cloud-Zugang mit Kontoname und Passwort verwenden.", "Local profiles work without an account. For multiple devices, you can also use private cloud access with an account name and password.")}</p>
            <Link href="/account">{pick("Konto & Cloud-Sync", "Account & Cloud Sync")} →</Link>
          </aside>
        </header>

        <div className="profileV12__privacy">
          <span aria-hidden="true">🔒</span>
          <div><b>{pick("Datenschutz zuerst.", "Privacy first.")}</b> {pick("Für Spielerzugänge wird keine E-Mail-Adresse benötigt. Ein lokales Profil bleibt vollständig auf diesem Gerät, solange du Cloud-Sync nicht aktivierst.", "No email address is required for player access. A local profile remains entirely on this device unless you activate Cloud Sync.")}</div>
        </div>

        <div className="profileV12__manager"><PlayerProfileManager /></div>
      </section>
    </main>
  );
}
