import type { Metadata } from "next";
import "./globals.css";
import "./learning-theme.css";
import "./button-system.css";
import "./raptor-v97-ui.css";
import "./final-polish-378.css";
import "./anti-ai-look-v97.css";
import "./anti-ai-final-humanization.css";
import "./clean-palette-v97.css";
import "./responsive-a11y-v97.css";
import "./brainfit-functional-hardening.css";
import "./interaction-finish-v97.css";

export const metadata: Metadata = {
  title: "Neburion XV73 · Lern- und Trainingsplattform V6.5",
  description: "Individuelle Lern- und Trainingsplattform mit Mathematik, Sprache, Englisch, Aufmerksamkeit, Reaktion, Gedächtnis, Logik, visuellen Übungen und einem zentralen Trainingsstart.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="de"><body><a className="skipLink" href="#top">Direkt zum Inhalt</a>{children}</body></html>;
}
