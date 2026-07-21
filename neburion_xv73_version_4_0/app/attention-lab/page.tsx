import { AppShell } from "@/components/layout/AppShell";
import { AttentionLab } from "@/components/training/AttentionLab";

export const metadata = { title: "Attention Lab | Neburion XV73" };

export default function AttentionLabPage() {
  return <AppShell sidebar>
    <div className="panel attention-lab-hero">
      <span className="eyebrow">Beta 2.2 · Attention Lab</span>
      <h1>Fokus, Reaktion und Reizkontrolle in einer Trainingswelt.</h1>
      <p className="lead">Fünf Übungsfamilien trainieren selektive Aufmerksamkeit, Reaktionskontrolle, Farbkonflikte, visuelle Suche und Doppelregeln. Ergebnisse werden transparent gespeichert und in der Progress Engine ausgewertet.</p>
      <div className="memory-principles">
        <div><strong>5</strong><span>Übungsfamilien</span></div>
        <div><strong>5</strong><span>Schwierigkeitsstufen</span></div>
        <div><strong>Live</strong><span>Reaktionsmessung</span></div>
      </div>
    </div>
    <AttentionLab />
  </AppShell>;
}
