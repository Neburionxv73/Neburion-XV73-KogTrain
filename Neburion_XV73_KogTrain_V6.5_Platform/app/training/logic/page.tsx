import Link from "next/link";
import { LogicTraining } from "@/components/LogicTraining";

export default function LogicPage() {
  return (
    <main className="trainingPage">
      <div className="trainingTopbar">
        <Link className="backLink" href="/#training">← Trainingswelten</Link>
        <span>Logic Lab · V6.5</span>
      </div>
      <section className="trainingShell">
        <header className="trainingIntro">
          <p className="eyebrow">Logic Lab</p>
          <h1>Muster erkennen. Regeln verstehen.</h1>
          <p>Sechs Aufgaben trainieren Zahlenfolgen, Regelverständnis, Symbolmuster und logische Schlussfolgerungen. Dein Ergebnis ist ein Trainingswert und keine medizinische Diagnose.</p>
        </header>
        <LogicTraining />
      </section>
    </main>
  );
}
