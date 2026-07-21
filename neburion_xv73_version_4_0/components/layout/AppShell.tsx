import Link from "next/link";
import type { ReactNode } from "react";
import { AccessibilityControls } from "@/components/layout/AccessibilityControls";
import { SideNavigation, TopNavigation } from "@/components/layout/Navigation";
import { PwaExperience } from "@/components/pwa/PwaExperience";

export function AppShell({ children, sidebar = false }: { children: ReactNode; sidebar?: boolean }) {
  return <div className="shell">
    <a className="skip-link" href="#main-content">Zum Inhalt springen</a>
    <PwaExperience/><div className="ambient" aria-hidden="true"><div className="orb one"/><div className="orb two"/><div className="ribbon"/></div>
    <header className="topbar"><div className="container topbar-inner">
      <Link href="/" className="brand" aria-label="Neburion XV73 Startseite"><span className="brand-mark" aria-hidden="true">N</span><span>NEBURION XV73</span></Link>
      <TopNavigation />
      <AccessibilityControls />
    </div></header>
    {sidebar
      ? <div className="container layout"><aside className="sidebar"><span className="sidebar-label">PLATTFORM</span><SideNavigation /></aside><main id="main-content" className="content" tabIndex={-1}>{children}</main></div>
      : <main id="main-content" tabIndex={-1}>{children}</main>}
    <footer className="footer"><div className="container"><strong>Neburion XV73</strong><span>Kognitives Lernsystem · Training ersetzt keine medizinische Diagnose oder Therapie.</span><span className="release-chip">Version 4.0 · Platform Release</span></div></footer>
  </div>;
}
