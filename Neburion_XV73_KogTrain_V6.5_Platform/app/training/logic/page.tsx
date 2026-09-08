import { LogicTraining } from "@/components/LogicTraining";
import { BilingualLabIntro, BilingualTrainingDisclaimer } from "@/components/BilingualLabIntro";
import { LabViewportStyle } from "@/components/LabViewportStyle";
import { TrainingTopbar } from "@/components/TrainingTopbar";

export const metadata = { title: "Logic Lab 2.5 · Adaptive Difficulty V5", description: "Adaptive logic training / Adaptives Logiktraining mit Zahlenreihen, Regelketten, Analogien, Schlussfolgerungen, Matrizen, Operatoren und Raumlogik." };

export default function LogicPage() {
  return <main className="trainingPage labPage">
    <LabViewportStyle />
    <TrainingTopbar href="/#training" backDe="Trainingswelten" backEn="Training worlds" titleDe="Logic Lab 2.5 · Adaptive Difficulty V5" titleEn="Logic Lab 2.5 · Adaptive Difficulty V5" />
    <section className="trainingShell">
      <BilingualLabIntro eyebrow="Logic Lab 2.5 · Adaptive Difficulty V5" titleDe="Regeln erkennen. Schlüsse ziehen. Probleme lösen." titleEn="Identify rules. Draw conclusions. Solve problems." bodyDe="Acht dynamische Aufgaben kombinieren Zahlenreihen, Regelketten, Analogien, Schlussfolgerungen, Matrizen, Operatorlogik, Ausschlussaufgaben und räumliches Denken. Das Startniveau basiert auf deinem bisherigen Training und passt sich innerhalb der Session schrittweise an." bodyEn="Eight dynamic tasks combine number sequences, rule chains, analogies, deductions, matrices, operator logic, exclusion tasks and spatial reasoning. The starting level is based on your previous training and adapts gradually within the session." />
      <LogicTraining />
      <BilingualTrainingDisclaimer />
    </section>
  </main>;
}
