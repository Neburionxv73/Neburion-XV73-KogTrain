import type { Metadata } from "next";
import Link from "next/link";
import { FocusTraining31 } from "@/components/FocusTraining31";

export const metadata: Metadata = {
  title: "Persönlicher Lernmix · Fokus auswählen",
  description: "Persönlichen Trainingsfokus auswählen und aus mehreren Lernbereichen eine klare, zusammenhängende Einheit zusammenstellen.",
  alternates: { canonical: "/training/focus" },
};

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
