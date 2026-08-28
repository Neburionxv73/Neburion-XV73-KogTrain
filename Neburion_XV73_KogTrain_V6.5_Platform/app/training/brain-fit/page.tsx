import type { Metadata } from "next";
import Link from "next/link";
import { BrainFitClient } from "@/components/BrainFitClient";

export const metadata: Metadata = {
  title: "Gehirnfit & Alltag · Neburion XV73 V6.7",
  description: "Vollständiger, zugänglicher Gehirnfit-Bereich mit zwölf Trainingswelten, Tagesmix, adaptiver Schwierigkeit, Fortschritt und ruhiger UX.",
  alternates: { canonical: "/training/brain-fit" },
};

export default function BrainFitPage(){
  return <main className="trainingPage brainFitMobileGuard">
    <div className="trainingTopbar">
      <Link className="backLink" href="/">← Zur Plattform</Link>
      <span>Neburion XV73 · V6.7 · Gehirnfit & Alltag</span>
    </div>
    <BrainFitClient />
    <style>{`
      @media (max-width: 640px) {
        .brainFitMobileGuard [class*="wordLayout"] {
          width: 100%;
          min-width: 0;
        }
        .brainFitMobileGuard [class*="wordGridWrap"] {
          width: 100%;
          max-width: 100%;
          min-width: 0;
          overflow-x: visible;
          padding-inline: 0;
        }
        .brainFitMobileGuard [class*="wordGrid"] {
          width: 100%;
          max-width: 100%;
          min-width: 0 !important;
          grid-template-columns: repeat(10, minmax(0, 1fr));
          gap: 3px;
        }
        .brainFitMobileGuard [class*="wordCell"] {
          width: 100%;
          min-width: 0 !important;
          min-height: 0 !important;
          aspect-ratio: 1;
          padding: 0;
          border-radius: 6px;
          font-size: clamp(12px, 4vw, 16px);
          touch-action: manipulation;
        }
        .brainFitMobileGuard [class*="wordList"] {
          width: 100%;
          min-width: 0;
        }
        .brainFitMobileGuard [class*="panel"] {
          max-width: 100%;
        }
        .brainFitMobileGuard .bfCrosswordWrap {
          width: 100%;
          max-width: 100%;
          overflow-x: auto;
          overscroll-behavior-inline: contain;
          -webkit-overflow-scrolling: touch;
        }
        .brainFitMobileGuard .bfCrosswordGrid {
          width: max-content;
          max-width: none;
        }
      }
      @media (max-width: 390px) {
        .brainFitMobileGuard [class*="wordGrid"] { gap: 2px; }
        .brainFitMobileGuard [class*="wordCell"] {
          border-radius: 5px;
          font-size: 13px;
        }
      }
      @supports (padding: max(0px)) {
        @media (max-width: 640px) {
          .brainFitMobileGuard { padding-bottom: env(safe-area-inset-bottom); }
        }
      }
    `}</style>
  </main>;
}
