import Link from "next/link";
import { LogicTraining } from "@/components/LogicTraining";
import { LabViewportStyle } from "@/components/LabViewportStyle";

export const metadata = {
  title: "Logic Lab 2.5 · Adaptive Difficulty V5",
  description: "Adaptives Logiktraining mit Zahlenreihen, Regelketten, Analogien, Schlussfolgerungen, Matrizen, Operatoren und Raumlogik.",
};

export default function LogicPage() {
  return (
    <main className="trainingPage labPage">
      <LabViewportStyle />
      <div className="trainingTopbar">
        <Link className="backLink" href="/#training">← Trainingswelten</Link>
        <span>Logic Lab 2.5 · Adaptive Difficulty V5</span>
      </div>
      <section className="trainingShell">
        <header className="trainingIntro">
          <p className="eyebrow">Logic Lab 2.5 · Adaptive Difficulty V5</p>
          <h1>Regeln erkennen. Schlüsse ziehen. Probleme lösen.</h1>
          <p>Acht dynamische Aufgaben kombinieren Zahlenreihen, Regelketten, Analogien, Schlussfolgerungen, Matrizen, Operatorlogik, Ausschlussaufgaben und räumliches Denken. Das Startniveau basiert auf deinem bisherigen Training und passt sich innerhalb der Session schrittweise an.</p>
        </header>
        <LogicTraining />
        <p className="trainingDisclaimer">Dieses Training dient Lern- und Übungszwecken und stellt keine medizinische Diagnose oder Behandlung dar.</p>
      </section>
    </main>
  );
}
