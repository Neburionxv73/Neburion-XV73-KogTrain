import type { Metadata } from "next";
import Link from "next/link";
import { AccountPanel } from "@/components/AccountPanel";
import "./account-v12.css";

export const metadata: Metadata = {
  title: "Konto & Cloud-Spielstand · KogTrain V12",
  description: "Privater KogTrain-Cloud-Zugang für geräteübergreifenden Lernfortschritt und Cloud-Spielstände.",
  robots: { index: false, follow: false },
};

export default function AccountPage() {
  return <main className="accountV12">
    <div className="accountV12__topbar">
      <Link href="/profile">← Zu den Spielerprofilen</Link>
      <span>KogTrain V12 · Konto & Cloud-Sync</span>
    </div>

    <section className="accountV12__shell">
      <header className="accountV12__hero">
        <div>
          <p className="accountV12__eyebrow">Privater Gerätezugang</p>
          <h1>Dein Spielstand. Überall dabei.</h1>
          <p className="accountV12__lead">Cloud-Sync hält XP, Sessions, Skill-Werte und adaptive Trainingsdaten auf mehreren Geräten zusammen. Lokale Spielerprofile funktionieren weiterhin ohne Konto.</p>
        </div>

        <aside className="accountV12__summary">
          <span>Datenschutz · V12</span>
          <strong>Keine E-Mail erforderlich</strong>
          <p>Für den Cloud-Zugang reichen Kontoname und Passwort. Zur Passwort-Wiederherstellung dient ausschließlich dein persönlicher Recovery-Code.</p>
        </aside>
      </header>

      <div className="accountV12__privacy">
        <span aria-hidden="true">🔐</span>
        <div><b>Du entscheidest über die Speicherung.</b> Lokal bleiben Daten nur auf diesem Gerät. Cloud-Sync wird erst nach eigener Kontoerstellung und bestätigtem Wiederherstellungscode aktiv.</div>
      </div>

      <div className="accountV12__panel">
        <AccountPanel />
      </div>

      <div className="accountV12__help" aria-label="Cloud-Sync erklärt">
        <div><strong>1 · Lokal starten</strong><span>Nur Spielername. Keine Registrierung, kein Passwort und keine Cloud.</span></div>
        <div><strong>2 · Cloud optional</strong><span>Kontoname und Passwort reichen für geräteübergreifendes Speichern.</span></div>
        <div><strong>3 · Recovery sichern</strong><span>Der einmalige Wiederherstellungscode ersetzt jede E-Mail-Passwortrettung.</span></div>
      </div>
    </section>
  </main>;
}
