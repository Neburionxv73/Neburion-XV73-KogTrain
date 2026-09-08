import type { Metadata } from "next";
import { FocusTraining31 } from "@/components/FocusTraining31";
import { FocusEnglishBridge } from "@/components/FocusEnglishBridge";
import { TrainingTopbar } from "@/components/TrainingTopbar";
import { UnifiedTrainingCoach } from "@/components/UnifiedTrainingCoach";

export const metadata: Metadata = {
  title: "Persönlicher Lernmix · Fokus auswählen",
  description: "Persönlichen Trainingsfokus auswählen und aus mehreren Lernbereichen eine klare, zusammenhängende Einheit zusammenstellen.",
  alternates: { canonical: "/training/focus" },
};

export default function FocusTrainingPage() {
  return (
    <main className="trainingPage">
      <TrainingTopbar
        href="/training/journey"
        backDe="Zur Training Journey"
        backEn="Back to Training Journey"
        titleDe="Learning Expansion 3.6 · Persönlicher Lernmix"
        titleEn="Learning Expansion 3.6 · Personal learning mix"
      />
      <FocusEnglishBridge><FocusTraining31 /></FocusEnglishBridge>
      <UnifiedTrainingCoach />
    </main>
  );
}
