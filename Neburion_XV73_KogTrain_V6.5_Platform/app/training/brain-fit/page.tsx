import Link from "next/link";
import { BrainFitTraining } from "@/components/BrainFitTraining";
import { BrainFitCompletionPanel } from "@/components/BrainFitCompletionPanel";

export const metadata = {
  title: "Gehirnfit & Alltag · Neburion XV73 V6.6",
  description: "Vollständiger, zugänglicher Gehirnfit-Bereich mit zwölf Trainingswelten, Tagesmix, adaptiver Schwierigkeit, Fortschritt und ruhiger UX.",
};

export default function BrainFitPage(){
  return <main className="trainingPage">
    <div className="trainingTopbar">
      <Link className="backLink" href="/">← Zur Plattform</Link>
      <span>Neburion XV73 · V6.6 · Gehirnfit & Alltag</span>
    </div>
    <BrainFitTraining />
    <BrainFitCompletionPanel />
  </main>;
}
