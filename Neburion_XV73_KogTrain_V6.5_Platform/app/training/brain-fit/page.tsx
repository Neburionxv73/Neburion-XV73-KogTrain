import Link from "next/link";
import { BrainFitTraining } from "@/components/BrainFitTraining";

export const metadata = {
  title: "Gehirnfit & Alltag · Learning Expansion 3.7.5",
  description: "Zugängliches Gehirntraining mit acht Bereichen, variierenden Inhalten, adaptiver Schwierigkeit und Integration in Progress & Coach.",
};

export default function BrainFitPage(){
  return <main className="trainingPage">
    <div className="trainingTopbar">
      <Link className="backLink" href="/">← Zur Plattform</Link>
      <span>Learning Expansion 3.7.5 · Gehirnfit & Alltag</span>
    </div>
    <BrainFitTraining />
  </main>;
}
