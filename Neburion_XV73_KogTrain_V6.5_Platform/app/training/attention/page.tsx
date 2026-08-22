import Link from "next/link";
import { AttentionTraining } from "@/components/AttentionTraining";

export const metadata = {
  title: "Attention Lab 2.0 · Neburion XV73 V6.5",
  description: "Dynamisches Aufmerksamkeitstraining mit Regelwechsel, Reaktionshemmung, visueller Suche und adaptivem Tempo.",
};

export default function AttentionLabPage() {
  return (
    <main className="trainingPage attentionPage">
      <style>{`
        .attentionPage .trainingTopbar {
          position: sticky;
          top: 0;
          z-index: 20;
          background: color-mix(in srgb, var(--bg) 94%, transparent);
          backdrop-filter: blur(18px);
        }
        .attentionPage .trainingShell {
          padding-top: clamp(64px, 7vw, 92px);
        }
        .attentionPage .trainingIntro {
          scroll-margin-top: 104px;
          margin-bottom: 44px;
        }
        .attentionPage .trainingIntro h1 {
          max-width: 900px;
          line-height: .98;
          text-wrap: balance;
        }
        .attentionPage .trainingIntro > p:last-child {
          margin-bottom: 0;
        }
        @media (max-width: 1024px) {
          .attentionPage .trainingShell { padding-top: 64px; }
          .attentionPage .trainingIntro { scroll-margin-top: 92px; margin-bottom: 38px; }
          .attentionPage .trainingIntro h1 { line-height: 1.02; }
        }
        @media (max-width: 640px) {
          .attentionPage .trainingTopbar { min-height: 68px; }
          .attentionPage .trainingShell { padding-top: 48px; }
          .attentionPage .trainingIntro { scroll-margin-top: 82px; margin-bottom: 32px; }
          .attentionPage .trainingIntro h1 { line-height: 1.06; }
        }
      `}</style>
      <div className="trainingTopbar">
        <Link className="backLink" href="/#training">← Trainingswelten</Link>
        <span>Attention Lab 2.0 · V6.5</span>
      </div>
      <section className="trainingShell" aria-labelledby="attention-title">
        <div className="trainingIntro" id="attention-start">
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
