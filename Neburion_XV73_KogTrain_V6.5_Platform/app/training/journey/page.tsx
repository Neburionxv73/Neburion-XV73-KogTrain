import type { Metadata } from "next";
import { UnifiedTrainingJourney } from "@/components/UnifiedTrainingJourney";
import { TrainingTopbar } from "@/components/TrainingTopbar";

export const metadata: Metadata = {
  title: "Heute trainieren · Adaptive Training Journey V4",
  description: "Adaptive 10-, 20- und 30-Minuten-Trainingsjourney mit Coach-Prioritäten aus echten lokal gespeicherten Fortschrittsdaten.",
  alternates: { canonical: "/training/journey" },
};

export default function JourneyPage(){
  return <main className="trainingPage">
    <TrainingTopbar
      titleDe="Learning Expansion 4.0 · Adaptive Training Journey V4"
      titleEn="Learning Expansion 4.0 · Adaptive Training Journey V4"
    />
    <UnifiedTrainingJourney />
  </main>;
}
