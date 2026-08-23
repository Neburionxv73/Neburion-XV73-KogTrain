import Link from "next/link";
import { LanguageTraining } from "@/components/LanguageTraining";
import { LabViewportStyle } from "@/components/LabViewportStyle";

export const metadata = {
  title: "Language Lab 2.0 · Neburion XV73 V6.5",
  description: "Adaptives Sprachtraining mit Synonymen, Antonymen, Analogien, Kategorien, Wortfeldern, Satzlogik, Bedeutungsbeziehungen und Kontextverständnis.",
};

export default function LanguagePage() {
  return (
    <main className="trainingPage labPage">
      <LabViewportStyle />
      <div className="trainingTopbar">
        <Link className="backLink" href="/#training">← Trainingswelten</Link>
        <span>Language Lab 2.0 · V6.5</span>
      </div>
      <section className="trainingShell">
        <header className="trainingIntro">
          <p className="eyebrow">Language Lab 2.0</p>
          <h1>Wörter verstehen. Beziehungen erkennen. Kontext deuten.</h1>
          <p>Acht dynamische Aufgaben kombinieren Synonyme, Antonyme, Analogien, Kategorien, Wortfelder, Satzlogik, Bedeutungsbeziehungen und Kontextverständnis. Varianten und Schwierigkeitsstufe passen sich an deinen bisherigen Bestwert an.</p>
        </header>
        <LanguageTraining />
        <p className="trainingDisclaimer">Dieses Training dient Lern- und Übungszwecken und stellt keine medizinische Diagnose oder Behandlung dar.</p>
      </section>
    </main>
  );
}
