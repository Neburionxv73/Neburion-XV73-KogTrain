import { MemoryTraining } from "@/components/MemoryTraining";
import { LabViewportStyle } from "@/components/LabViewportStyle";
import { TrainingTopbar } from "@/components/TrainingTopbar";

export const metadata = {
  title: "Memory Lab 2.5 · KogTrain V12",
  description: "Multimodal memory training / Multimodales Gedächtnistraining mit Zahlen, Wörtern, Symbolen, Raumpositionen, Wiedererkennung und N-Back.",
};

export default function MemoryLabPage() {
  return (
    <main className="trainingPage labPage">
      <LabViewportStyle />
      <TrainingTopbar href="/#training" backDe="Trainingswelten" backEn="Training worlds" titleDe="Memory Lab 2.5 · Adaptive Difficulty V5" titleEn="Memory Lab 2.5 · Adaptive Difficulty V5" />
      <section className="trainingShell"><MemoryTraining /></section>
    </main>
  );
}
