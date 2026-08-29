import type { Metadata } from "next";
import Link from "next/link";
import { AccountPanel } from "@/components/AccountPanel";

export const metadata: Metadata = {
  title: "Konto & Cloud-Spielstand · KogTrain V6.7",
  description: "KogTrain-Konto für geräteübergreifenden Lernfortschritt und Cloud-Spielstände.",
  robots: { index: false, follow: false },
};

export default function AccountPage() {
  return <main className="trainingPage">
    <div className="trainingTopbar"><Link className="backLink" href="/profile">← Zu den Spielerprofilen</Link><span>KogTrain V6.7 · Cloud Accounts</span></div>
    <section style={{ width: "min(900px, calc(100% - 2rem))", margin: "4rem auto 6rem" }}>
      <p style={{ fontWeight: 900, letterSpacing: ".1em", textTransform: "uppercase", color: "#087f82" }}>V6.7 · Account & Sync</p>
      <h1 style={{ fontSize: "clamp(2.8rem,7vw,5.5rem)", lineHeight: 1, margin: ".5rem 0 1rem" }}>Dein Spielstand auf jedem Gerät.</h1>
      <p style={{ fontSize: "1.1rem", lineHeight: 1.7, color: "#425d6d", marginBottom: "2rem" }}>Mit einem Konto werden XP, Sessions, Skill-Werte und adaptive Lerndaten serverseitig gespeichert. Nach der Anmeldung wird der Cloud-Spielstand auf diesem Gerät geladen und danach regelmäßig synchronisiert.</p>
      <AccountPanel />
    </section>
  </main>;
}
