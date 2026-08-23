import type { Metadata } from "next";
import "./globals.css";
import "./learning-theme.css";
import "./button-system.css";
import "./raptor-v97-ui.css";
import "./final-polish-378.css";

export const metadata: Metadata = {
  title: "Neburion XV73 · Lern- und Trainingsplattform V6.5",
  description: "Individuelle Lern- und Trainingsplattform mit Mathematik, Sprache, Englisch, Aufmerksamkeit, Reaktion, Gedächtnis, Logik, visuellen Übungen und Unified Training Journey.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="de"><body>{children}</body></html>;
}
