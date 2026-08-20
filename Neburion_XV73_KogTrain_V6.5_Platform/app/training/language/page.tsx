import Link from "next/link";
import { LanguageTraining } from "@/components/LanguageTraining";

export default function LanguagePage() {
  return (
    <main className="trainingPage">
      <div className="trainingTopbar">
        <Link className="backLink" href="/#training">← Trainingswelten</Link>
        <span>Language Lab · V6.5</span>
      </div>
      <section className="trainingShell">
        <header className="trainingIntro">
          <p className="eyebrow">Language Lab</p>
          <h1>Sprache verstehen. Begriffe verbinden.</h1>
          <p>Sechs Aufgaben trainieren Wortbedeutung, Begriffszuordnung, Analogien und sprachliche Muster. Dein Ergebnis ist ein Trainingswert und keine medizinische Diagnose.</p>
        </header>
        <LanguageTraining />
      </section>
    </main>
  );
}
