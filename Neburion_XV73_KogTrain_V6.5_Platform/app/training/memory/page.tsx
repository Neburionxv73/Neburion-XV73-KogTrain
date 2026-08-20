import Link from "next/link";
import { MemoryTraining } from "@/components/MemoryTraining";

export const metadata = {
  title: "Memory Lab · Neburion XV73 V6.5",
  description: "Interaktives Sequenztraining im Memory Lab der Neburion XV73 Trainingsplattform.",
};

export default function MemoryLabPage() {
  return (
    <main className="trainingPage">
      <div className="trainingTopbar">
        <Link href="/" className="backLink">← Plattform</Link>
        <span>Neburion XV73 · V6.5</span>
      </div>
      <MemoryTraining />
    </main>
  );
}
