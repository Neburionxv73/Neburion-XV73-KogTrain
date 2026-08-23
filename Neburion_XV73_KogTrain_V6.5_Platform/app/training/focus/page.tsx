import Link from "next/link";
import { FocusTraining31 } from "@/components/FocusTraining31";

export default function FocusTrainingPage() {
  return (
    <main className="trainingPage">
      <div className="trainingTopbar">
        <Link className="backLink" href="/training/journey">← Zur Training Journey</Link>
        <span>Learning Expansion 3.8 · Persönlicher Lernmix</span>
      </div>
      <FocusTraining31 />
    </main>
  );
}
