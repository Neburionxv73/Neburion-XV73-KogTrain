import type { Metadata } from "next";
import Link from "next/link";
import { BrainFitClient } from "@/components/BrainFitClient";

export const metadata: Metadata = {
  title: "Gehirnfit & Alltag · Neburion XV73 V6.6",
  description: "Vollständiger, zugänglicher Gehirnfit-Bereich mit zwölf Trainingswelten, Tagesmix, adaptiver Schwierigkeit, Fortschritt und ruhiger UX.",
  alternates: { canonical: "/training/brain-fit" },
};

export default function BrainFitPage(){
  return <main className="trainingPage">
    <div className="trainingTopbar">
      <Link className="backLink" href="/">← Zur Plattform</Link>
      <span>Neburion XV73 · V6.6 · Gehirnfit & Alltag</span>
    </div>
    <BrainFitClient />
  </main>;
}
