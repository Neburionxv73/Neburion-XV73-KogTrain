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
import "./raptor-v103-clean-foundation.css";

const isProduction = process.env.VERCEL_ENV === "production";
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : undefined);

export const metadata: Metadata = {
  metadataBase: siteUrl ? new URL(siteUrl) : undefined,
  title: {
    default: "Neburion XV73 · KogTrain V6.6",
    template: "%s · Neburion XV73",
  },
  applicationName: "Neburion XV73 KogTrain",
  description: "Freundlich gestaltete Lern- und Trainingsplattform mit Mathematik, Sprache, Englisch, Aufmerksamkeit, Reaktion, Gedächtnis, Logik, visuellen Übungen und Gehirnfit & Alltag.",
  keywords: ["KogTrain", "Lernplattform", "Gedächtnistraining", "Aufmerksamkeit", "Logiktraining", "Sprachtraining", "Gehirnfit"],
  category: "education",
  alternates: siteUrl ? { canonical: "/" } : undefined,
  robots: isProduction ? { index: true, follow: true } : { index: false, follow: false },
  openGraph: {
    type: "website",
    locale: "de_AT",
    siteName: "Neburion XV73 KogTrain",
    title: "Neburion XV73 · KogTrain V6.6",
    description: "Persönlicher Lernmix, Spezial-Labs und Gehirnfit in einer klaren, freundlichen Trainingsplattform.",
    url: siteUrl ? "/" : undefined,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  colorScheme: "light",
  themeColor: "#F8FAFC",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="de"><body><a className="skipLink" href="#main-content">Direkt zum Inhalt</a><div id="main-content" tabIndex={-1}>{children}</div></body></html>;
}
