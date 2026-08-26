import Link from "next/link";
import { VisualTraining } from "@/components/VisualTraining";
import { LabViewportStyle } from "@/components/LabViewportStyle";

export const metadata = {
  title: "Visual Lab 2.0 · Neburion XV73 V6.6",
  description: "Adaptives visuelles Training mit Rotation, Spiegelung, Musterreihen, Matrizen, Positionswechseln, visueller Suche, Formvergleich und Kurzzeitgedächtnis.",
};

export default function VisualPage() {
  return (
    <main className="trainingPage labPage">
      <LabViewportStyle />
      <div className="trainingTopbar">
        <Link className="backLink" href="/#training">← Trainingswelten</Link>
        <span>Visual Lab 2.0 · V6.6</span>
      </div>
      <section className="trainingShell">
        <header className="trainingIntro">
          <p className="eyebrow">Visual Lab 2.0</p>
          <h1>Sehen. Vergleichen. Erinnern. Räumlich denken.</h1>
          <p>Acht dynamische Aufgaben kombinieren Rotation, Spiegelung, Musterreihen, Matrizen, Positionswechsel, visuelle Suche, Formvergleich und visuelles Kurzzeitgedächtnis. Die Schwierigkeit passt sich an deinen bisherigen Bestwert an.</p>
        </header>
        <VisualTraining />
        <p className="trainingDisclaimer">Dieses Training dient Lern- und Übungszwecken und stellt keine medizinische Diagnose oder Behandlung dar.</p>
      </section>
    </main>
  );
}
