import { VisualTraining } from "@/components/VisualTraining";
import { BilingualLabIntro, BilingualTrainingDisclaimer } from "@/components/BilingualLabIntro";
import { LabViewportStyle } from "@/components/LabViewportStyle";
import { TrainingTopbar } from "@/components/TrainingTopbar";

export const metadata = { title: "Visual Lab 2.0 · Neburion XV73 V6.6", description: "Adaptive visual training / Adaptives visuelles Training mit Rotation, Spiegelung, Musterreihen, Matrizen, Positionswechseln, visueller Suche, Formvergleich und Kurzzeitgedächtnis." };

export default function VisualPage() {
  return <main className="trainingPage labPage">
    <LabViewportStyle />
    <TrainingTopbar href="/#training" backDe="Trainingswelten" backEn="Training worlds" titleDe="Visual Lab 2.0 · V6.6" titleEn="Visual Lab 2.0 · V6.6" />
    <section className="trainingShell">
      <BilingualLabIntro eyebrow="Visual Lab 2.0" titleDe="Sehen. Vergleichen. Erinnern. Räumlich denken." titleEn="See. Compare. Remember. Think spatially." bodyDe="Acht dynamische Aufgaben kombinieren Rotation, Spiegelung, Musterreihen, Matrizen, Positionswechsel, visuelle Suche, Formvergleich und visuelles Kurzzeitgedächtnis. Die Schwierigkeit passt sich an deinen bisherigen Bestwert an." bodyEn="Eight dynamic tasks combine rotation, reflection, pattern sequences, matrices, position shifts, visual search, shape comparison and visual short-term memory. Difficulty adapts to your previous performance." />
      <VisualTraining />
      <BilingualTrainingDisclaimer />
    </section>
  </main>;
}
