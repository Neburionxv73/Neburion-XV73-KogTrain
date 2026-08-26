import Link from "next/link";
import { MemoryTraining } from "@/components/MemoryTraining";
import { LabViewportStyle } from "@/components/LabViewportStyle";

export const metadata = {
  title: "Memory Lab 2.0 · Neburion XV73 V6.6",
  description: "Multimodales Gedächtnistraining mit Zahlen, Wörtern, Symbolen, Raumpositionen, Wiedererkennung und N-Back.",
};

export default function MemoryLabPage() {
  return (
    <main className="trainingPage labPage">
      <LabViewportStyle />
      <div className="trainingTopbar">
        <Link href="/#training" className="backLink">← Trainingswelten</Link>
        <span>Memory Lab 2.0 · V6.6</span>
      </div>
      <section className="trainingShell">
        <MemoryTraining />
      </section>
    </main>
  );
}
