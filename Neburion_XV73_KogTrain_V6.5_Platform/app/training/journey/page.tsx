import Link from "next/link";
import { UnifiedTrainingJourney } from "@/components/UnifiedTrainingJourney";

export const metadata = {
  title: "Heute trainieren · Unified Training Journey 3.8",
  description: "Zentraler Trainingsstart mit 5-, 10- und 15-Minuten-Modi, persönlichem Lernmix, Spezial-Labs, Gehirnfit und Coach-Empfehlung.",
};

export default function JourneyPage(){
  return <main className="trainingPage">
    <div className="trainingTopbar">
      <Link className="backLink" href="/">← Zur Plattform</Link>
      <span>Learning Expansion 3.8 · Unified Training Journey</span>
    </div>
    <UnifiedTrainingJourney />
  </main>;
}
