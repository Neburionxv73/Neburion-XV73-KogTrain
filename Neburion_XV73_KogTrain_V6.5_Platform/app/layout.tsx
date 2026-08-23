import type { Metadata, Viewport } from "next";
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
import "./performance-baseline-v97.css";
import "./a11y-contrast-final-v97.css";

const isProduction = process.env.VERCEL_ENV === "production";
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : undefined);

export const metadata: Metadata = {
  metadataBase: siteUrl ? new URL(siteUrl) : undefined,
  title: {
    default: "Neburion XV73 · Lern- und Trainingsplattform V6.5",
    template: "%s · Neburion XV73",
  },
  applicationName: "Neburion XV73 KogTrain",
  description: "Individuelle Lern- und Trainingsplattform mit Mathematik, Sprache, Englisch, Aufmerksamkeit, Reaktion, Gedächtnis, Logik, visuellen Übungen und einem zentralen Trainingsstart.",
  keywords: ["KogTrain", "Lernplattform", "Gedächtnistraining", "Aufmerksamkeit", "Logiktraining", "Sprachtraining", "Gehirnfit"],
  category: "education",
  alternates: siteUrl ? { canonical: "/" } : undefined,
  robots: isProduction ? { index: true, follow: true } : { index: false, follow: false },
  openGraph: {
    type: "website",
    locale: "de_AT",
    siteName: "Neburion XV73 KogTrain",
    title: "Neburion XV73 · Lern- und Trainingsplattform V6.5",
    description: "Lernen, Spezial-Labs und Gehirnfit in einer klaren Trainingsplattform.",
    url: siteUrl ? "/" : undefined,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  colorScheme: "light",
  themeColor: "#f7f9fc",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="de"><body><a className="skipLink" href="#top">Direkt zum Inhalt</a>{children}</body></html>;
}
