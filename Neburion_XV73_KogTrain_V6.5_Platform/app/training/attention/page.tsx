import { AttentionTraining } from "@/components/AttentionTraining";

export default function AttentionLabPage() {
  return (
    <main className="trainingPage">
      <section className="trainingShell" aria-labelledby="attention-title">
        <div className="trainingIntro">
          <p className="eyebrow">Attention Lab · Selektive Aufmerksamkeit</p>
          <h1 id="attention-title">Reagiere nur auf den Zielreiz.</h1>
          <p>Drücke bei <strong>◆</strong> so schnell wie möglich. Ignoriere alle anderen Symbole. Die Übung misst Treffer, Fehlalarme, verpasste Zielreize und Reaktionszeit.</p>
        </div>
        <AttentionTraining />
        <p className="trainingDisclaimer">Dieses Training dient Lern- und Übungszwecken und stellt keine medizinische Diagnose oder Behandlung dar.</p>
      </section>
    </main>
  );
}
