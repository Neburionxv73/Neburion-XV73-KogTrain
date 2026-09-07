import type { Metadata } from "next";
import Link from "next/link";
import { PlayerProfileManager } from "@/components/PlayerProfileManager";
import "./profile-v12.css";

export const metadata: Metadata = {
  title: "Spielerprofile · KogTrain V12",
  description: "Eigene Spielerprofile mit getrennten Lernständen, XP und Trainingsfortschritten verwalten.",
  robots: { index: false, follow: false },
};

export default function ProfilePage() {
  return (
    <main className="profileV12">
      <div className="profileV12__topbar">
        <Link href="/">← Zur Plattform</Link>
        <span>KogTrain V12 · Spielerprofile</span>
      </div>

      <section className="profileV12__shell">
        <header className="profileV12__hero">
          <div>
            <p className="profileV12__eyebrow">Persönlicher Lernbereich</p>
            <h1>Dein Lernen. Dein Spielstand.</h1>
            <p className="profileV12__lead">Verwalte getrennte Spielerprofile, ohne Trainingsstände zu vermischen. XP, Level, Skill-Werte und adaptive Trainingsdaten bleiben eindeutig dem aktiven Profil zugeordnet.</p>
          </div>

          <aside className="profileV12__cloud">
            <span>Optional · geräteübergreifend</span>
            <strong>Cloud-Sync</strong>
            <p>Lokale Profile funktionieren ohne Konto. Für mehrere Geräte kannst du zusätzlich einen privaten Cloud-Zugang mit Kontoname und Passwort verwenden.</p>
            <Link href="/account">Konto & Cloud-Sync →</Link>
          </aside>
        </header>

        <div className="profileV12__privacy">
          <span aria-hidden="true">🔒</span>
          <div><b>Datenschutz zuerst.</b> Für Spielerzugänge wird keine E-Mail-Adresse benötigt. Ein lokales Profil bleibt vollständig auf diesem Gerät, solange du Cloud-Sync nicht aktivierst.</div>
        </div>

        <div className="profileV12__manager">
          <PlayerProfileManager />
        </div>
      </section>
    </main>
  );
}
