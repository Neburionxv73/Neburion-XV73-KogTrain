import Link from "next/link";
import { VisualTraining } from "@/components/VisualTraining";

export default function VisualPage() {
  return (
    <main className="trainingPage">
      <div className="trainingTopbar">
        <Link className="backLink" href="/#training">← Trainingswelten</Link>
        <span>Visual Lab · V6.5</span>
      </div>
      <section className="trainingShell">
        <header className="trainingIntro">
          <p className="eyebrow">Visual Lab</p>
          <h1>Sehen. Drehen. Erkennen.</h1>
          <p>Acht dynamische Aufgaben trainieren Musterfortsetzung, Rotation, Spiegelung, Raumlage, Abweichungen und Formvergleich. Jede Session wird neu zusammengestellt und passt die Schwierigkeit an deinen bisherigen Bestwert an.</p>
        </header>
        <VisualTraining />
      </section>
    </main>
  );
}
