import { AttentionTraining } from "@/components/AttentionTraining";
import { BilingualLabIntro, BilingualTrainingDisclaimer } from "@/components/BilingualLabIntro";
import { LabViewportStyle } from "@/components/LabViewportStyle";
import { TrainingTopbar } from "@/components/TrainingTopbar";

export const metadata = { title: "Attention Lab 2.0 · Neburion XV73 V6.6", description: "Dynamic attention training / Dynamisches Aufmerksamkeitstraining mit Regelwechsel, Reaktionshemmung, visueller Suche und adaptivem Tempo." };

export default function AttentionLabPage() {
  return <main className="trainingPage labPage">
    <LabViewportStyle />
    <TrainingTopbar href="/#training" backDe="Trainingswelten" backEn="Training worlds" titleDe="Attention Lab 2.0 · V6.6" titleEn="Attention Lab 2.0 · V6.6" />
    <section className="trainingShell" aria-labelledby="attention-title">
      <BilingualLabIntro eyebrow="Attention Lab 2.0" titleId="attention-title" titleDe="Fokus halten. Regeln wechseln. Störreize kontrollieren." titleEn="Maintain focus. Switch rules. Control distractions." bodyDe="Acht dynamische Aufgaben kombinieren Go/No-Go, visuelle Suche, Regelwechsel, Reaktionshemmung, geteilte Aufmerksamkeit, Tempo und Interferenz. Jede Session wird neu zusammengestellt und an deinen bisherigen Bestwert angepasst." bodyEn="Eight dynamic tasks combine Go/No-Go, visual search, rule switching, response inhibition, divided attention, speed and interference. Every session is newly assembled and adapted to your previous performance." />
      <AttentionTraining />
      <BilingualTrainingDisclaimer />
    </section>
  </main>;
}
