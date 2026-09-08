"use client";

import Link from "next/link";
import { AccountPanel } from "./AccountPanel";
import { usePlatformLanguage } from "./PlatformLanguageProvider";

export function AccountPageContent() {
  const { pick } = usePlatformLanguage();
  return <main className="accountV12">
    <div className="accountV12__topbar">
      <Link href="/profile">← {pick("Zu den Spielerprofilen", "Back to player profiles")}</Link>
      <span>KogTrain V12 · {pick("Konto & Cloud-Sync", "Account & Cloud Sync")}</span>
    </div>

    <section className="accountV12__shell">
      <header className="accountV12__hero">
        <div>
          <p className="accountV12__eyebrow">{pick("Privater Gerätezugang", "Private device access")}</p>
          <h1>{pick("Dein Spielstand. Überall dabei.", "Your progress. Available everywhere.")}</h1>
          <p className="accountV12__lead">{pick("Cloud-Sync hält XP, Sessions, Skill-Werte und adaptive Trainingsdaten auf mehreren Geräten zusammen. Lokale Spielerprofile funktionieren weiterhin ohne Konto.", "Cloud Sync keeps XP, sessions, skill scores and adaptive training data consistent across devices. Local player profiles still work without an account.")}</p>
        </div>

        <aside className="accountV12__summary">
          <span>{pick("Datenschutz", "Privacy")} · V12</span>
          <strong>{pick("Keine E-Mail erforderlich", "No email required")}</strong>
          <p>{pick("Für den Cloud-Zugang reichen Kontoname und Passwort. Zur Passwort-Wiederherstellung dient ausschließlich dein persönlicher Recovery-Code.", "An account name and password are enough for cloud access. Your personal recovery code is the only method used for password recovery.")}</p>
        </aside>
      </header>

      <div className="accountV12__privacy">
        <span aria-hidden="true">🔐</span>
        <div><b>{pick("Du entscheidest über die Speicherung.", "You decide how data is stored.")}</b> {pick("Lokal bleiben Daten nur auf diesem Gerät. Cloud-Sync wird erst nach eigener Kontoerstellung und bestätigtem Wiederherstellungscode aktiv.", "Local data stays on this device. Cloud Sync is activated only after you create an account and confirm your recovery code.")}</div>
      </div>

      <div className="accountV12__panel"><AccountPanel /></div>

      <div className="accountV12__help" aria-label={pick("Cloud-Sync erklärt", "Cloud Sync explained")}>
        <div><strong>1 · {pick("Lokal starten", "Start locally")}</strong><span>{pick("Nur Spielername. Keine Registrierung, kein Passwort und keine Cloud.", "Player name only. No registration, password or cloud required.")}</span></div>
        <div><strong>2 · {pick("Cloud optional", "Cloud optional")}</strong><span>{pick("Kontoname und Passwort reichen für geräteübergreifendes Speichern.", "Account name and password are enough for cross-device saving.")}</span></div>
        <div><strong>3 · {pick("Recovery sichern", "Save recovery code")}</strong><span>{pick("Der einmalige Wiederherstellungscode ersetzt jede E-Mail-Passwortrettung.", "The one-time recovery code replaces email-based password recovery.")}</span></div>
      </div>
    </section>
  </main>;
}
