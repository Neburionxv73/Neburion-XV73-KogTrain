import Link from "next/link";
import { LogicTraining2 } from "@/components/LogicTraining2";
import { LabViewportStyle } from "@/components/LabViewportStyle";

export const metadata = {
  title: "Logic Lab 2.0 · Neburion XV73 V6.5",
  description: "Dynamisches Logiktraining mit Zahlenreihen, Regelketten, Analogien, Schlussfolgerungen, Matrizen, Operatoren und Raumlogik.",
};

export default function LogicPage() {
  return (
    <main className="trainingPage labPage">
      <LabViewportStyle />
      <div className="trainingTopbar">
        <Link className="backLink" href="/#training">← Trainingswelten</Link>
        <span>Logic Lab 2.0 · V6.5</span>
      </div>
      <section className="trainingShell">
        <header className="trainingIntro">
          <p className="eyebrow">Logic Lab 2.0</p>
          <h1>Regeln erkennen. Schlüsse ziehen. Probleme lösen.</h1>
          <p>Acht dynamische Aufgaben kombinieren Zahlenreihen, Regelketten, Analogien, Schlussfolgerungen, Matrizen, Operatorlogik, Ausschlussaufgaben und räumliches Denken. Schwierigkeit und Inhalte passen sich an deinen bisherigen Bestwert an.</p>
        </header>
        <LogicTraining2 />
        <p className="trainingDisclaimer">Dieses Training dient Lern- und Übungszwecken und stellt keine medizinische Diagnose oder Behandlung dar.</p>
      </section>
    </main>
  );
}
