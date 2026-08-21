import Link from "next/link";
import { AttentionTraining } from "@/components/AttentionTraining";

export const metadata = {
  title: "Attention Lab 2.0 · Neburion XV73 V6.5",
  description: "Dynamisches Aufmerksamkeitstraining mit Regelwechsel, Reaktionshemmung, visueller Suche und adaptivem Tempo.",
};

export default function AttentionLabPage() {
  return (
    <main className="trainingPage">
      <div className="trainingTopbar">
        <Link className="backLink" href="/#training">← Trainingswelten</Link>
        <span>Attention Lab 2.0 · V6.5</span>
      </div>
      <section className="trainingShell" aria-labelledby="attention-title">
        <div className="trainingIntro">
          <p className="eyebrow">Attention Lab 2.0</p>
          <h1 id="attention-title">Fokus halten. Regeln wechseln. Störreize kontrollieren.</h1>
          <p>Acht dynamische Aufgaben kombinieren Go/No-Go, visuelle Suche, Regelwechsel, Reaktionshemmung, geteilte Aufmerksamkeit, Tempo und Interferenz. Jede Session wird neu zusammengestellt und an deinen bisherigen Bestwert angepasst.</p>
        </div>
        <AttentionTraining />
        <p className="trainingDisclaimer">Dieses Training dient Lern- und Übungszwecken und stellt keine medizinische Diagnose oder Behandlung dar.</p>
      </section>
    </main>
  );
}
