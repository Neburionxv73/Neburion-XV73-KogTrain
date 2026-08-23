import Link from "next/link";
import { BrainFitTraining } from "@/components/BrainFitTraining";

export const metadata = {
  title: "Gehirnfit & Alltag · Learning Expansion 3.7",
  description: "Ruhiges, zugängliches Gehirntraining mit Tier-Sudoku, Wortsuchraster, Kreuzworträtsel und Memory.",
};

export default function BrainFitPage(){
  return <main className="trainingPage">
    <div className="trainingTopbar">
      <Link className="backLink" href="/">← Zur Plattform</Link>
      <span>Learning Expansion 3.7 · Gehirnfit & Alltag</span>
    </div>
    <BrainFitTraining />
  </main>;
}
