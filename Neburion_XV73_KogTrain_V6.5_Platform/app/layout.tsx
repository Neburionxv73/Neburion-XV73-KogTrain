import type { Metadata, Viewport } from "next";
import { PlayerStorageBridge } from "@/components/PlayerStorageBridge";
import { CloudPlayerBridge } from "@/components/CloudPlayerBridge";
import { PlatformLanguageProvider } from "@/components/PlatformLanguageProvider";
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
import "./brainfit-samsung-portrait-fix.css";
import "./interaction-finish-v97.css";
import "./performance-baseline-v97.css";
import "./a11y-contrast-final-v97.css";
import "./raptor-v103-clean-foundation.css";
import "./v11-readability.css";
import "./v11-dashboard-lighthouse.css";
import "./training-visual-clarity-v12.css";

const isProduction = process.env.VERCEL_ENV === "production";
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : undefined);

export const metadata: Metadata = {
  metadataBase: siteUrl ? new URL(siteUrl) : undefined,
  title: { default: "Neburion XV73 · KogTrain V12", template: "%s · Neburion XV73" },
  applicationName: "Neburion XV73 KogTrain",
  description: "Bilingual learning and cognitive training platform / Zweisprachige Lern- und Trainingsplattform mit Mathematik, Sprache, Englisch, Aufmerksamkeit, Reaktion, Gedächtnis, Logik, visuellen Übungen und Gehirnfit & Alltag.",
  keywords: ["KogTrain", "Lernplattform", "learning platform", "Gedächtnistraining", "memory training", "Aufmerksamkeit", "attention", "Logiktraining", "logic training", "Sprachtraining", "language training", "Gehirnfit", "brain training"],
  category: "education",
  robots: isProduction ? { index: true, follow: true } : { index: false, follow: false },
  openGraph: { type: "website", locale: "de_AT", alternateLocale: ["en_US"], siteName: "Neburion XV73 KogTrain", title: "Neburion XV73 · KogTrain V12", description: "Bilingual personal learning mix with separate player profiles, cloud saves, specialist labs and brain training." },
};

export const viewport: Viewport = { width: "device-width", initialScale: 1, colorScheme: "light", themeColor: "#F8FAFC" };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="de"><body><PlatformLanguageProvider><PlayerStorageBridge /><CloudPlayerBridge /><a className="skipLink" href="#main-content">Direkt zum Inhalt / Skip to content</a><div id="main-content" tabIndex={-1}>{children}</div></PlatformLanguageProvider></body></html>;
}
