import type { Metadata } from "next";
import Link from "next/link";
import { PlayerProfileManager } from "@/components/PlayerProfileManager";

export const metadata: Metadata = {
  title: "Spielerprofile · KogTrain V6.7",
  description: "Eigene Spielerprofile mit getrennten Lernständen, XP und Trainingsfortschritten verwalten.",
  robots: { index: false, follow: false },
};

export default function ProfilePage() {
  return (
    <main className="trainingPage">
      <div className="trainingTopbar">
        <Link className="backLink" href="/">← Zur Plattform</Link>
        <span>KogTrain V6.7 · Multi-User Foundation</span>
      </div>
      <section style={{ width: "min(1180px, calc(100% - 2rem))", margin: "4rem auto 6rem" }}>
        <p style={{ fontWeight: 900, letterSpacing: ".1em", textTransform: "uppercase", color: "#087f82" }}>V6.7 · Spielerprofile</p>
        <h1 style={{ fontSize: "clamp(2.8rem, 7vw, 6rem)", lineHeight: ".98", maxWidth: "12ch", margin: ".5rem 0 1.5rem" }}>Dein Lernen. Dein Spielstand.</h1>
        <p style={{ fontSize: "1.1rem", lineHeight: 1.7, maxWidth: "68ch", marginBottom: "3rem", color: "#425d6d" }}>Jedes Profil erhält einen getrennten lokalen Lernstand. Beim Wechsel werden die Trainingsdaten des aktuellen Profils gesichert und ausschließlich die Daten des gewählten Profils geladen.</p>
        <PlayerProfileManager />
      </section>
    </main>
  );
}
