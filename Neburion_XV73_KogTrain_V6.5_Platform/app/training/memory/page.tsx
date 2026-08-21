import Link from "next/link";
import { MemoryTraining } from "@/components/MemoryTraining";

export const metadata = {
  title: "Memory Lab 2.0 · Neburion XV73 V6.5",
  description: "Multimodales Gedächtnistraining mit Zahlen, Wörtern, Symbolen, Raumpositionen, Wiedererkennung und N-Back.",
};

export default function MemoryLabPage() {
  return (
    <main className="trainingPage">
      <div className="trainingTopbar">
        <Link href="/" className="backLink">← Plattform</Link>
        <span>Memory Lab 2.0 · V6.5</span>
      </div>
      <MemoryTraining />
    </main>
  );
}
