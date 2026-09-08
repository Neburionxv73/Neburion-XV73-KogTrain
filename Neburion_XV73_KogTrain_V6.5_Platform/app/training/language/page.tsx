import { LanguageTraining } from "@/components/LanguageTraining";
import { BilingualLabIntro, BilingualTrainingDisclaimer } from "@/components/BilingualLabIntro";
import { LabViewportStyle } from "@/components/LabViewportStyle";
import { TrainingTopbar } from "@/components/TrainingTopbar";

export const metadata = { title: "Language Lab 2.0 · Neburion XV73 V6.6", description: "Adaptive language training / Adaptives Sprachtraining mit Synonymen, Antonymen, Analogien, Kategorien, Wortfeldern, Satzlogik, Bedeutungsbeziehungen und Kontextverständnis." };

export default function LanguagePage() {
  return <main className="trainingPage labPage">
    <LabViewportStyle />
    <TrainingTopbar href="/#training" backDe="Trainingswelten" backEn="Training worlds" titleDe="Language Lab 2.0 · V6.6" titleEn="Language Lab 2.0 · V6.6" />
    <section className="trainingShell">
      <BilingualLabIntro eyebrow="Language Lab 2.0" titleDe="Wörter verstehen. Beziehungen erkennen. Kontext deuten." titleEn="Understand words. Identify relations. Interpret context." bodyDe="Acht dynamische Aufgaben kombinieren Synonyme, Antonyme, Analogien, Kategorien, Wortfelder, Satzlogik, Bedeutungsbeziehungen und Kontextverständnis. Varianten und Schwierigkeitsstufe passen sich an deinen bisherigen Bestwert an." bodyEn="Eight dynamic tasks combine synonyms, antonyms, analogies, categories, semantic fields, sentence logic, meaning relations and contextual understanding. Variants and difficulty adapt to your previous performance." />
      <LanguageTraining />
      <BilingualTrainingDisclaimer />
    </section>
  </main>;
}
