import type { Metadata } from "next";
import Link from "next/link";
import { UnifiedTrainingJourney } from "@/components/UnifiedTrainingJourney";

export const metadata: Metadata = {
  title: "Heute trainieren · Adaptive Training Journey V4",
  description: "Adaptive 10-, 20- und 30-Minuten-Trainingsjourney mit Coach-Prioritäten aus echten lokal gespeicherten Fortschrittsdaten.",
  alternates: { canonical: "/training/journey" },
};

export default function JourneyPage(){
  return <main className="trainingPage">
    <div className="trainingTopbar">
      <Link className="backLink" href="/">← Zur Plattform</Link>
      <span>Learning Expansion 4.0 · Adaptive Training Journey V4</span>
    </div>
    <UnifiedTrainingJourney />
  </main>;
}
